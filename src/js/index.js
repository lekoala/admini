"use strict";

import "./custom-bootstrap.js";
import BsCompanion from "bs-companion/bs-companion.js";
import AdminiUi from "./ui.js";
import escapeHTML from "./utils/escapeHTML.js";
import simpleDropdowns from "./utils/simpleDrodowns.js"; // optional
import Scope from "./thirdparty/Scope.js";

let initialized = false;
const debugMode = true;
const ui = new AdminiUi();
const init = () => {
  if (initialized) {
    return;
  }
  initialized = true;
  ui.init();
  BsCompanion.FormValidator.init();
  simpleDropdowns(); // optional
};

// TODO: install from https://github.com/lekoala/sco-pe once stable
customElements.define("sco-pe", Scope);

Scope.configure({
  debug: debugMode,
  onLoad: (scope) => {
    init();
  },
});

// admini is reserved in global namespace
window["admini"] = window["admini"] || {};
window["admini"] = Object.assign(window["admini"], {
  // Third party
  escapeHTML,
  // Our libs
  ui,
  init,
});

// auto init by default if no data-admini-manual on body
// if (!document.body.dataset.adminiManual) {
//   init();
// }
