// Do not look pls

"use strict"

const placementsList = [];


export class Placement {
  #unique = true;
  static tables;
  static classListElement;
  static loadPlacements() {
    return JSON.parse(localStorage.getItem("placements"));
  }
  
  static savePlacements(placements) {
    localStorage.setItem("placements", JSON.stringify(placements.map(placement => placement.storable)));
  }

  constructor(date, tableValues) {
    this.date = date;
    this.tableValues = tableValues;
    const template =  document.createElement("template");
    this.timeOfDay = Intl.DateTimeFormat(navigator.language, {hour: "numeric", minute:"2-digit", hour12: false}).format(this.date);
    this.monthAndDay = new Intl.DateTimeFormat(navigator.language, {month: "long", day: "numeric"}).format(this.date);
    this.year = new Intl.DateTimeFormat(navigator.language, {year: "numeric"}).format(this.date);
    this.string = this.timeOfDay + this.monthAndDay;
    
    placementsList.unshift(this);
    Placement.handleIdenticals();

    template.innerHTML = `
      <li class="placement">
        <div class="controls">
          <button><img height=33px width=33px src="icons/publish_FILL0_wght400_GRAD0_opsz24.svg" alt="SET"></button>
          <button><img height=33px width=33px src="icons/delete_FILL0_wght400_GRAD0_opsz24.svg" alt="DELETE"></button>
        </div>
        <div class="time">
          <time class="time">${this.timeOfDay}</time><time class="month-day">${this.monthAndDay}</time>${this.unique ? "" : `<time class="year">${this.year}</time>`}
        </div>
      </li>`;
    // template.content.firstElementChild.firstElementChild.addEventListener("click", this.set)
    template.content.firstElementChild.firstElementChild.lastElementChild.addEventListener("click", this.remove)
    template.content.firstElementChild.firstElementChild.firstElementChild.addEventListener("click", this.set)
    placements.prepend(template.content); // 👎
    this.element = placements.firstElementChild; // 👎
    this.storable = {
      date: this.date,
      tableValues: this.tableValues
    }
    Placement.savePlacements(placementsList);
  }

  static handleIdenticals() {
    const strings = new Map();
    let i = 0;
    let stringIndex;
    for (const placement of placementsList) {
      if ((stringIndex = strings.get(placement.string)?.at(-1)) !== undefined) {
        placementsList[stringIndex].unique = placement.unique = false;
        strings.set(placement.string, [...strings.get(placement.string), i]);
      } else {
        strings.set(placement.string, [i]);
        placement.unique = true;
      }
      i++;
    }
  }

  get unique() {
    return this.#unique;
  }

  set unique(value) {
    if (value === this.#unique) {
      return;
    }
    this.#unique = value;
    if (!this.hasOwnProperty("element")) {
      return;
    }
    if (this.#unique) {
      this.element.lastElementChild.lastElementChild.remove();
    } else {
      const time = document.createElement("time");
      time.textContent = this.year;
      time.classList.add("year");
      this.element.lastElementChild.appendChild(time);
    }
  }

  get remove() {
    function wrapper(obj) {
      obj.element.parentElement.removeChild(obj.element);
      placementsList.splice(placementsList.indexOf(obj), 1);
      Placement.handleIdenticals();
      Placement.savePlacements(placementsList);
    }
    return () => wrapper(this);
  }
  get set() {
    function wrapper(obj) {
      ClassList.setClassList(obj.tableValues);
      Placement.classList.update();
      obj.element.firstElementChild.firstElementChild.blur();
    }
    return () => wrapper(this);
  }
}


export class ClassList {
  options = {
    leaveEmptySpace: false
  };

  constructor(tables, classListElement) {

    this.classListElement = classListElement;
    // bind an updateEmptiness method to each HTMLDivElement instance
    this.tables = Array.from(tables).map(table => {
      table.updateEmptiness = () => {
        table.textContent.trim() ? table.classList.remove("empty") : table.classList.add("empty");
        // return table;
      }
      return table;
    });

    this.tableValues = ClassList.classList || Array(28);
    this.updateAside();


    function handleInput(args) {
      const e = args[0]
      // sets the string at the same index its element has in tableValues, in tables to the contents of the element
      this.tableValues[this.tables.indexOf(e.target.parentElement/*.updateEmptiness()*/)] = e.target.textContent.trim() || null;
  
      ClassList.setClassList(this.tableValues);
      this.updateAside();
      e.target.parentElement.updateEmptiness();
    }

    for (let i = 0; i < this.tables.length; i++) {
      const table = this.tables[i];
      table.firstElementChild.textContent = this.tableValues[i];
      table.firstElementChild.contentEditable = true;
      table.firstElementChild.spellcheck = false;
      table.updateEmptiness();

      table.addEventListener("focusout", e => {
        e.target.textContent = e.target.textContent.trim();
      });

      table.addEventListener("input", e => handleInput.call(this, [e]));
    }
  }

  #shuffle() {
    let validValues = this.tableValues, result = [];
    if (!this.options.leaveEmptySpace) {
      validValues = this.tableValues.filter(e => e);
    }
    let i = 0;
    while (validValues.length) {
      result[i] = validValues.splice(Math.floor(Math.random() * validValues.length), 1)[0];
      i++;
    }
  
    const col1 = Array(8);
    const col2 = Array(12);
    const col3 = Array(8);
    
    function element() {
      return result.splice(Math.floor(Math.random()*result.length), 1)[0]
    }
    i = 0;
    while (result.length) {
      // let element = result.splice(Math.floor(Math.random()*result.length), 1)[0]

      col2[0 + i*3] = element();
      col2[2 + i*3] = element();
      col1[0 + i*2] = element();
      col3[1 + i*2] = element();
      col1[1 + i*2] = element();
      col3[0 + i*2] = element();
      col2[1 + i*3] = element();
      i++;
    }
    this.tableValues = [...col1, ...col2, ...col3];

    for (let i = 0; i < this.tables.length; i++) {
      this.tables[i].firstElementChild.textContent = this.tableValues[i];
      this.tables[i].updateEmptiness();
    }
    this.updateAside();
    ClassList.setClassList(this.tableValues);
  }
  
  update() {
    this.tableValues = ClassList.classList;
    this.updateAside();
    for (let i = 0; i < this.tables.length; i++) {
      const table = this.tables[i];
      table.firstElementChild.textContent = this.tableValues[i];
      table.firstElementChild.contentEditable = true;
      table.firstElementChild.spellcheck = false;
      table.updateEmptiness();
    }
  }

  updateAside() {
    this.classListElement.innerHTML = "";
    this.tableValues.forEach(table => {
      if (table) {
        const li = document.createElement("li");
        li.textContent = table;
        this.classListElement.appendChild(li);
      }
    })
  }

  get shuffle() {
    return () => this.#shuffle.call(this);
  }


  clear() {
    this.tableValues = Array(28);
    for (let i = 0; i < tableValues.length, i++;) {
      this.tables[i].firstChild.textContent = tableValues[i];
    }
  }

  static get classList() {
    return JSON.parse(localStorage.getItem("classList"));
  }
  static setClassList(tableValues) {
    localStorage.setItem("classList", JSON.stringify(tableValues));
  }
}