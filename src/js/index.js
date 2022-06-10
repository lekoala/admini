"use strict";

import Cookies from "js-cookie";
// import * as bootstrap from "bootstrap";
// import * as bootstrap from "./custom-bootstrap.js";
import BSN from "./custom-bsn.js";
import AdminiUi from "./ui.js";
import AdminiForms from "./forms.js";
import escapeHTML from "./bs-companion/escape-html";
import toaster from "./bs-companion/toaster.js";
import modalizer, { modalizerConfirm } from "./bs-companion/modalizer.js";

// Make globally available
// window.bootstrap = bootstrap;
window.bootstrap = BSN;
window.Cookies = Cookies;

window.admini = window.admini || {};

window.admini = {
  // Third party
  toaster: toaster,
  modalizer: modalizer,
  modalizerConfirm: modalizerConfirm,
  escapeHTML: escapeHTML,
  // Our libs
  ui: new AdminiUi(),
  forms: new AdminiForms(),
  init: () => {
    window.admini.ui.init();
    window.admini.forms.init();
  },
};
