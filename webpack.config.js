const path = require('path');

module.exports = {
  entry: {
    scalping: './script_src/scalping/main.js',
    balancer: './script_src/balancer/cryptobalancer.js',
  },
  output: {
    filename: '[name].min.js',
    path: path.resolve(__dirname, 'script'),
  },
};
