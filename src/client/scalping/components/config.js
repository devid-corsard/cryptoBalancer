const columns = {
  name: {
    readonly: false,
    type: 'text',
    en: 'Coin Ticker',
    ua: 'Тікер монети',
  },
  amount: {
    readonly: false,
    type: 'number',
    en: 'Amount',
    ua: 'Кількість',
  },
  buy: {
    readonly: false,
    type: 'number',
    en: 'Buy price',
    ua: 'Ціна покупки',
  },
  spent: {
    readonly: true,
    type: 'text',
    en: '$ spent',
    ua: 'Витрачено $',
  },
  sell: {
    readonly: false,
    type: 'number',
    en: 'Sell price',
    ua: 'Ціна продажу',
  },
  recieved: {
    readonly: true,
    type: 'text',
    en: '$ recieved',
    ua: 'Отримано $',
  },
  diff: {
    readonly: true,
    type: 'text',
    en: 'Difference',
    ua: 'Різниця',
  },
};
const text = {
  cloneButton: {
    en: 'Clone',
    ua: 'Клон',
  },
  addNewButton: {
    en: 'Add new',
    ua: 'Додати',
  },
  saveButton: {
    en: 'Save to clipboard',
    ua: 'Зберегти в буфер обміну',
  },
  pasteButton: {
    en: 'Paste data',
    ua: 'Вставити з буферу',
  },
  resetButton: {
    en: 'Reset all',
    ua: 'Очистити все',
  },
  recalculateButton: {
    en: 'Recalculate all',
    ua: 'Перерахувати все',
  },
  copyDone: {
    en: 'Data copied to clipboard. Paste it to a text file',
    ua: 'Дані в буфері обміну. Вставте їх у текстовий файл',
  },
  pasteWarning: {
    en: 'You really want to paste this?',
    ua: 'Впевнені, що бажаєте вставити це?',
  },
  wrongPaste: {
    en: 'Wrong data to paste:',
    ua: 'Невірні дані для вставки:',
  },
  resetWarning: {
    en: 'Reset all data in table?',
    ua: 'Очистити всі дані в таблиці?',
  },
};

export default { columns, text };
