import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import { UpdateTradeModel } from './models/UpdateTradeModel';
import { DublicateTradeModel } from './models/DublicateTradeModel';
import { DeleteTradeModel } from './models/DeleteTradeModel';
import path from 'path';
import { TradeViewModel } from './models/TradeViewModel';
import { Pool } from 'pg';
import { SingleTradeModel } from './models/SingleTradeModel';

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
let dbTable = 'trade'
const SQL = {
    GET_ALL: `SELECT id, name, amount, buy_price, sell_price, fee, single_fee FROM ${dbTable} ORDER BY view_order`,
    INSERT_NEW: `INSERT INTO ${dbTable} (fee, single_fee, view_order) VALUES (0.01, true, $1) RETURNING id`,
    DELETE_BY_ID: `DELETE FROM ${dbTable} WHERE ID = $1`,
    UPDATE_EXISTING: `UPDATE ${dbTable} SET (name, amount, buy_price, sell_price, fee, single_fee) = ($1, $2, $3, $4, $5, $6) WHERE id = $7`,
    GET_MAX_VIEW_ORDER: `SELECT MAX(view_order) as max_view_order FROM ${dbTable}`,
    SELECT_BY_ID: `SELECT name, amount, buy_price, sell_price, fee, single_fee, view_order FROM ${dbTable} WHERE id = $1`,
    UPDATE_ALL_VIEW_ORDER: `UPDATE ${dbTable} SET view_order = view_order + 1 WHERE view_order > $1`,
    INSERT_WITH_DATA: `INSERT INTO ${dbTable} (name, amount, buy_price, sell_price, fee, single_fee, view_order) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
};

export const getTradesViewModel = (table: any[]): TradeViewModel[] => {
    return table.map((t) => [t.name, +t.amount, +t.buy_price, +t.sell_price, +t.fee, t.single_fee, +t.id]);
};

const getSingleTrade = (trade: any): SingleTradeModel => {
    return [trade.name, trade.amount, trade.buy_price, trade.sell_price, trade.fee, trade.single_fee];
};

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // ssl: {
    //   rejectUnauthorized: false,
    // },
});

app.use(express.static('dist/client/static'));

app.use(express.json());

app.get(['/', '/:path'], (req: Request<{ path: string }>, res: Response<HTMLBaseElement>) => {
    if (!req.params.path) {
        res.sendFile(path.resolve(__dirname + '/../client/index.html'));
        return;
    }

    if (PAGES.includes(req.params.path)) {
        res.sendFile(path.resolve(__dirname + `/../client/${req.params.path}.html`));
        return;
    }

    res.sendStatus(404);
});

app.get('/api/scalping/db', async (req, res: Response<TradeViewModel[]>) => {
    try {
        const client = await pool.connect();
        const { rows } = await client.query(SQL.GET_ALL);
        res.json(getTradesViewModel(rows));
        client.release();
    } catch (err) {
        console.error(err);
        res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500);
    }
});

app.post('/api/scalping/db', async (req, res: Response<{ id: number }>) => {
    try {
        const client = await pool.connect();
        const {
            rows: [{ max_view_order }],
        } = await client.query(SQL.GET_MAX_VIEW_ORDER);
        const {
            rows: [{ id }],
        } = await client.query(SQL.INSERT_NEW, [max_view_order + 1]);

        res.status(HTTP_STATUSES.CREATED_201).json({ id: +id });
        client.release();
    } catch (err) {
        console.error(err);
        res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500);
    }
});


/** UPDATE TRADE */
app.put('/api/scalping/db/:id', async (req: Request<{ id: string }, never, UpdateTradeModel>, res) => {
    if (!req.body.trade) {
        res.sendStatus(HTTP_STATUSES.BAD_REQUEST_400);
        return;
    }

    try {
        const client = await pool.connect();
        const { rows } = await client.query(SQL.SELECT_BY_ID, [+req.params.id])
        if (!rows.length) {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
            return;
        }
    } catch (err) {
        console.error(err);
        res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500);
    }

    try {
        const client = await pool.connect();
        await client.query(SQL.UPDATE_EXISTING, [...req.body.trade, +req.params.id]);
        client.release();
    } catch (err) {
        console.error(err);
        res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500);
    }
    res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
});

/** DUBLICATE TRADE */
app.post('/api/scalping/db/:id', async (req: Request<DublicateTradeModel>, res: Response<{ id: number }>) => {
    try {
        const client = await pool.connect();
        const {
            rows: [dubTrade],
        } = await client.query(SQL.SELECT_BY_ID, [+req.params.id]);
        if (!dubTrade) {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
            return;
        }

        const newTrade: SingleTradeModel = getSingleTrade(dubTrade);
        await client.query(SQL.UPDATE_ALL_VIEW_ORDER, [dubTrade.view_order]);
        const {
            rows: [{ id }],
        } = await client.query(SQL.INSERT_WITH_DATA, [...newTrade, dubTrade.view_order + 1]);

        res.status(HTTP_STATUSES.CREATED_201).json({ id: +id });
        client.release();
    } catch (err) {
        console.error(err);
        res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500);
    }
});

app.delete('/api/scalping/db/:id', async (req: Request<DeleteTradeModel>, res) => {
    try {
        const client = await pool.connect();
        await client.query(SQL.DELETE_BY_ID, [+req.params.id]);
        client.release();
    } catch (err) {
        console.error(err);
        res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500);
    }

    res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
});

/** clear db for tests */
app.delete('/__test__/data', (req, res) => {
    // dbTable = 'trade_empty_for_tests';
    res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
});

app.listen(port, () => {
    console.log(`⚡️[server]: Listening on port: ${port}`);
});
