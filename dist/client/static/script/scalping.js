/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/client/scalping/components/Controller.js":
/*!******************************************************!*\
  !*** ./src/client/scalping/components/Controller.js ***!
  \******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ Controller)\n/* harmony export */ });\nclass Controller {\n  constructor(model, view) {\n    this.model = model;\n    this.view = view;\n    this.model.getTradesFromServer()\n      .then(t => this.view.displayTrades(t));\n    // this.view.displayTrades(this.model.trades);\n    this.view.app.addEventListener('click', this.handleClicks);\n    this.view.app.addEventListener('input', this.handleInput);\n\n    this.checkLng();\n    document.addEventListener('input', this.handleLngChange);\n  }\n\n  handleClicks = (e) => {\n    const action = e.target.className;\n    if (!action || e.target.tagName !== 'BUTTON') return;\n\n    let id = +e.target.closest('tr')?.id;\n\n    switch (action) {\n      case 'addNew':\n        this.model.addNewTrade();\n        break;\n      case 'duplicate':\n        this.model.duplicateTrade(id);\n        break;\n      case 'delete':\n        this.model.deleteTrade(id);\n        break;\n      case 'reset':\n        this.resetTable();\n        break;\n      case 'recalculate':\n        this.recalculateAll();\n        break;\n      case 'paste':\n        this.pasteFromClipBoard();\n        return;\n      case 'save':\n        this.saveToClipBoard();\n      default:\n        return;\n    }\n    this.view.displayTrades(this.model.trades);\n    this.model.saveToLocalStorage();\n  };\n\n  handleInput = (e) => {\n    const target = e.target;\n    const id = +target.closest('tr').id;\n    if (id || id === 0) {\n      const column = target.className;\n      const value = target.value;\n\n      this.model.editTrade(id, column, value);\n\n      if (column !== 'name') {\n        this.view.updateTradeOnInput(id, this.model.trades);\n      }\n      this.model.saveToLocalStorage();\n    }\n  };\n\n  handleLngChange = (e) => {\n    if (e.target.id !== 'lng') return;\n    localStorage.setItem('lng', e.target.value);\n    location.reload();\n  };\n\n  checkLng = () => {\n    const lng = localStorage.getItem('lng');\n    if (!lng) return;\n    document.getElementById('lng').value = lng;\n  };\n\n  recalculateAll = () => {\n    this.view.displayTrades(this.model.trades);\n    this.model.saveToLocalStorage();\n  };\n\n  saveToClipBoard = () => {\n    navigator.clipboard.writeText(localStorage.getItem('trades'));\n    alert(this.view.text.copyDone[this.view.lng]);\n  };\n\n  pasteFromClipBoard = () => {\n    navigator.clipboard.readText().then((clipText) => {\n      if (clipText[0] !== '[') {\n        alert(this.view.text.wrongPaste[this.view.lng] + clipText);\n      } else if (\n        confirm(this.view.text.pasteWarning[this.view.lng] + clipText)\n      ) {\n        localStorage.setItem('trades', clipText);\n        this.model.trades = this.model.getFromLocalStorage();\n        this.view.displayTrades(this.model.trades);\n      }\n    });\n  };\n\n  resetTable = () => {\n    if (confirm(this.view.text.resetWarning[this.view.lng])) {\n      localStorage.removeItem('trades');\n      this.model.trades = [];\n    }\n  };\n}\n\n\n//# sourceURL=webpack://crypto-toolkit/./src/client/scalping/components/Controller.js?");

/***/ }),

