class Model {
  constructor() {
    this.deals = JSON.parse(localStorage.getItem("deals")) || [];
    this.fee = 0.01;
  }

  addNewDeal(dealData) {
    const deal = {};
    for (let key in dealData) {
      deal[key] = "";
    }
    this.deals.push(deal);
  }
  deleteDeal(id) {
    this.deals = this.deals.filter((item, index) => index !== id);
  }
  duplicateDeal(id) {
    const newDeals = [],
      last = this.deals.length - 1 - id === 0,
      clone = Object.assign({}, this.deals[id]);

    if (id === 0 && !last) {
      newDeals.push(this.deals[id]);
      newDeals.push(clone);
      newDeals.push(...this.deals.slice(1));
    } else if (last) {
      newDeals.push(...this.deals);
      newDeals.push(clone);
    } else {
      newDeals.push(...this.deals.slice(0, id));
      newDeals.push(clone);
      newDeals.push(...this.deals.slice(id));
    }
    this.deals = newDeals;
  }
  calculate(id, target) {
    const deal = this.deals[id];

    if (target) {
      const key = target.className;
      if (key === "name") {
        this.deals[id][key] = target.value;
      } else {
        deal[key] = +target.value;
      }
    }

    if (deal.buyPrice && deal.amount) {
      deal.spend = +(deal.buyPrice * deal.amount).toFixed(8);
    } else {
      deal.spend = "";
    }
    if (deal.sellPrice && deal.amount) {
      deal.recieved = +(deal.sellPrice * deal.amount * (1 - this.fee / 10) ** 2).toFixed(8);
    } else {
      deal.recieved = "";
    }
    if (deal.recieved && deal.spend) {
      deal.difference = +(deal.recieved - deal.spend).toFixed(8);
    } else {
      deal.difference = "";
    }
  }
  saveToLocalStorage() {
    localStorage.setItem("deals", JSON.stringify(this.deals));
  }
}

