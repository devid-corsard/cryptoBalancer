export default class Controller {
  constructor(model, view) {
    this.model = model;
    this.view = view;
    this.model.getTradesFromServer()
      .then(t => this.view.displayTrades(t));
    // this.view.displayTrades(this.model.trades);
    this.view.app.addEventListener('click', this.handleClicks);
    this.view.app.addEventListener('input', this.handleInput);

    this.checkLng();
    document.addEventListener('input', this.handleLngChange);
  }

  handleClicks = (e) => {
    const action = e.target.className;
    if (!action || e.target.tagName !== 'BUTTON') return;

    let id = +e.target.closest('tr')?.id;

    switch (action) {
      case 'addNew':
        this.model.addNewTrade();
        break;
      case 'duplicate':
        this.model.duplicateTrade(id);
        break;
      case 'delete':
        this.model.deleteTrade(id);
        break;
      case 'reset':
        this.resetTable();
        break;
      case 'recalculate':
        this.recalculateAll();
        break;
      case 'paste':
        this.pasteFromClipBoard();
        return;
      case 'save':
        this.saveToClipBoard();
      default:
        return;
    }
    this.view.displayTrades(this.model.trades);
    this.model.saveToLocalStorage();
  };

  handleInput = (e) => {
    const target = e.target;
    const id = +target.closest('tr').id;
    if (id || id === 0) {
      const column = target.className;
      const value = target.value;

      this.model.editTrade(id, column, value);

      if (column !== 'name') {
        this.view.updateTradeOnInput(id, this.model.trades);
      }
      this.model.saveToLocalStorage();
    }
  };

  handleLngChange = (e) => {
    if (e.target.id !== 'lng') return;
    localStorage.setItem('lng', e.target.value);
    location.reload();
  };

  checkLng = () => {
    const lng = localStorage.getItem('lng');
    if (!lng) return;
    document.getElementById('lng').value = lng;
  };

  recalculateAll = () => {
    this.view.displayTrades(this.model.trades);
    this.model.saveToLocalStorage();
  };

  saveToClipBoard = () => {
    navigator.clipboard.writeText(localStorage.getItem('trades'));
    alert(this.view.text.copyDone[this.view.lng]);
  };

  pasteFromClipBoard = () => {
    navigator.clipboard.readText().then((clipText) => {
      if (clipText[0] !== '[') {
        alert(this.view.text.wrongPaste[this.view.lng] + clipText);
      } else if (
        confirm(this.view.text.pasteWarning[this.view.lng] + clipText)
      ) {
        localStorage.setItem('trades', clipText);
        this.model.trades = this.model.getFromLocalStorage();
        this.view.displayTrades(this.model.trades);
      }
    });
  };

  resetTable = () => {
    if (confirm(this.view.text.resetWarning[this.view.lng])) {
      localStorage.removeItem('trades');
      this.model.trades = [];
    }
  };
}
