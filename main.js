import { Placement, ClassList } from "./module.js";

const tables = document.querySelectorAll(".table:not(.teacher)");
const classListElement = document.querySelector(".class-list");
const shuffleButton = document.getElementById("shuffle");
const saveButton = document.getElementById("save");
const placements = document.getElementById("placements");

let classList = new ClassList(tables, classListElement);

shuffleButton.addEventListener("click", () => {classList.shuffle()});
Placement.classList = classList;
Placement.tables = tables;
Placement.classListElement = classListElement;

Placement.loadPlacements()?.reverse().forEach(a => new Placement(a.date, a.tableValues))

saveButton.addEventListener("click", () => {
  new Placement(Date.now(), classList.tableValues)
});

const serviceWorker = navigator.serviceWorker.register("/sw.js");