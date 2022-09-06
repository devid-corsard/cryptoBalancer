import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import { CreateTradeModel } from './models/CreateTradeModel';
import { UpdateTradeModel } from './models/UpdateTradeModel';
import { SingleTradeModel } from './models/SingleTradeModel';

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

const PAGES = ['cryptoBalancer', 'scalping'];

export const HTTP_STATUSES = {
  OK_200: 200,
  CREATED_201: 201,
  NO_CONTENT_204: 204,

  BAD_REQUEST_400: 400,
  NOT_FOUND_404: 404,
};

type TradeType = {
  id: number;
  name: string;
  amount: string;
  buyPrice: string;
  sellPrice: string;
  fee: number;
  singleFee: boolean;
};

const db: { table: TradeType[] } = {
  table: [
    {
      id: 1,
      name: 'btc',
      amount: '0.003',
      buyPrice: '20800',
      sellPrice: '',
      fee: 0.01,
      singleFee: false,
    },
    {
      id: 2,
      name: 'btc',
      amount: '0.003',
      buyPrice: '21500',
      sellPrice: '',
      fee: 0.01,
      singleFee: false,
    },
    {
      id: 3,
      name: 'btc',
      amount: '0.003',
      buyPrice: '19800',
      sellPrice: '',
      fee: 0.01,
      singleFee: false,
    },
    {
      id: 4,
      name: 'ltc',
      amount: '1',
      buyPrice: '71',
      sellPrice: '',
      fee: 0.01,
      singleFee: false,
    },
    {
      id: 5,
      name: 'ltc',
      amount: '1',
      buyPrice: '75',
      sellPrice: '',
      fee: 0.01,
      singleFee: false,
    },
  ],
};

const getTradeType = (trade: SingleTradeModel, id?: number): TradeType => {
  const [name, amount, buyPrice, sellPrice, fee, singleFee] = trade;

  const newTrade: TradeType = {
    id: id || +new Date(),
    name,
    amount,
    buyPrice,
    sellPrice,
    fee,
    singleFee,
  };

  return newTrade;
};

app.use(express.static('dist/client/static'));

app.use(express.json());

app.get(
  ['/', '/:path'],
  (req: Request<{ path: string }>, res: Response<HTMLBaseElement>) => {
    if (!req.params.path) {
      res.sendFile(__dirname + '/client/index.html');
      return;
    }

    if (PAGES.includes(req.params.path)) {
      res.sendFile(__dirname + `/client/${req.params.path}.html`);
      return;
    }

    res.sendStatus(404);
  }
);

app.get('/api/scalping/db', (req, res: Response<TradeType[]>) => {
  console.log('got req from front');
  res.json(db.table);
});

app.post(
  '/api/scalping/db',
  (req: Request<never, never, CreateTradeModel>, res) => {
    if (!req.body.trade) {
      res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
      return;
    }

    const newTrade: TradeType = getTradeType(req.body.trade);

    db.table.push(newTrade);

    res.sendStatus(HTTP_STATUSES.CREATED_201);
    // db.table.concat(req.body.table)
  }
);

app.put(
  '/api/scalping/db/:id',
  (req: Request<{ id: string }, never, UpdateTradeModel>, res) => {
    if (!req.body.trade) {
      res.sendStatus(HTTP_STATUSES.BAD_REQUEST_400);
      return;
    }
    const editedTrade = db.table.find((t) => t.id === +req.params.id);

    if (!editedTrade) {
      res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
      return;
    }

    const editedTradeIndex = db.table.indexOf(editedTrade);

    const newTrade: TradeType = getTradeType(req.body.trade, +req.params.id);

    db.table[editedTradeIndex] = newTrade;
    res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
  }
);

app.delete('/api/scalping/db/:id', (req: Request<{ id: string }>, res) => {
  const tableAfterDelete = db.table.filter((t) => t.id !== +req.params.id);

  if (tableAfterDelete.length + 1 === db.table.length) {
    db.table = tableAfterDelete;
  } else {
    res.sendStatus(HTTP_STATUSES.BAD_REQUEST_400);
    return;
  }

  res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});
