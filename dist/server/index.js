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
exports.getTradesViewModel = exports.getTradeType = exports.HTTP_STATUSES = exports.app = void 0;
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
const db = {
    table: [
        {
            id: 1,
            name: 'btc',
            amount: '0.003',
            buyprice: '20800',
            sellprice: '',
            fee: 0.01,
            singlefee: false,
        },
        {
            id: 2,
            name: 'btc',
            amount: '0.003',
            buyprice: '21500',
            sellprice: '',
            fee: 0.01,
            singlefee: false,
        },
        {
            id: 3,
            name: 'btc',
            amount: '0.003',
            buyprice: '19800',
            sellprice: '',
            fee: 0.01,
            singlefee: false,
        },
        {
            id: 4,
            name: 'ltc',
            amount: '1',
            buyprice: '71',
            sellprice: '',
            fee: 0.01,
            singlefee: false,
        },
        {
            id: 5,
            name: 'ltc',
            amount: '1',
            buyprice: '75',
            sellprice: '',
            fee: 0.01,
            singlefee: false,
        },
    ],
};
const getTradeType = (trade, id) => {
    const blankNewTrade = ['', '', '', '', 0.01, false];
    const [name, amount, buyprice, sellprice, fee, singlefee] = trade || blankNewTrade;
    const newTrade = {
        id: id || +new Date(),
        name,
        amount,
        buyprice,
        sellprice,
        fee,
        singlefee,
    };
    return newTrade;
};
exports.getTradeType = getTradeType;
const getTradesViewModel = (table) => {
    return table.map(t => [t.name, t.amount, t.buyprice, t.sellprice, t.fee, t.singlefee, t.id]);
};
exports.getTradesViewModel = getTradesViewModel;
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
        const { rows } = yield client.query('SELECT * FROM trade');
        const dbmapped = rows.map((t) => ((t.id = +t.id), t));
        db.table = dbmapped;
        res.json((0, exports.getTradesViewModel)(dbmapped));
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
        const dbres = yield client.query('insert into trade (fee, singleFee) values (0.01, true)  RETURNING *');
        console.log(typeof dbres.rows[0].id);
        const newTrade = (0, exports.getTradeType)(undefined, +dbres.rows[0].id);
        db.table.push(newTrade);
        res.status(exports.HTTP_STATUSES.CREATED_201).json({ id: +dbres.rows[0].id });
        client.release();
    }
    catch (err) {
        console.error(err);
        res.sendStatus(exports.HTTP_STATUSES.INTERNAL_SERVER_ERROR_500);
    }
}));
exports.app.post('/api/scalping/db/:id', (req, res) => {
    const duplicatedTrade = db.table.find((t) => t.id === +req.params.id);
    if (!duplicatedTrade) {
        res.sendStatus(exports.HTTP_STATUSES.NOT_FOUND_404);
        return;
    }
    ;
    const duplicatedTradeIndex = db.table.indexOf(duplicatedTrade);
    const newTrade = Object.assign(Object.assign({}, duplicatedTrade), { id: +new Date });
    db.table.splice(duplicatedTradeIndex + 1, 0, newTrade);
    res.status(exports.HTTP_STATUSES.CREATED_201).json({ id: newTrade.id });
});
exports.app.put('/api/scalping/db/:id', (req, res) => {
    if (!req.body.trade) {
        res.sendStatus(exports.HTTP_STATUSES.BAD_REQUEST_400);
        return;
    }
    const editedTrade = db.table.find((t) => t.id === +req.params.id);
    if (!editedTrade) {
        res.sendStatus(exports.HTTP_STATUSES.NOT_FOUND_404);
        return;
    }
    const editedTradeIndex = db.table.indexOf(editedTrade);
    const newTrade = (0, exports.getTradeType)(req.body.trade, +req.params.id);
    db.table[editedTradeIndex] = newTrade;
    res.sendStatus(exports.HTTP_STATUSES.NO_CONTENT_204);
});
exports.app.delete('/api/scalping/db/:id', (req, res) => {
    const tableAfterDelete = db.table.filter((t) => t.id !== +req.params.id);
    if (tableAfterDelete.length + 1 === db.table.length) {
        db.table = tableAfterDelete;
    }
    else {
        res.sendStatus(exports.HTTP_STATUSES.BAD_REQUEST_400);
        return;
    }
    res.sendStatus(exports.HTTP_STATUSES.NO_CONTENT_204);
});
/** clear db for tests */
exports.app.delete('/__test__/data', (req, res) => {
    db.table = [];
    res.sendStatus(exports.HTTP_STATUSES.NO_CONTENT_204);
});
exports.app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});
