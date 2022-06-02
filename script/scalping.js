class Model {
  constructor(dealData) {
    this.deals = JSON.parse(localStorage.getItem('deals')) || []
    this.dealData = dealData
    this.fee = 0.01
  }

  addNewDeal() {
    const deal = {}
    for(let key in this.dealData) {
      deal[key] = ''
    }
    this.deals.push(deal)
  }
  deleteDeal(id) {
    this.deals = this.deals.filter((item, index) => index !== id)
  }
  duplicateDeal(id) {
    let newDeals = [];
    const last = this.deals.length - 1 - id === 0;
    const clone = Object.assign({}, this.deals[id]);
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
    this.deals= newDeals;
  }
  calculate(id, target, updateInputs) {
    const deal = this.deals[id]
    if(target) {
      const key = target.className
      if(key === 'name') {
        this.deals[id][key] = target.value
      } else {
        deal[key] = +target.value
      }
    }

    if(deal.buyPrice && deal.amount) {
      deal.spend = deal.buyPrice * deal.amount
    } else {
      deal.spend = ''
    }
    if(deal.sellPrice && deal.amount) {
      deal.recieved = deal.sellPrice * deal.amount * ((1 - this.fee/10) ** 2)
    } else {
      deal.recieved = ''
    }
    if(deal.recieved && deal.spend) {
      deal.difference = deal.recieved - deal.spend
    } else {
      deal.difference = ''
    }
    updateInputs(id, this.deals)
  }
  saveToLocalStorage() {
    localStorage.setItem('deals', JSON.stringify(this.deals))
  }
  

}

class View {
  constructor(dealData, text, lng) {

    this.app = this.getElement(".main");
    this.table = this.createElement("table", "table");
    this.headRow = this.createElement("tr", "head");
    for (let key in dealData) {
      const th = this.createElement("th", false, dealData[key][lng]);
      this.headRow.append(th);
    }
    this.text = text
    this.lng = lng
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

    this.table.append(this.headRow);
    this.app.append(
      this.table,
      this.addButton,
      this.saveButton,
      this.pasteButton,
      this.resetButton
    );
  }

  // Create an element with an optional CSS class
  createElement(tag, className, innerText) {
    const element = document.createElement(tag);
    if (className) element.classList.add(className);
    if (innerText) element.innerText = innerText

    return element;
  }

  // Retrieve an element from the DOM
  getElement(selector) {
    const element = document.querySelector(selector);

    return element;
  }

  bindAddDeal(handler) {
    this.app.addEventListener("click", e => {
      if(e.target.className === 'addNew') handler()
    });
  }
  bindDuplicateDeal(handler) {
    this.app.addEventListener("click", e => {
      if(e.target.className === 'duplicate') {
        handler(+e.target.parentElement.id)
      }
    });
  }
  bindDeleteDeal(handler) {
    this.app.addEventListener("click", e => {
      if(e.target.className === 'delete') {
        handler(+e.target.parentElement.id)
      }
    });
  }

  bindSavePasteReset(save, paste, reset) {
    this.app.addEventListener('click', e => {
      const action = e.target.className
      if(action === 'save') {
        save()
      }
      if(action === 'paste') {
        paste()
      }
      if(action === 'reset') {
        reset()
      }
    })
  }

  bindCalculate(handler) {
    this.app.addEventListener('input', (e) => {
      handler(+e.target.closest('tr').id, e.target)
    })
  }



  displayDeals(deals) {
    while(this.table.children.length > 1) {
      this.table.removeChild(this.table.lastChild)
    }
    if(deals.length === 0) {
      return
    } else {
      deals.forEach((deal, index) => {
        const tr = this.createElement('tr')
        tr.id = index

        Object.keys(deal).forEach(key => {
          const td = this.createElement('td')
          const input = this.createElement('input', key)

          input.type = dealData[key].type
          input.readOnly = dealData[key].readonly
          if(key === 'name'){
            input.value = deal[key]
          } else if(key === 'amount') {
            input.value = +(+deal[key]).toFixed(8)
          } else {
            input.value = +(+deal[key]).toFixed(8)
          }

          td.append(input)
          tr.append(td)
        })
        const delButton = this.createElement('button', 'delete', 'X')
        const duplicateButton = this.createElement('button', 'duplicate', this.text.cloneButton[this.lng])
        tr.append(duplicateButton, delButton)
        this.table.append(tr)
      });
    }
  }

  updateInputsOf(id, deals) {
    const tr = document.getElementById(id)
    tr.querySelector('.spend').value = +(+deals[id].spend).toFixed(8)
    tr.querySelector('.recieved').value = +(+deals[id].recieved).toFixed(8)
    tr.querySelector('.difference').value = +(+deals[id].difference).toFixed(8)
  }
}

