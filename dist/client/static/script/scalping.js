(()=>{"use strict";class e{constructor(e=[]){Array.isArray(e)?[this.name="",this.amount="",this.buy="",this.sell="",this.fee=.01,this.singlefee=!1]=e:({name:this.name="",amount:this.amount="",buy:this.buy="",sell:this.sell="",fee:this.fee=.01,singlefee:this.singlefee=!1}=e)}get spent(){return this.amount*this.buy}get recieved(){const e=(1-(this.fee||.01)/10)**(this.singlefee?1:2);return this.amount*this.sell*e}get diff(){return this.spent&&this.recieved?this.recieved-this.spent:""}toArray(){return[this.name,this.amount,this.buy,this.sell,this.fee,this.singlefee]}}new class{constructor(e,t){this.model=e,this.view=t,this.view.displayTrades(this.model.trades),this.view.app.addEventListener("click",this.handleClicks),this.view.app.addEventListener("input",this.handleInput),this.checkLng(),document.addEventListener("input",this.handleLngChange)}handleClicks=e=>{const t=e.target.className;if(!t||"BUTTON"!==e.target.tagName)return;let a=+e.target.closest("tr")?.id;switch(t){case"addNew":this.model.addNewTrade();break;case"duplicate":this.model.duplicateTrade(a);break;case"delete":this.model.deleteTrade(a);break;case"reset":this.resetTable();break;case"recalculate":this.recalculateAll();break;case"paste":return void this.pasteFromClipBoard();case"save":this.saveToClipBoard();default:return}this.view.displayTrades(this.model.trades),this.model.saveToLocalStorage()};handleInput=e=>{const t=e.target,a=+t.closest("tr").id;if(a||0===a){const e=t.className,s=t.value;this.model.editTrade(a,e,s),"name"!==e&&this.view.updateTradeOnInput(a,this.model.trades),this.model.saveToLocalStorage()}};handleLngChange=e=>{"lng"===e.target.id&&(localStorage.setItem("lng",e.target.value),location.reload())};checkLng=()=>{const e=localStorage.getItem("lng");e&&(document.getElementById("lng").value=e)};recalculateAll=()=>{this.view.displayTrades(this.model.trades),this.model.saveToLocalStorage()};saveToClipBoard=()=>{navigator.clipboard.writeText(localStorage.getItem("trades")),alert(this.view.text.copyDone[this.view.lng])};pasteFromClipBoard=()=>{navigator.clipboard.readText().then((e=>{"["!==e[0]?alert(this.view.text.wrongPaste[this.view.lng]+e):confirm(this.view.text.pasteWarning[this.view.lng]+e)&&(localStorage.setItem("trades",e),this.model.trades=this.model.getFromLocalStorage(),this.view.displayTrades(this.model.trades))}))};resetTable=()=>{confirm(this.view.text.resetWarning[this.view.lng])&&(localStorage.removeItem("trades"),this.model.trades=[])}}(new class{constructor(){this.trades=this.getFromLocalStorage()}getFromLocalStorage(){const t=JSON.parse(localStorage.getItem("trades"))||[];return 0===t.length?[]:t.map((t=>new e(t)))}addNewTrade(){this.trades.push(new e)}editTrade(e,t,a){this.trades[e][t]=a}deleteTrade(e){1!==this.trades.length?this.trades=this.trades.filter(((t,a)=>a!==e)):this.trades.length=0}duplicateTrade(t){this.trades=this.trades.reduce(((a,s,n)=>n===t?a.concat([s,new e(s.toArray())]):a.concat(s)),[])}saveToLocalStorage(){const e=this.trades.map((e=>e.toArray()));localStorage.setItem("trades",JSON.stringify(e))}},new class{constructor({columns:e,text:t}){this.columns=e,this.text=t,this.lng=localStorage.getItem("lng")||"en",this.app=document.querySelector(".main"),this.table=this.createElement("table","table"),this.headRow=this.createHead(),this.addButton=this.createElement("button","addNew",this.text.addNewButton[this.lng]),this.saveButton=this.createElement("button","save",this.text.saveButton[this.lng]),this.pasteButton=this.createElement("button","paste",this.text.pasteButton[this.lng]),this.resetButton=this.createElement("button","reset",this.text.resetButton[this.lng]),this.recalculateButton=this.createElement("button","recalculate",this.text.recalculateButton[this.lng]),this.table.append(this.headRow),this.app.append(this.table,this.addButton,this.saveButton,this.pasteButton,this.resetButton,this.recalculateButton)}createElement(e,t,a){const s=document.createElement(e);return t&&s.classList.add(t),a&&(s.innerText=a),s}createHead(){const e=this.createElement("tr","head");for(const t in this.columns){if("name"===t)continue;const a=this.createElement("th",!1,this.columns[t][this.lng]);e.append(a)}return e}displayTrades(e=[]){for(;this.table.children.length>1;)this.table.removeChild(this.table.lastChild);if(0===e.length)return;let t=0;for(const a of e){const s=this.createElement("tr"),n=this.createElement("input","name");for(const e in this.columns){if("name"===e)continue;const t=this.createElement("td"),n=this.createElement("input",e);n.type=this.columns[e].type,n.readOnly=this.columns[e].readonly,n.value=a[e]||"",t.append(n),s.append(t)}0!==t&&a.name===e[t-1].name||(n.value=a.name||"",s.firstChild.prepend(n),s.firstChild.style.width="110px");const i=this.createElement("td"),l=this.createElement("button","delete","X"),r=this.createElement("button","duplicate",this.text.cloneButton[this.lng]);i.append(r,l),s.append(i),this.table.append(s),s.id=t++}}updateTradeOnInput(e,t){const a=document.getElementById(e),s=["spent","recieved","diff"];for(const n of s)t[e][n]&&(a.querySelector(`.${n}`).value=t[e][n])}}({columns:{name:{readonly:!1,type:"text",en:"Coin Ticker",ua:"Тікер монети"},amount:{readonly:!1,type:"number",en:"Amount",ua:"Кількість"},buy:{readonly:!1,type:"number",en:"Buy price",ua:"Ціна покупки"},spent:{readonly:!0,type:"text",en:"$ spent",ua:"Витрачено $"},sell:{readonly:!1,type:"number",en:"Sell price",ua:"Ціна продажу"},recieved:{readonly:!0,type:"text",en:"$ recieved",ua:"Отримано $"},diff:{readonly:!0,type:"text",en:"Difference",ua:"Різниця"}},text:{cloneButton:{en:"Clone",ua:"Клон"},addNewButton:{en:"Add new",ua:"Додати"},saveButton:{en:"Save to clipboard",ua:"Зберегти в буфер обміну"},pasteButton:{en:"Paste data",ua:"Вставити з буферу"},resetButton:{en:"Reset all",ua:"Очистити все"},recalculateButton:{en:"Recalculate all",ua:"Перерахувати все"},copyDone:{en:"Data copied to clipboard. Paste it to a text file",ua:"Дані в буфері обміну. Вставте їх у текстовий файл"},pasteWarning:{en:"You really want to paste this?",ua:"Впевнені, що бажаєте вставити це?"},wrongPaste:{en:"Wrong data to paste:",ua:"Невірні дані для вставки:"},resetWarning:{en:"Reset all data in table?",ua:"Очистити всі дані в таблиці?"}}}))})();