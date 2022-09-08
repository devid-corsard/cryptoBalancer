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
    const newTrade = new Trade();
    this.trades.push(newTrade);
    fetch(location.origin + '/api/scalping/db', {method: 'POST'})
      .then((res) => res.json())
      .then((data) => {
        newTrade.id = data.id;
      });
  }

  editTrade(id, column, value) {
    const editedTrade = this.trades[id];
    editedTrade[column] = value;

    fetch(location.origin + '/api/scalping/db/' + editedTrade.id, {
      method: 'PUT',
      headers: {'content-type': 'application/json'},
      body: JSON.stringify({trade: editedTrade.toArray()})
    })
  }

  deleteTrade(id) {
    const deletedTrade = this.trades[id];

    this.trades = this.trades.filter((item, index) => index !== id);

    fetch(location.origin + '/api/scalping/db/' + deletedTrade.id, {
      method: 'delete',
    })
  }

  duplicateTrade(id) {
    const duplicatedTrade = this.trades[id];
    const newTrade = new Trade(duplicatedTrade.toArray());
    this.trades = this.trades.reduce((res, cur, index) => {
      if (index === id) return res.concat([cur, newTrade]);
      return res.concat(cur);
    }, []);

    fetch(location.origin + '/api/scalping/db/' + duplicatedTrade.id, {
      method: 'post',
    }).then((res) => res.json())
      .then((data) => {
        newTrade.id = data.id;
      });
  }

  saveToLocalStorage() {
    const arrayOfArrays = this.trades.map((trade) => trade.toArray());
    localStorage.setItem('trades', JSON.stringify(arrayOfArrays));
  }
}