class Controller {
  constructor(model, view) {
    this.model = model
    this.view = view
    this.view.bindAddDeal(this.handleAddDeal)
    this.view.bindDeleteDeal(this.handleDeleteDeal)
    this.view.bindDuplicateDeal(this.handleDuplicateDeal)
    this.view.bindCalculate(this.handleCalculate)
    this.view.bindSavePasteReset(
      this.saveToClipBoard,
      this.pasteFromClipBoard,
      this.resetTable
    )
    this.render(this.model.deals)
  }

  handleAddDeal = () => {
    this.model.addNewDeal()
    this.render(this.model.deals)
    this.model.saveToLocalStorage()
  }
  handleDeleteDeal = (id) => {
    this.model.deleteDeal(id)
    this.render(this.model.deals)
    this.model.saveToLocalStorage()
  }
  handleDuplicateDeal = (id) => {
    this.model.duplicateDeal(id)
    this.render(this.model.deals)
    this.model.saveToLocalStorage()
  }
  
  handleCalculate = (id, target) => {
    this.model.calculate(id, target, this.handleUpdateInputsOnInput)
    this.model.saveToLocalStorage()
  }
  recalculateAll = () => {
    this.model.deals.forEach((e, i) => {
      this.model.calculate(i, false, this.handleUpdateInputsOnInput)
      this.model.saveToLocalStorage()
    })
  }
  handleUpdateInputsOnInput = (id, deals) => {
    this.view.updateInputsOf(id, deals)
  }
  render = (deals) => {
    this.view.displayDeals(deals)
  }

  saveToClipBoard = () => {
    navigator.clipboard.writeText(localStorage.getItem('deals') );
    alert(this.view.text.copyDone[this.view.lng])
  }

  pasteFromClipBoard = () => {
    navigator.clipboard.readText().then(
      clipText => {
        if(clipText[0] !== '[') {
          alert(this.view.text.wrongPaste[this.view.lng] + clipText)
        } else if(confirm(this.view.text.pasteWarning[this.view.lng] + clipText)) {
          this.model.deals = JSON.parse(clipText)
          this.render(this.model.deals)
          this.model.saveToLocalStorage()
        }
      }
    )
  }
  resetTable = () => {
    if(confirm(this.view.text.resetWarning[this.view.lng])){
      this.model.deals = []
      this.render(this.model.deals)
      this.model.saveToLocalStorage()
    }
  }

}

const dealData = {
  name: {
    readonly: false,
    type: 'text',
    en: "Coin Ticker",
    ua: "Тікер монети",
  },
  amount: {
    readonly: false,
    type: 'number',
    en: "Amount",
    ua: "Кількість",
  },
  buyPrice: {
    readonly: false,
    type: 'number',
    en: "Buy price",
    ua: "Ціна покупки",
  },
  spend: {
    readonly: true,
    type: 'text',
    en: "$ spend",
    ua: "Витрачено $",
  },
  sellPrice: {
    readonly: false,
    type: 'number',
    en: "Sell price",
    ua: "Ціна продажу",
  },
  // fee: {
  //   readonly: false,
  //   type: 'number',
  //   en: "Fee %",
  //   ua: "Комісія %",
  // },
  recieved: {
    readonly: true,
    type: 'text',
    en: "$ recieved",
    ua: "Отримано $",
  },
  difference: {
    readonly: true,
    type: 'text',
    en: "Difference",
    ua: "Різниця",
  },
};

const textSigns = {
  cloneButton: {
    en: 'Clone',
    ua: 'Клон'
  },
  addNewButton: {
    en: 'Add new',
    ua: 'Додати'
  },
  saveButton: {
    en: 'Save to clipboard',
    ua: 'Зберегти в буфер обміну'
  },
  pasteButton: {
    en: 'Paste data',
    ua: 'Вставити з буферу'
  },
  resetButton: {
    en: 'Reset all',
    ua: 'Очистити все'
  },
  copyDone: {
    en: 'Data copied to clipboard. Paste it to a text file',
    ua: 'Дані в буфері обміну. Вставте їх у текстовий файл'
  },
  pasteWarning: {
    en: 'You really want to paste this?',
    ua: 'Впевнені, що бажаєте вставити це?'
  },
  wrongPaste: {
    en: 'Wrong data to paste:',
    ua: 'Невірні дані для вставки:'
  },
  resetWarning: {
    en: 'Reset all data in table?',
    ua: 'Очистити всі дані в таблиці?'
  },
}

const app = new Controller(new Model(dealData), new View(dealData, textSigns, getLng()))


function getLng() {
  const lng = document.getElementById('lng')
  lng.addEventListener('input', e => {
    localStorage.setItem('lng', e.target.value)
    location.reload()
  })
  if(localStorage.getItem('lng')){
    lng.value = localStorage.getItem('lng')
  }
  return lng.value
}

function saveToClipBoard() {
  navigator.clipboard.writeText(localStorage.getItem('deals') );
  alert(textSigns.copyDone)
}

function pasteFromClipBoard() {
  navigator.clipboard.readText().then(
    clipText => {
      if(confirm(textSigns.pasteWarning + clipText)) {
        rows = JSON.parse(clipText)
        renderTable()
      }
    }
  )
  
}





