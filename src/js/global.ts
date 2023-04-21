export {};

// You can add here any custom tag

import Scope from "./thirdparty/Scope.js";
// import LastIcon from "last-icon";
import BsTabs from "bs-companion/src/BsTabs.js";
import BsToggle from "bs-companion/src/BsToggle.js";
import LazyLoader from "bs-companion/src/LazyLoader.js";

declare global {
  interface HTMLElementTagNameMap {
    "sco-pe": Scope;
    // "l-i": LastIcon;
    "bs-tabs": BsTabs;
    "bs-toggle": BsToggle;
    "lazy-loader": LazyLoader;
  }
}
