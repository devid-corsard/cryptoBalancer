import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import { UpdateTradeModel } from './models/UpdateTradeModel';
import { SingleTradeModel } from './models/SingleTradeModel';
import { DublicateTradeModel } from './models/DublicateTradeModel';
import { DeleteTradeModel } from './models/DeleteTradeModel';
import path from 'path';
import { TradeViewModel } from './models/TradeViewModel';
import { Pool } from 'pg';

dotenv.config();

export const app: Express = express();
const port = process.env.PORT;

const PAGES = ['cryptoBalancer', 'scalping'];

export const HTTP_STATUSES = {
  OK_200: 200,
  CREATED_201: 201,
  NO_CONTENT_204: 204,

  BAD_REQUEST_400: 400,
  NOT_FOUND_404: 404,

  INTERNAL_SERVER_ERROR_500: 500,
};

const SQL = {
  GET_ALL: 'SELECT * FROM trade ORDER BY view_order',
  INSERT_NEW: 'INSERT INTO trade (fee, single_fee) VALUES (0.01, true) RETURNING id',
  DELETE_BY_ID: 'DELETE FROM trade WHERE ID = $1::INT',
}

type TradeType = {
  id: number;
  name: string;
  amount: string;
  buy_price: string;
  sell_price: string;
  fee: number;
  single_fee: boolean;
};

const db: { table: TradeType[] } = {
  table: [
    {
      id: 1,
      name: 'btc',
      amount: '0.003',
      buy_price: '20800',
      sell_price: '',
      fee: 0.01,
      single_fee: false,
    },
    {
      id: 2,
      name: 'btc',
      amount: '0.003',
      buy_price: '21500',
      sell_price: '',
      fee: 0.01,
      single_fee: false,
    },
    {
      id: 3,
      name: 'btc',
      amount: '0.003',
      buy_price: '19800',
      sell_price: '',
      fee: 0.01,
      single_fee: false,
    },
    {
      id: 4,
      name: 'ltc',
      amount: '1',
      buy_price: '71',
      sell_price: '',
      fee: 0.01,
      single_fee: false,
    },
    {
      id: 5,
      name: 'ltc',
      amount: '1',
      buy_price: '75',
      sell_price: '',
      fee: 0.01,
      single_fee: false,
    },
  ],
};

export const getTradeType = (trade?: SingleTradeModel, id?: number): TradeType => {
  const blankNewTrade: SingleTradeModel = ['', '', '', '', 0.01, false];
  const [name, amount, buy_price, sell_price, fee, single_fee] = trade || blankNewTrade;

  const newTrade: TradeType = {
    id: id || +new Date(),
    name,
    amount,
    buy_price,
    sell_price,
    fee,
    single_fee,
  };

  return newTrade;
};

export const getTradesViewModel = (table: TradeType[]): TradeViewModel[] => {
  return table.map(t => [t.name, t.amount, t.buy_price, t.sell_price, t.fee, t.single_fee, t.id])
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // ssl: {
  //   rejectUnauthorized: false,
  // },
});


app.use(express.static('dist/client/static'));

app.use(express.json());

app.get(
  ['/', '/:path'],
  (req: Request<{ path: string }>, res: Response<HTMLBaseElement>) => {
    if (!req.params.path) {
      res.sendFile(path.resolve(__dirname + '/../client/index.html'));
      return;
    }

    if (PAGES.includes(req.params.path)) {
      res.sendFile(path.resolve(__dirname + `/../client/${req.params.path}.html`));
      return;
    }

    res.sendStatus(404);
  }
);

app.get('/api/scalping/db', async (req, res: Response<TradeViewModel[]>) => {
  try {
    const client = await pool.connect();
    const { rows } = await client.query(SQL.GET_ALL);
    const dbmapped: TradeType[] = rows.map((t) => ((t.id = +t.id), t));
    db.table = dbmapped;
    res.json(getTradesViewModel(dbmapped));
    client.release();
  } catch (err) {
    console.error(err);
    res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500);
  }
});

app.post('/api/scalping/db', async (req, res: Response<{ id: number }>) => {
  try {
    const client = await pool.connect();
    const { rows: [ { id: newTradeId } ] } = await client.query(SQL.INSERT_NEW);
    const newTrade: TradeType = getTradeType(undefined, +newTradeId);
    db.table.push(newTrade);
    res.status(HTTP_STATUSES.CREATED_201).json({id: +newTradeId});
    client.release();
  } catch (err) {
    console.error(err);
    res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500);
  }
});

app.post(
  '/api/scalping/db/:id',
  (req: Request<DublicateTradeModel>, res: Response<{id: number}>) => {
    const duplicatedTrade = db.table.find((t) => t.id === +req.params.id);

    if (!duplicatedTrade) {
      res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
      return;
    };

    const duplicatedTradeIndex = db.table.indexOf(duplicatedTrade);
    const newTrade: TradeType = { ...duplicatedTrade, id: +new Date };

    db.table.splice(duplicatedTradeIndex + 1, 0, newTrade);

    res.status(HTTP_STATUSES.CREATED_201).json({id: newTrade.id});
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

app.delete('/api/scalping/db/:id', async (req: Request<DeleteTradeModel>, res) => {
  const tableAfterDelete = db.table.filter((t) => t.id !== +req.params.id);

  if (tableAfterDelete.length + 1 === db.table.length) {
    db.table = tableAfterDelete;
    try {
      const client = await pool.connect();
      await client.query(SQL.DELETE_BY_ID, [+req.params.id]);
      client.release();
    } catch (err) {
      console.error(err);
      res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500);
    }
  } else {
    res.sendStatus(HTTP_STATUSES.BAD_REQUEST_400);
    return;
  }

  res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
});

/** clear db for tests */
app.delete('/__test__/data', (req, res) => {
  db.table = [];
  res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});
