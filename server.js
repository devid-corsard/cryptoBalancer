const http = require('http');
const fs = require('fs');

const PORT = process.env.PORT || 5005;

const readFile = (path) => {
  return new Promise((resolve, reject) => {
    fs.readFile(path, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
};

const server = http.createServer(async (req, res) => {
  if (req.method === 'GET') {
    switch (req.url) {
      case '/index.html':
      case '/': {
        const data = await readFile('index.html');
        res.write(data);
        res.end();
        break;
      }
      case '/css/style.css': {
        const data = await readFile('css/style.css');
        res.write(data);
        res.end();
        break;
      }
      case '/scalping.html': {
        const data = await readFile('scalping.html');
        res.write(data);
        res.end();
        break;
      }
      case '/script/scalping.min.js': {
        const data = await readFile('script/scalping.min.js');
        res.write(data);
        res.end();
        break;
      }
      case '/cryptoBalancer.html': {
        const data = await readFile('cryptoBalancer.html');
        res.write(data);
        res.end();
        break;
      }
      case '/script/balancer.min.js': {
        const data = await readFile('script/balancer.min.js');
        res.write(data);
        res.end();
        break;
      }
      default: {
        res.write('404, Not found');
        res.end();
      }
    }
  }
  if (req.method === 'POST') {
    /*
    query from front:
    fetch('http://localhost:5005/scalping.html', {
      method: 'post',
      heardes: {'content-type': 'application/json'},
      body: localStorage.trades
    }).then((d)=>console.log(d))
    */
    const chunks = [];

    req.on('data', (chunk) => chunks.push(chunk));

    req.on('end', () => {
      const data = Buffer.concat(chunks);
      console.log('Data: ', JSON.parse(data));
    });

    res.statusCode = 200;
    res.end();
  }
});

server.listen(PORT, () => console.log(`Listening on ${PORT}`));