class View {
  constructor() {
    this.dealData = {
      name: {
        readonly: false,
        type: "text",
        en: "Coin Ticker",
        ua: "Тікер монети",
      },
      amount: {
        readonly: false,
        type: "number",
        en: "Amount",
        ua: "Кількість",
      },
      buyPrice: {
        readonly: false,
        type: "number",
        en: "Buy price",
        ua: "Ціна покупки",
      },
      spend: {
        readonly: true,
        type: "text",
        en: "$ spend",
        ua: "Витрачено $",
      },
      sellPrice: {
        readonly: false,
        type: "number",
        en: "Sell price",
        ua: "Ціна продажу",
      },
      recieved: {
        readonly: true,
        type: "text",
        en: "$ recieved",
        ua: "Отримано $",
      },
      difference: {
        readonly: true,
        type: "text",
        en: "Difference",
        ua: "Різниця",
      },
    };
    this.text = {
      cloneButton: {
        en: "Clone",
        ua: "Клон",
      },
      addNewButton: {
        en: "Add new",
        ua: "Додати",
      },
      saveButton: {
        en: "Save to clipboard",
        ua: "Зберегти в буфер обміну",
      },
      pasteButton: {
        en: "Paste data",
        ua: "Вставити з буферу",
      },
      resetButton: {
        en: "Reset all",
        ua: "Очистити все",
      },
      recalculateButton: {
        en: "Recalculate all",
        ua: "Перерахувати все",
      },
      copyDone: {
        en: "Data copied to clipboard. Paste it to a text file",
        ua: "Дані в буфері обміну. Вставте їх у текстовий файл",
      },
      pasteWarning: {
        en: "You really want to paste this?",
        ua: "Впевнені, що бажаєте вставити це?",
      },
      wrongPaste: {
        en: "Wrong data to paste:",
        ua: "Невірні дані для вставки:",
      },
      resetWarning: {
        en: "Reset all data in table?",
        ua: "Очистити всі дані в таблиці?",
      },
    };
    this.lng = localStorage.getItem("lng") || "en";
    this.app = this.getElement(".main");
    this.table = this.createElement("table", "table");
    this.headRow = this.createHead();
    

    this.addButton = this.createElement(
      "button",
      "addNew",
      this.text.addNewButton[this.lng]
    );
    this.saveButton = this.createElement(
      "button",
      "save",
      this.text.saveButton[this.lng]
    );
    this.pasteButton = this.createElement(
      "button",
      "paste",
      this.text.pasteButton[this.lng]
    );
    this.resetButton = this.createElement(
      "button",
      "reset",
      this.text.resetButton[this.lng]
    );
    this.recalculateButton = this.createElement(
      "button",
      "recalculate",
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

  // Retrieve an element from the DOM
  getElement(selector) {
    const element = document.querySelector(selector);

    return element;
  }

  createHead() {
    const headRow = this.createElement("tr", "head");
    for (let key in this.dealData) {
      if (key === 'name') continue
      const th = this.createElement("th", false, this.dealData[key][this.lng]);
      headRow.append(th);
    }
    return headRow;
  }

  displayDeals(deals) {
    while (this.table.children.length > 1) {
      this.table.removeChild(this.table.lastChild);
    }
    if (deals.length === 0) {
      return;
    } else {
      deals.forEach((deal, index) => {
        const tr = this.createElement("tr"),
              name = this.createElement('input', 'name');
        
        tr.id = index;

        Object.keys(deal).forEach((key) => {
          if (key === 'name') return;
          const td = this.createElement("td");
          const input = this.createElement("input", key);

          input.type = this.dealData[key].type;
          input.readOnly = this.dealData[key].readonly;
          input.value = deal[key];

          td.append(input);
          tr.append(td);
        });

        if (index === 0 || deal.name !== deals[index-1].name) {
          name.value = deal.name
          // divName.append(name);
          tr.firstChild.prepend(name);
          tr.firstChild.style.width = '110px';

        }
        const tdButtons = this.createElement('td')
        const delButton = this.createElement("button", "delete", "X");
        const duplicateButton = this.createElement(
          "button",
          "duplicate",
          this.text.cloneButton[this.lng]
        );
        
        tdButtons.append(duplicateButton, delButton)
        tr.append(tdButtons)
        this.table.append(tr);
      });
    }
  }

  updateDealOnInput(id, deals) {
    const tr = document.getElementById(id);
    tr.querySelector(".spend").value = deals[id].spend;
    tr.querySelector(".recieved").value = deals[id].recieved;
    tr.querySelector(".difference").value = deals[id].difference;
  }
}

class Controller {
  constructor(model, view) {
    this.model = model;
    this.view = view;
    this.view.displayDeals(this.model.deals);
    this.view.app.addEventListener("click", this.handleClicks);
    this.view.app.addEventListener("input", this.handleInput);

    this.checkLng();
    document.addEventListener("input", this.handleLngChange);
  }

  handleClicks = (e) => {
    const action = e.target.className;

    if (!action || e.target.tagName !== "BUTTON") return;
    if (action === "addNew") this.model.addNewDeal(this.view.dealData);
    if (action === "duplicate") this.model.duplicateDeal(+e.target.closest('tr').id);
    if (action === "delete") this.model.deleteDeal(+e.target.closest('tr').id);
    if (action === "paste") this.pasteFromClipBoard();
    if (action === "reset") this.resetTable();
    if (action === "recalculate") this.recalculateAll();
    if (action === "save") {
      this.saveToClipBoard();
      return;
    }
    this.view.displayDeals(this.model.deals);
    this.model.saveToLocalStorage();
  };

  handleInput = (e) => {
    const id = +e.target.closest("tr").id;
    if (id || id === 0) {
      this.model.calculate(id, e.target);
      if (e.target.className !== 'name') {
        this.view.updateDealOnInput(id, this.model.deals);
      }
      this.model.saveToLocalStorage();
    }
  };

  handleLngChange = (e) => {
    if (e.target.id === "lng") {
      localStorage.setItem("lng", e.target.value);
      location.reload();
    }
  };
  checkLng = () => {
    if (localStorage.getItem("lng")) {
      document.getElementById("lng").value = localStorage.getItem("lng");
    }
  };

  recalculateAll = () => {
    this.model.deals.forEach((e, i) => {
      this.model.calculate(i, false);
      this.view.displayDeals(this.model.deals);
      this.model.saveToLocalStorage();
    });
  };

  saveToClipBoard = () => {
    navigator.clipboard.writeText(localStorage.getItem("deals"));
    alert(this.view.text.copyDone[this.view.lng]);
  };

  pasteFromClipBoard = () => {
    navigator.clipboard.readText().then((clipText) => {
      if (clipText[0] !== "[") {
        alert(this.view.text.wrongPaste[this.view.lng] + clipText);
      } else if (
        confirm(this.view.text.pasteWarning[this.view.lng] + clipText)
      ) {
        this.model.deals = JSON.parse(clipText);
        this.view.displayDeals(this.model.deals);
        this.model.saveToLocalStorage();
      }
    });
  };

  resetTable = () => {
    if (confirm(this.view.text.resetWarning[this.view.lng])) {
      this.model.deals = [];
      this.view.displayDeals(this.model.deals);
      this.model.saveToLocalStorage();
    }
  };
}

const app = new Controller(new Model(), new View());
