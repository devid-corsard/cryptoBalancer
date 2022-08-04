import Trade from './Trade.js';

export default class Model {
  constructor() {
    this.trades = this.getFromLocalStorage();
  }

  getFromLocalStorage() {
    const parsedTrades = JSON.parse(localStorage.getItem('trades')) || [];
    if (parsedTrades.length === 0) {
      return [];
    } else {
      return parsedTrades.map((item) => new Trade(item));
    }
  }

  addNewTrade() {
    this.trades.push(new Trade());
  }

  editTrade(id, column, value) {
    this.trades[id][column] = value;
  }

  deleteTrade(id) {
    if (this.trades.length === 1) {
      this.trades.length = 0;
      return;
    }
    this.trades = this.trades.filter((item, index) => index !== id);
  }

  duplicateTrade(id) {
    this.trades = this.trades.reduce((res, cur, index) => {
      if (index === id) return res.concat([cur, new Trade(cur.toArray())]);
      return res.concat(cur);
    }, []);
  }

  saveToLocalStorage() {
    const arrayOfArrays = this.trades.map((trade) => trade.toArray());
    localStorage.setItem('trades', JSON.stringify(arrayOfArrays));
  }
}
