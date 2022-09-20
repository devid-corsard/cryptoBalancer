"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTradesViewModel = exports.HTTP_STATUSES = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const pg_1 = require("pg");
dotenv_1.default.config();
exports.app = (0, express_1.default)();
const port = process.env.PORT;
const PAGES = ['cryptoBalancer', 'scalping'];
exports.HTTP_STATUSES = {
    OK_200: 200,
    CREATED_201: 201,
    NO_CONTENT_204: 204,
    BAD_REQUEST_400: 400,
    NOT_FOUND_404: 404,
    INTERNAL_SERVER_ERROR_500: 500,
};
let dbTable = 'trade';
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
const getTradesViewModel = (table) => {
    return table.map((t) => [t.name, +t.amount, +t.buy_price, +t.sell_price, +t.fee, t.single_fee, +t.id]);
};
exports.getTradesViewModel = getTradesViewModel;
const getSingleTrade = (trade) => {
    return [trade.name, trade.amount, trade.buy_price, trade.sell_price, trade.fee, trade.single_fee];
};
const pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL,
    // ssl: {
    //   rejectUnauthorized: false,
    // },
});
exports.app.use(express_1.default.static('dist/client/static'));
exports.app.use(express_1.default.json());
exports.app.get(['/', '/:path'], (req, res) => {
    if (!req.params.path) {
        res.sendFile(path_1.default.resolve(__dirname + '/../client/index.html'));
        return;
    }
    if (PAGES.includes(req.params.path)) {
        res.sendFile(path_1.default.resolve(__dirname + `/../client/${req.params.path}.html`));
        return;
    }
    res.sendStatus(404);
});
exports.app.get('/api/scalping/db', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const client = yield pool.connect();
        const { rows } = yield client.query(SQL.GET_ALL);
        res.json((0, exports.getTradesViewModel)(rows));
        client.release();
    }
    catch (err) {
        console.error(err);
        res.sendStatus(exports.HTTP_STATUSES.INTERNAL_SERVER_ERROR_500);
    }
}));
exports.app.post('/api/scalping/db', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const client = yield pool.connect();
        const { rows: [{ max_view_order }], } = yield client.query(SQL.GET_MAX_VIEW_ORDER);
        const { rows: [{ id }], } = yield client.query(SQL.INSERT_NEW, [max_view_order + 1]);
        res.status(exports.HTTP_STATUSES.CREATED_201).json({ id: +id });
        client.release();
    }
    catch (err) {
        console.error(err);
        res.sendStatus(exports.HTTP_STATUSES.INTERNAL_SERVER_ERROR_500);
    }
}));
exports.app.post('/api/scalping/db/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const client = yield pool.connect();
        const { rows: [dubTrade], } = yield client.query(SQL.SELECT_BY_ID, [+req.params.id]);
        if (!dubTrade) {
            res.sendStatus(exports.HTTP_STATUSES.NOT_FOUND_404);
            return;
        }
        const newTrade = getSingleTrade(dubTrade);
        yield client.query(SQL.UPDATE_ALL_VIEW_ORDER, [dubTrade.view_order]);
        const { rows: [{ id }], } = yield client.query(SQL.INSERT_WITH_DATA, [...newTrade, dubTrade.view_order + 1]);
        res.status(exports.HTTP_STATUSES.CREATED_201).json({ id: +id });
        client.release();
    }
    catch (err) {
        console.error(err);
        res.sendStatus(exports.HTTP_STATUSES.INTERNAL_SERVER_ERROR_500);
    }
}));
exports.app.put('/api/scalping/db/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.body.trade) {
        res.sendStatus(exports.HTTP_STATUSES.BAD_REQUEST_400);
        return;
    }
    try {
        const client = yield pool.connect();
        yield client.query(SQL.UPDATE_EXISTING, [...req.body.trade, +req.params.id]);
        client.release();
    }
    catch (err) {
        console.error(err);
        res.sendStatus(exports.HTTP_STATUSES.INTERNAL_SERVER_ERROR_500);
    }
    res.sendStatus(exports.HTTP_STATUSES.NO_CONTENT_204);
}));
exports.app.delete('/api/scalping/db/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const client = yield pool.connect();
        yield client.query(SQL.DELETE_BY_ID, [+req.params.id]);
        client.release();
    }
    catch (err) {
        console.error(err);
        res.sendStatus(exports.HTTP_STATUSES.INTERNAL_SERVER_ERROR_500);
    }
    res.sendStatus(exports.HTTP_STATUSES.NO_CONTENT_204);
}));
/** clear db for tests */
exports.app.delete('/__test__/data', (req, res) => {
    dbTable = 'trade_empty_for_tests';
    res.sendStatus(exports.HTTP_STATUSES.NO_CONTENT_204);
});
exports.app.listen(port, () => {
    console.log(`⚡️[server]: Listening on port: ${port}`);
});
