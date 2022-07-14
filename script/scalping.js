class Trade {
  constructor(trade = {}) {
    ;({
      name: this.name = "",
      amount: this.amount = "",
      buy: this.buy = "",
      sell: this.sell = "",
      fee: this.fee = 0.01,
      singlefee: this.singlefee = false,
    } = trade)
  }

  get spent() {
    return this.amount * this.buy
  }

  get recieved() {
    const feeCorrection =
      (1 - (this.fee || 0.01) / 10) ** (this.singlefee ? 1 : 2)
    return this.amount * this.sell * feeCorrection
  }

  get diff() {
    if (!this.spent || !this.recieved) return ""
    return this.recieved - this.spent
  }
}

class Model {
  constructor(trades) {
    this.trades = trades
  }

  get trades() {
    return this._trades
  }

  set trades(newTrades) {
    if (newTrades && newTrades.length) {
      this._trades = newTrades
    } else {
      const parsedTrades = JSON.parse(localStorage.getItem("trades")) || []
      if (parsedTrades.length === 0) {
        this._trades = []
      } else {
        this._trades = parsedTrades.map((item) => new Trade(item))
      }
    }
  }

  addNewTrade() {
    this.trades.push(new Trade())
  }

  editTrade(id, column, value) {
    this.trades[id][column] = value
  }

  deleteTrade(id) {
    if (this.trades.length === 1) {
      this.trades.length = 0
      return
    }
    this.trades = this.trades.filter((item, index) => index !== id)
  }

  duplicateTrade(id) {
    this.trades = this.trades.reduce((res, cur, index) => {
      if (index === id) return res.concat([cur, new Trade(cur)])
      return res.concat(cur)
    }, [])
  }

  saveToLocalStorage() {
    localStorage.setItem("trades", JSON.stringify(this.trades))
  }
}

class View {
  constructor() {
    this.columns = {
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
      buy: {
        readonly: false,
        type: "number",
        en: "Buy price",
        ua: "Ціна покупки",
      },
      spent: {
        readonly: true,
        type: "text",
        en: "$ spent",
        ua: "Витрачено $",
      },
      sell: {
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
      diff: {
        readonly: true,
        type: "text",
        en: "Difference",
        ua: "Різниця",
      },
    }
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
    }
    this.lng = localStorage.getItem("lng") || "en"
    this.app = document.querySelector(".main")
    this.table = this.createElement("table", "table")
    this.headRow = this.createHead()

    this.addButton = this.createElement(
      "button",
      "addNew",
      this.text.addNewButton[this.lng]
    )
    this.saveButton = this.createElement(
      "button",
      "save",
      this.text.saveButton[this.lng]
    )
    this.pasteButton = this.createElement(
      "button",
      "paste",
      this.text.pasteButton[this.lng]
    )
    this.resetButton = this.createElement(
      "button",
      "reset",
      this.text.resetButton[this.lng]
    )
    this.recalculateButton = this.createElement(
      "button",
      "recalculate",
      this.text.recalculateButton[this.lng]
    )

    this.table.append(this.headRow)
    this.app.append(
      this.table,
      this.addButton,
      this.saveButton,
      this.pasteButton,
      this.resetButton,
      this.recalculateButton
    )
  }

  // Create an element with an optional CSS class and inner text
  createElement(tag, className, innerText) {
    const element = document.createElement(tag)
    if (className) element.classList.add(className)
    if (innerText) element.innerText = innerText

    return element
  }

  createHead() {
    const headRow = this.createElement("tr", "head")
    for (const key in this.columns) {
      if (key === "name") continue
      const th = this.createElement("th", false, this.columns[key][this.lng])
      headRow.append(th)
    }
    return headRow
  }

