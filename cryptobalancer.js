const values = {
  btcPrice: "Цена битка:",
  btcAmount: "Битки:",
  btcInUsd: "Биток в долларах:",
  difference: "Разница",
  usdAmount: "Доллары:",
  totalInUsd: "Всего $:",
}

const table = document.getElementById('table')

let rows = localStorage.rows
  ? JSON.parse(localStorage.getItem("rows"))
  : createInitialRows();

table.addEventListener('input', e => {
  updateData(e.target)
})

renderTable()

function renderTable() {
  table.innerHTML = ''
  createHead()
  renderInputsFrom(rows)
  renderKeysFor(rows)
  saveToLocalStorage()
}

function createInitialRows() {
  let rows = []
  let row = {}
  for(key in values) {
    row[key] = 0
  }
  rows.push(row)
  return rows
}

function createHead() {
  let headRow = document.createElement('tr')
  for (key in values) {
    let th = document.createElement('th')
    th.innerText = values[key]
    headRow.append(th)
  }
  table.append(headRow)
}

function renderInputsFrom(rows) {
  rows.forEach((valuesObj, index) => {

    const row = document.createElement('tr')
    row.id = index

    Object.keys(valuesObj).forEach(key => {

      const td = document.createElement('td')
      const input = document.createElement('input')
      input.className = key
      input.value = key === 'btcAmount' ? valuesObj[key] : +valuesObj[key].toFixed(2)
      input.type = 'number'

      if (key === 'totalInUsd' || key === 'difference') {
        input.readOnly = true
        input.type = 'text'
        input.style.width = '100px'
      }
      
      td.append(input)
      row.append(td)
    })

    table.append(row)
  });
}

function renderKeysFor(rows) {
  rows.forEach((valuesObj, index) => {

    const row = document.getElementById(index)

    const duplicateButton = document.createElement('button')
    duplicateButton.textContent = duplicateButton.className = 'duplicate'
    duplicateButton.addEventListener('click', e => {
      duplicateRow(e.target)
    })
    
    const deleteButton = document.createElement('button')
    deleteButton.textContent = deleteButton.className = 'delete'
    deleteButton.addEventListener('click', e => {
      deleteRow(e.target)
    })

    const balanceButton = document.createElement('button')
    balanceButton.textContent = balanceButton.className = 'balance'
    balanceButton.addEventListener('click', e => {
      updateData(e.target)
    })

    row.append(duplicateButton, balanceButton, deleteButton)

    
  })
}

function updateData(target) {
  const inputsRow = target.closest('tr')
  const id = +inputsRow.id
  const row = rows[id]
  const key = target.className
  
  if (target.tagName === 'INPUT') {
    if (+target.value == '') return
    row[key] = +target.value
  }

  const inputs = getInputs()

  function getInputs() {

    const inputs = {}
    for (let key in values) {
      inputs[key] = inputsRow.querySelector(`.${key}`)
    }
    return inputs
  }

  if (key === 'btcPrice') {
    getBtcInUsd()
    getTotal()
  }
  if (key === 'btcInUsd') {
    getBTCAmount()
    getTotal()
  }
  if (key === 'usdAmount') {
    getTotal()
  }
  if (key === 'btcAmount') {
    getBtcInUsd()
    getTotal()
  }
  if (key === 'balance') {
    balance()
    getBTCAmount()
  }
  getDifference()
  saveToLocalStorage()

  function getDifference() {
    inputs.difference.value = +(row.difference = +row.btcInUsd - +row.usdAmount).toFixed(2)
    inputs.difference.style.color = inputs.difference.value >= 0 ? 'green' : 'red'
  }
  function getBTCAmount() {
    inputs.btcAmount.value = row.btcAmount = +(+row.btcInUsd / +row.btcPrice).toFixed(8)
  }

  function getBtcInUsd() {
    inputs.btcInUsd.value = +(row.btcInUsd = +row.btcAmount * +row.btcPrice).toFixed(2)
  }

  function getTotal() {
    inputs.totalInUsd.value = +(row.totalInUsd = +row.btcInUsd + +row.usdAmount).toFixed(2)
  }

  function balance() {
    inputs.btcInUsd.value = inputs.usdAmount.value = +(row.btcInUsd = row.usdAmount = +row.totalInUsd / 2).toFixed(2)
  }

}

function saveToLocalStorage() {
  localStorage.setItem('rows', JSON.stringify(rows) )
}

function duplicateRow(target) {

  const id = +target.closest('tr').id
  let newRows = []
  const last = rows.length - 1 - id === 0
  const clone = Object.assign({}, rows[id])
  if (id === 0 && !last) {
    newRows.push(rows[id])
    newRows.push(clone)
    newRows.push(...rows.slice(1))
  } else if (last) {
    newRows.push(...rows)
    newRows.push(clone)
  } else {
    newRows.push(...rows.slice(0, id))
    newRows.push(clone)
    newRows.push(...rows.slice(id))
  }

  rows = newRows

  renderTable()
}

function deleteRow(target) {

  if (rows.length < 2) return

  const id = +target.closest('tr').id
  
  rows.splice(id, 1)

  renderTable()
}