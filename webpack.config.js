const path = require('path');

module.exports = {
  entry: {
    scalping: './src/client/scalping/main.js',
    balancer: './src/client/balancer/cryptobalancer.js',
  },
  output: {
    filename: '[name].min.js',
    path: path.resolve(__dirname, 'script'),
  },
};