/***/ "./src/client/scalping/components/Model.js":
/*!*************************************************!*\
  !*** ./src/client/scalping/components/Model.js ***!
  \*************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ Model)\n/* harmony export */ });\n/* harmony import */ var _Trade_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Trade.js */ \"./src/client/scalping/components/Trade.js\");\n\n\nconst DELAY_WHILE_EDITING = 1000;\n\nclass Model {\n  constructor() {\n    this.trades;\n    this.isSended = true;\n    this.delayTimerId;\n  }\n\n  async getTradesFromServer() {\n    const res = await fetch(location.origin + '/api/scalping/db', {\n      method: 'get',\n    });\n    const j = await res.json();\n    this.trades = j.map(t => new _Trade_js__WEBPACK_IMPORTED_MODULE_0__[\"default\"](t))\n    return this.trades;\n  };\n\n  \n\n  getFromLocalStorage() {\n    const parsedTrades = JSON.parse(localStorage.getItem('trades')) || [];\n      if (parsedTrades.length === 0) {\n        return [];\n      } else {\n        return parsedTrades.map((item) => new _Trade_js__WEBPACK_IMPORTED_MODULE_0__[\"default\"](item));\n      }\n  }\n\n  addNewTrade() {\n    const newTrade = new _Trade_js__WEBPACK_IMPORTED_MODULE_0__[\"default\"]();\n    this.trades.push(newTrade);\n    fetch(location.origin + '/api/scalping/db', {method: 'POST'})\n      .then((res) => res.json())\n      .then((data) => {\n        newTrade.id = data.id;\n      });\n  }\n\n  editTrade(id, column, value) {\n    const editedTrade = this.trades[id];\n    editedTrade[column] = value;\n\n    const sendData = () => {\n      fetch(location.origin + '/api/scalping/db/' + editedTrade.id, {\n        method: 'PUT',\n        headers: {'content-type': 'application/json'},\n        body: JSON.stringify({trade: editedTrade.toArray()})\n      })\n      this.isSended = true\n    }\n    if (!this.isSended) {\n      clearInterval(this.delayTimerId);\n    };\n    this.delayTimerId = setTimeout(sendData, DELAY_WHILE_EDITING);\n    this.isSended = false;\n\n  }\n\n  deleteTrade(id) {\n    const deletedTrade = this.trades[id];\n\n    this.trades = this.trades.filter((item, index) => index !== id);\n\n    fetch(location.origin + '/api/scalping/db/' + deletedTrade.id, {\n      method: 'delete',\n    })\n  }\n\n  duplicateTrade(id) {\n    const duplicatedTrade = this.trades[id];\n    const newTrade = new _Trade_js__WEBPACK_IMPORTED_MODULE_0__[\"default\"](duplicatedTrade.toArray());\n    this.trades = this.trades.reduce((res, cur, index) => {\n      if (index === id) return res.concat([cur, newTrade]);\n      return res.concat(cur);\n    }, []);\n\n    fetch(location.origin + '/api/scalping/db/' + duplicatedTrade.id, {\n      method: 'post',\n    }).then((res) => res.json())\n      .then((data) => {\n        newTrade.id = data.id;\n      });\n  }\n\n  saveToLocalStorage() {\n    const arrayOfArrays = this.trades.map((trade) => trade.toArray());\n    localStorage.setItem('trades', JSON.stringify(arrayOfArrays));\n  }\n}\n\n\n//# sourceURL=webpack://crypto-toolkit/./src/client/scalping/components/Model.js?");

/***/ }),

/***/ "./src/client/scalping/components/Trade.js":
/*!*************************************************!*\
  !*** ./src/client/scalping/components/Trade.js ***!
  \*************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ Trade)\n/* harmony export */ });\nclass Trade {\n  constructor(trade = []) {\n    if (Array.isArray(trade)) {\n      [\n        this.name = '',\n        this.amount = '',\n        this.buy = '',\n        this.sell = '',\n        this.fee = 0.01,\n        this.singlefee = false,\n        this.id = 0,\n      ] = trade;\n    } else {\n      ({\n        name: this.name = '',\n        amount: this.amount = '',\n        buy: this.buy = '',\n        sell: this.sell = '',\n        fee: this.fee = 0.01,\n        singlefee: this.singlefee = false,\n      } = trade);\n    }\n  }\n\n  get spent() {\n    return this.amount * this.buy;\n  }\n\n  get recieved() {\n    const feeCorrection =\n      (1 - (this.fee || 0.01) / 10) ** (this.singlefee ? 1 : 2);\n    return this.amount * this.sell * feeCorrection;\n  }\n\n  get diff() {\n    if (!this.spent || !this.recieved) return '';\n    return this.recieved - this.spent;\n  }\n\n  toArray() {\n    return [\n      this.name,\n      this.amount,\n      this.buy,\n      this.sell,\n      this.fee,\n      this.singlefee,\n    ];\n  }\n}\n\n\n//# sourceURL=webpack://crypto-toolkit/./src/client/scalping/components/Trade.js?");

