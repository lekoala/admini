"use strict";

// Core
import "./custom-bootstrap.js";
import BsCompanion from "bs-companion/bs-companion.js";
import AdminiUi from "./ui.js";
// Utils
// TODO: migrate to third party utils framework
import escapeHTML from "./utils/escapeHTML.js";
import initialize from "./utils/initialize.js";
import entwine from "./utils/entwine.js";
import listen from "./utils/listen.js";
import delegate from "./utils/delegate.js";
import on from "./utils/on.js";
import q from "./utils/q.js";
import { $, $$ } from "./utils/dollar.js";
import resizer from "./utils/resizer.js";
// Third party
import Scope from "./thirdparty/Scope.js";
import LoadProgress from "./thirdparty/LoadProgress.js";
import simpleDropdowns from "./dropdowns/simpleDrodowns.js"; // optional
import Toasts from "bs-companion/src/Toasts.js";
import modalizerConfirm from "bs-companion/src/modalizerConfirm.js";
import FormValidator from "bs-companion/src/FormValidator.js";

const debugMode = document.documentElement.dataset.debug ? true : false;
const ui = new AdminiUi();
const init = () => {
  ui.init();
  initialize(
    "form.needs-validation",
    /**
     * @param {HTMLFormElement} form
     */
    (form) => {
      new FormValidator(form);
    }
  );
  simpleDropdowns(); // optional
};

// Obviously, not refreshing the whole page each time comes with its own issues
// This is optional, feel free to disable sco-pe and replace with regular divs and adjust this script
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
  // Show a nice toast message on http status
  statusHandler: (message, statusCode) => {
    // Since redirect are opaque (cannot read status),
    // we might actually get 2xx that are redirects or errors
    const parts = message.split("|");
    if (statusCode === 200) {
      const type = parts[1] ?? "success";
      Toasts[type](parts[0]);
    } else {
      const type = parts[1] ?? "error";
      Toasts[type](parts[0]);
    }
  },
  // Use bootstrap modal instead of native confirm
  confirmHandler: (message) => {
    return new Promise((resolve, reject) => {
      modalizerConfirm(message, resolve, reject);
    });
  },
  progressHandler: (target, step) => {
    LoadProgress[step]();
  },
  onScopeLoad: (scope) => {
    // Ui cleanup
    ui.hideDropdowns(scope);
    ui.hideSidebar();
  },
});

// Should the utils be exposed on the global object ?
const admini = {
  // Utils
  escapeHTML,
  initialize,
  entwine,
  listen,
  delegate,
  q,
  $,
  $$,
  on,
  resizer,
  // Our libs
  ui,
  init,
};

// admini is reserved in global namespace
window["admini"] = window["admini"] || {};
Object.assign(window["admini"], admini);

// auto init by default if no data-admini-manual on body
// you may want to enable this if not using sco-pe
// if (!document.body.dataset.adminiManual) {
//   init();
// }

export default admini;
