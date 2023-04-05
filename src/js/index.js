"use strict";

// Core
import "./custom-bootstrap.js";
import BsCompanion from "bs-companion/bs-companion.js";
import AdminiUi from "./ui.js";
// Utils
import escapeHTML from "./utils/escapeHTML.js";
import withElements from "./utils/withElements.js";
import initialize from "./utils/initialize.js";
// Third party
import Scope from "./thirdparty/Scope.js";
import simpleDropdowns from "./utils/simpleDrodowns.js"; // optional

const debugMode = document.documentElement.dataset.debug ? true : false;
const ui = new AdminiUi();
const init = () => {
  ui.init();
  BsCompanion.FormValidator.init();
  simpleDropdowns(); // optional
};

// Obviously, not refreshing the whole page each time comes with its own issues
// This is optional, feel free to disable sco-pe and replace with regular divs
// TODO: install from https://github.com/lekoala/sco-pe once stable
customElements.define("sco-pe", Scope);
Scope.configure({
  debug: debugMode,
  onLoad: () => {
    // Keep in mind that this will be called multiple times on the whole page
    // Avoid initializing things twice!
    // You can use listen(selector, 'match') or initiliaze(selector, callback)
    init();
  },
  onScopeLoad: (scope) => {
    // Close dropdowns in scope
    withElements(
      ".dropdown-menu.show",
      (el) => {
        el.classList.remove("show");
      },
      scope
    );
  },
});

// admini is reserved in global namespace
window["admini"] = window["admini"] || {};
window["admini"] = Object.assign(window["admini"], {
  // Third party
  escapeHTML,
  initialize,
  withElements,
  // Our libs
  ui,
  init,
});

// auto init by default if no data-admini-manual on body
// you may want to enable this if not using sco-pe
// if (!document.body.dataset.adminiManual) {
//   init();
// }