/***/ }),

/***/ "./src/client/scalping/components/View.js":
/*!************************************************!*\
  !*** ./src/client/scalping/components/View.js ***!
  \************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ View)\n/* harmony export */ });\nclass View {\n  constructor({ columns, text }) {\n    this.columns = columns;\n    this.text = text;\n    this.lng = localStorage.getItem('lng') || 'en';\n    this.app = document.querySelector('.main');\n    this.table = this.createElement('table', 'table');\n    this.headRow = this.createHead();\n\n    this.addButton = this.createElement(\n      'button',\n      'addNew',\n      this.text.addNewButton[this.lng]\n    );\n    this.saveButton = this.createElement(\n      'button',\n      'save',\n      this.text.saveButton[this.lng]\n    );\n    this.pasteButton = this.createElement(\n      'button',\n      'paste',\n      this.text.pasteButton[this.lng]\n    );\n    this.resetButton = this.createElement(\n      'button',\n      'reset',\n      this.text.resetButton[this.lng]\n    );\n    this.recalculateButton = this.createElement(\n      'button',\n      'recalculate',\n      this.text.recalculateButton[this.lng]\n    );\n\n    this.table.append(this.headRow);\n    this.app.append(\n      this.table,\n      this.addButton,\n      this.saveButton,\n      this.pasteButton,\n      this.resetButton,\n      this.recalculateButton\n    );\n  }\n\n  // Create an element with an optional CSS class and inner text\n  createElement(tag, className, innerText) {\n    const element = document.createElement(tag);\n    if (className) element.classList.add(className);\n    if (innerText) element.innerText = innerText;\n\n    return element;\n  }\n\n  createHead() {\n    const headRow = this.createElement('tr', 'head');\n    for (const key in this.columns) {\n      if (key === 'name') continue;\n      const th = this.createElement('th', false, this.columns[key][this.lng]);\n      headRow.append(th);\n    }\n    return headRow;\n  }\n\n  displayTrades(trades = []) {\n    while (this.table.children.length > 1) {\n      this.table.removeChild(this.table.lastChild);\n    }\n\n    if (trades.length === 0) return;\n    let id = 0;\n\n    for (const trade of trades) {\n      const tr = this.createElement('tr'),\n        name = this.createElement('input', 'name');\n\n      for (const column in this.columns) {\n        if (column === 'name') continue;\n        const td = this.createElement('td');\n        const input = this.createElement('input', column);\n\n        input.type = this.columns[column].type;\n        input.readOnly = this.columns[column].readonly;\n        input.value = trade[column] || '';\n\n        td.append(input);\n        tr.append(td);\n      }\n\n      if (id === 0 || trade.name !== trades[id - 1].name) {\n        name.value = trade.name || '';\n        tr.firstChild.prepend(name);\n        tr.firstChild.style.width = '110px';\n      }\n      const tdButtons = this.createElement('td');\n      const delButton = this.createElement('button', 'delete', 'X');\n      const duplicateButton = this.createElement(\n        'button',\n        'duplicate',\n        this.text.cloneButton[this.lng]\n      );\n\n      tdButtons.append(duplicateButton, delButton);\n      tr.append(tdButtons);\n      this.table.append(tr);\n      tr.id = id++;\n    }\n  }\n\n  updateTradeOnInput(id, trades) {\n    const tr = document.getElementById(id);\n    const updatedValues = ['spent', 'recieved', 'diff'];\n    for (const value of updatedValues) {\n      if (trades[id][value]) {\n        tr.querySelector(`.${value}`).value = trades[id][value];\n      }\n    }\n  }\n}\n\n\n//# sourceURL=webpack://crypto-toolkit/./src/client/scalping/components/View.js?");

/***/ }),

