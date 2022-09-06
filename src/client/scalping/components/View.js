export default class View {
  constructor({ columns, text }) {
    this.columns = columns;
    this.text = text;
    this.lng = localStorage.getItem('lng') || 'en';
    this.app = document.querySelector('.main');
    this.table = this.createElement('table', 'table');
    this.headRow = this.createHead();

    this.addButton = this.createElement(
      'button',
      'addNew',
      this.text.addNewButton[this.lng]
    );
    this.saveButton = this.createElement(
      'button',
      'save',
      this.text.saveButton[this.lng]
    );
    this.pasteButton = this.createElement(
      'button',
      'paste',
      this.text.pasteButton[this.lng]
    );
    this.resetButton = this.createElement(
      'button',
      'reset',
      this.text.resetButton[this.lng]
    );
    this.recalculateButton = this.createElement(
      'button',
      'recalculate',
      this.text.recalculateButton[this.lng]
    );

    this.table.append(this.headRow);
    this.app.append(
      this.table,
      this.addButton,
      this.saveButton,
      this.pasteButton,
      this.resetButton,
      this.recalculateButton
    );
  }

  // Create an element with an optional CSS class and inner text
  createElement(tag, className, innerText) {
    const element = document.createElement(tag);
    if (className) element.classList.add(className);
    if (innerText) element.innerText = innerText;

    return element;
  }

  createHead() {
    const headRow = this.createElement('tr', 'head');
    for (const key in this.columns) {
      if (key === 'name') continue;
      const th = this.createElement('th', false, this.columns[key][this.lng]);
      headRow.append(th);
    }
    return headRow;
  }

  displayTrades(trades = []) {
    while (this.table.children.length > 1) {
      this.table.removeChild(this.table.lastChild);
    }

    if (trades.length === 0) return;
    let id = 0;

    for (const trade of trades) {
      const tr = this.createElement('tr'),
        name = this.createElement('input', 'name');

      for (const column in this.columns) {
        if (column === 'name') continue;
        const td = this.createElement('td');
        const input = this.createElement('input', column);

        input.type = this.columns[column].type;
        input.readOnly = this.columns[column].readonly;
        input.value = trade[column] || '';

        td.append(input);
        tr.append(td);
      }

      if (id === 0 || trade.name !== trades[id - 1].name) {
        name.value = trade.name || '';
        tr.firstChild.prepend(name);
        tr.firstChild.style.width = '110px';
      }
      const tdButtons = this.createElement('td');
      const delButton = this.createElement('button', 'delete', 'X');
      const duplicateButton = this.createElement(
        'button',
        'duplicate',
        this.text.cloneButton[this.lng]
      );

      tdButtons.append(duplicateButton, delButton);
      tr.append(tdButtons);
      this.table.append(tr);
      tr.id = id++;
    }
  }

  updateTradeOnInput(id, trades) {
    const tr = document.getElementById(id);
    const updatedValues = ['spent', 'recieved', 'diff'];
    for (const value of updatedValues) {
      if (trades[id][value]) {
        tr.querySelector(`.${value}`).value = trades[id][value];
      }
    }
  }
}
