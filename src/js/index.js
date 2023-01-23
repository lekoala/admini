"use strict";

import "./custom-bootstrap.js";
import "bs-companion/bs-companion.js";
import AdminiUi from "./ui.js";
import escapeHTML from "./utils/escape-html.js";

const ui = new AdminiUi();
const init = () => {
  window["admini"].ui.init();
};

// admini is reserved in global namespace
window["admini"] = window["admini"] || {};
window["admini"] = Object.assign(window["admini"], {
  // Third party
  escapeHTML,
  // Our libs
  ui,
  init,
});