/***/ "./src/client/scalping/components/config.js":
/*!**************************************************!*\
  !*** ./src/client/scalping/components/config.js ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\nconst columns = {\n  name: {\n    readonly: false,\n    type: 'text',\n    en: 'Coin Ticker',\n    ua: 'Тікер монети',\n  },\n  amount: {\n    readonly: false,\n    type: 'number',\n    en: 'Amount',\n    ua: 'Кількість',\n  },\n  buy: {\n    readonly: false,\n    type: 'number',\n    en: 'Buy price',\n    ua: 'Ціна покупки',\n  },\n  spent: {\n    readonly: true,\n    type: 'text',\n    en: '$ spent',\n    ua: 'Витрачено $',\n  },\n  sell: {\n    readonly: false,\n    type: 'number',\n    en: 'Sell price',\n    ua: 'Ціна продажу',\n  },\n  recieved: {\n    readonly: true,\n    type: 'text',\n    en: '$ recieved',\n    ua: 'Отримано $',\n  },\n  diff: {\n    readonly: true,\n    type: 'text',\n    en: 'Difference',\n    ua: 'Різниця',\n  },\n};\nconst text = {\n  cloneButton: {\n    en: 'Clone',\n    ua: 'Клон',\n  },\n  addNewButton: {\n    en: 'Add new',\n    ua: 'Додати',\n  },\n  saveButton: {\n    en: 'Save to clipboard',\n    ua: 'Зберегти в буфер обміну',\n  },\n  pasteButton: {\n    en: 'Paste data',\n    ua: 'Вставити з буферу',\n  },\n  resetButton: {\n    en: 'Reset all',\n    ua: 'Очистити все',\n  },\n  recalculateButton: {\n    en: 'Recalculate all',\n    ua: 'Перерахувати все',\n  },\n  copyDone: {\n    en: 'Data copied to clipboard. Paste it to a text file',\n    ua: 'Дані в буфері обміну. Вставте їх у текстовий файл',\n  },\n  pasteWarning: {\n    en: 'You really want to paste this?',\n    ua: 'Впевнені, що бажаєте вставити це?',\n  },\n  wrongPaste: {\n    en: 'Wrong data to paste:',\n    ua: 'Невірні дані для вставки:',\n  },\n  resetWarning: {\n    en: 'Reset all data in table?',\n    ua: 'Очистити всі дані в таблиці?',\n  },\n};\n\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({ columns, text });\n\n\n//# sourceURL=webpack://crypto-toolkit/./src/client/scalping/components/config.js?");

/***/ }),

/***/ "./src/client/scalping/main.js":
/*!*************************************!*\
  !*** ./src/client/scalping/main.js ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _components_Model_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./components/Model.js */ \"./src/client/scalping/components/Model.js\");\n/* harmony import */ var _components_View_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./components/View.js */ \"./src/client/scalping/components/View.js\");\n/* harmony import */ var _components_Controller_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./components/Controller.js */ \"./src/client/scalping/components/Controller.js\");\n/* harmony import */ var _components_config_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./components/config.js */ \"./src/client/scalping/components/config.js\");\n\n\n\n\n\nnew _components_Controller_js__WEBPACK_IMPORTED_MODULE_2__[\"default\"](new _components_Model_js__WEBPACK_IMPORTED_MODULE_0__[\"default\"](), new _components_View_js__WEBPACK_IMPORTED_MODULE_1__[\"default\"](_components_config_js__WEBPACK_IMPORTED_MODULE_3__[\"default\"]));\n\n\n//# sourceURL=webpack://crypto-toolkit/./src/client/scalping/main.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./src/client/scalping/main.js");
/******/ 	
/******/ })()
;