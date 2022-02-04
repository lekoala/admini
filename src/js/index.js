"use strict";

import Cookies from "js-cookie";
import * as bootstrap from "bootstrap";
// import * as bootstrap from "bootstrap.native";
import AdminiUi from "./ui.js";
import AdminiForms from "./forms.js";
import bs5 from "bs5-toast";

// Make globally available
window.bootstrap = bootstrap;
window.Cookies = Cookies;
// https://bs5-toast.vercel.app/
window.bs5Toast = bs5.Toast;

// Start
let ui = new AdminiUi();
ui.init();

let forms = new AdminiForms();
forms.init();