import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

app.use(express.static('dist/client/static'));

const PAGES = [
  'cryptoBalancer',
  'scalping',
]
app.get(['/','/:path'], (req: Request<{path: string}>, res: Response<HTMLBaseElement>) => {
  if (!req.params.path) {
    res.sendFile(__dirname + '/client/index.html');
    return;
  };

  if (PAGES.includes(req.params.path)) {
    res.sendFile(__dirname + `/client/${req.params.path}.html`);
    return;
  };

  res.sendStatus(404);

});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});