  displayTrades(trades = []) {
    while (this.table.children.length > 1) {
      this.table.removeChild(this.table.lastChild)
    }

    if (trades.length === 0) return
    let id = 0

    for (const trade of trades) {
      const tr = this.createElement("tr"),
        name = this.createElement("input", "name")

      for (const column in this.columns) {
        if (column === "name") continue
        const td = this.createElement("td")
        const input = this.createElement("input", column)

        input.type = this.columns[column].type
        input.readOnly = this.columns[column].readonly
        input.value = trade[column] || ""

        td.append(input)
        tr.append(td)
      }

      if (id === 0 || trade.name !== trades[id - 1].name) {
        name.value = trade.name || ""
        tr.firstChild.prepend(name)
        tr.firstChild.style.width = "110px"
      }
      const tdButtons = this.createElement("td")
      const delButton = this.createElement("button", "delete", "X")
      const duplicateButton = this.createElement(
        "button",
        "duplicate",
        this.text.cloneButton[this.lng]
      )

      tdButtons.append(duplicateButton, delButton)
      tr.append(tdButtons)
      this.table.append(tr)
      tr.id = id++
    }
  }

  updateTradeOnInput(id, trades) {
    const tr = document.getElementById(id)
    const updatedValues = ["spent", "recieved", "diff"]
    for (const value of updatedValues) {
      if (trades[id][value]) {
        tr.querySelector(`.${value}`).value = trades[id][value]
      }
    }
  }
}

class Controller {
  constructor(model, view) {
    this.model = model
    this.view = view
    this.view.displayTrades(this.model.trades)
    this.view.app.addEventListener("click", this.handleClicks)
    this.view.app.addEventListener("input", this.handleInput)

    this.checkLng()
    document.addEventListener("input", this.handleLngChange)
  }

  handleClicks = (e) => {
    const action = e.target.className
    if (!action || e.target.tagName !== "BUTTON") return

    let id = +e.target.closest("tr")?.id

    switch (action) {
      case "addNew":
        this.model.addNewTrade()
        break
      case "duplicate":
        this.model.duplicateTrade(id)
        break
      case "delete":
        this.model.deleteTrade(id)
        break
      case "reset":
        this.resetTable()
        break
      case "recalculate":
        this.recalculateAll()
        break
      case "paste":
        this.pasteFromClipBoard()
        return
      case "save":
        this.saveToClipBoard()
      default:
        return
    }
    this.view.displayTrades(this.model.trades)
    this.model.saveToLocalStorage()
  }

  handleInput = (e) => {
    const target = e.target
    const id = +target.closest("tr").id
    if (id || id === 0) {
      const column = target.className
      const value = target.value

      this.model.editTrade(id, column, value)

      if (column !== "name") {
        this.view.updateTradeOnInput(id, this.model.trades)
      }
      this.model.saveToLocalStorage()
    }
  }

  handleLngChange = (e) => {
    if (e.target.id !== "lng") return
    localStorage.setItem("lng", e.target.value)
    location.reload()
  }

  checkLng = () => {
    const lng = localStorage.getItem("lng")
    if (!lng) return
    document.getElementById("lng").value = lng
  }

  recalculateAll = () => {
    this.view.displayTrades(this.model.trades)
    this.model.saveToLocalStorage()
  }

  saveToClipBoard = () => {
    navigator.clipboard.writeText(localStorage.getItem("trades"))
    alert(this.view.text.copyDone[this.view.lng])
  }

  pasteFromClipBoard = () => {
    navigator.clipboard.readText().then((clipText) => {
      if (clipText[0] !== "[") {
        alert(this.view.text.wrongPaste[this.view.lng] + clipText)
      } else if (
        confirm(this.view.text.pasteWarning[this.view.lng] + clipText)
      ) {
        localStorage.setItem("trades", clipText)
        this.model.trades = []
        this.view.displayTrades(this.model.trades)
      }
    })
  }

  resetTable = () => {
    if (confirm(this.view.text.resetWarning[this.view.lng])) {
      localStorage.removeItem("trades")
      this.model.trades = []
    }
  }
}

const app = new Controller(new Model(), new View())
