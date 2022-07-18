"use strict";

import Cookies from "js-cookie";
// import * as bootstrap from "bootstrap";
// import * as bootstrap from "./custom-bootstrap.js";
import BSN from "./custom-bsn.js";
import "bs-companion/bs-companion.js";
import AdminiUi from "./ui.js";
import AdminiForms from "./forms.js";
import escapeHTML from "./utils/escape-html.js";

// Make globally available
// window.bootstrap = bootstrap;
window.bootstrap = BSN; // Alias for scripts sharing the same api as Bootstrap 5
window.BSN = BSN;
window.Cookies = Cookies;

let forms = new AdminiForms();
let ui = new AdminiUi();
let init = () => {
  BSN.init();
  window.admini.ui.init();
  window.admini.forms.init();
};

window.admini = window.admini || {};
window.admini = Object.assign(window.admini, {
  // Third party
  escapeHTML,
  // Our libs
  ui,
  forms,
  init,
});
