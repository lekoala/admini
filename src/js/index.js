"use strict";

import Cookies from "../../node_modules/js-cookie/index";
// import * as bootstrap from "bootstrap";
import BSN from "./custom-bsn.js";
import AdminiUi from "./ui.js";
import AdminiForms from "./forms.js";
import toaster from "./toaster.js";

// Make globally available
// window.bootstrap = bootstrap;
window.bootstrap = BSN;
window.Cookies = Cookies;
window.toaster = toaster;

// Start
let ui = new AdminiUi();
ui.init();

let forms = new AdminiForms();
forms.init();