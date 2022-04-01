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
window.toaster = toaster;
window.modalizer = modalizer;
window.modalizerConfirm = modalizerConfirm;
window.escapeHTML = escapeHTML;

// Start
let ui = new AdminiUi();
ui.init();

let forms = new AdminiForms();
forms.init();
