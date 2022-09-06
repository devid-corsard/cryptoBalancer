"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT;
app.use('/css', express_1.default.static('css'));
app.use('/script', express_1.default.static('script'));
/*
app.get('/', (req: Request, res: Response) => {
  res.sendFile(path.resolve(__dirname + '/../index.html'));
});
*/
const PAGES = [
    'cryptoBalancer',
    'scalping',
];
app.get(['/', '/:path'], (req, res) => {
    if (!req.params.path) {
        res.sendFile(path_1.default.resolve(__dirname + '/../index.html'));
        return;
    }
    ;
    if (PAGES.includes(req.params.path)) {
        res.sendFile(path_1.default.resolve(__dirname + `/../${req.params.path}.html`));
        return;
    }
    ;
    res.sendStatus(404);
});
/*
app.get('/scalping', (req: Request, res: Response) => {
  res.sendFile(path.resolve(__dirname + '/../scalping.html'));
});

app.get('/cryptoBalancer', (req: Request, res: Response) => {
  res.sendFile(path.resolve(__dirname + '/../cryptoBalancer.html'));
});
*/
app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});
