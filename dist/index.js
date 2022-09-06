"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HTTP_STATUSES = void 0;
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT;
const PAGES = ['cryptoBalancer', 'scalping'];
exports.HTTP_STATUSES = {
    OK_200: 200,
    CREATED_201: 201,
    NO_CONTENT_204: 204,
    BAD_REQUEST_400: 400,
    NOT_FOUND_404: 404,
};
const db = {
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
const getTradeType = (trade, id) => {
    const [name, amount, buyPrice, sellPrice, fee, singleFee] = trade;
    const newTrade = {
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
app.use(express_1.default.static('dist/client/static'));
app.use(express_1.default.json());
app.get(['/', '/:path'], (req, res) => {
    if (!req.params.path) {
        res.sendFile(__dirname + '/client/index.html');
        return;
    }
    if (PAGES.includes(req.params.path)) {
        res.sendFile(__dirname + `/client/${req.params.path}.html`);
        return;
    }
    res.sendStatus(404);
});
app.get('/api/scalping/db', (req, res) => {
    console.log('got req from front');
    res.json(db.table);
});
app.post('/api/scalping/db', (req, res) => {
    if (!req.body.trade) {
        res.sendStatus(exports.HTTP_STATUSES.NO_CONTENT_204);
        return;
    }
    const newTrade = getTradeType(req.body.trade);
    db.table.push(newTrade);
    res.sendStatus(exports.HTTP_STATUSES.CREATED_201);
    // db.table.concat(req.body.table)
});
app.put('/api/scalping/db/:id', (req, res) => {
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
    const newTrade = getTradeType(req.body.trade, +req.params.id);
    db.table[editedTradeIndex] = newTrade;
    res.sendStatus(exports.HTTP_STATUSES.NO_CONTENT_204);
});
app.delete('/api/scalping/db/:id', (req, res) => {
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
app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});
