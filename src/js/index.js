"use strict";

import Cookies from "js-cookie";
// import "./custom-bootstrap.js";
import BSN from "./custom-bsn.js";
import "bs-companion/bs-companion.js";
import "modular-behaviour.js";
import AdminiUi from "./ui.js";
import escapeHTML from "./utils/escape-html.js";

window.Cookies = Cookies;

let ui = new AdminiUi();
let init = () => {
  if (typeof BSN !== "undefined") {
    BSN.init();
  }
  window.admini.ui.init();
};

window.admini = window.admini || {};
window.admini = Object.assign(window.admini, {
  // Third party
  escapeHTML,
  // Our libs
  ui,
  init,
});
