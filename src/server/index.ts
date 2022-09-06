import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

app.use('/css', express.static('css'));
app.use('/script', express.static('script'));
/*
app.get('/', (req: Request, res: Response) => {
  res.sendFile(path.resolve(__dirname + '/../index.html'));
});
*/
const PAGES = [
  'cryptoBalancer',
  'scalping',
]
app.get(['/','/:path'], (req: Request<{path: string}>, res: Response<HTMLBaseElement>) => {
  if (!req.params.path) {
    res.sendFile(path.resolve(__dirname + '/../index.html'));
    return;
  };

  if (PAGES.includes(req.params.path)) {
    res.sendFile(path.resolve(__dirname + `/../${req.params.path}.html`));
    return;
  };

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