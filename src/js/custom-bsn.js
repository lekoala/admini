import Data from "@thednp/shorty/src/misc/data";
import ObjectKeys from "@thednp/shorty/src/misc/ObjectKeys";
import getElementsByTagName from "@thednp/shorty/src/selectors/getElementsByTagName";
import matches from "@thednp/shorty/src/selectors/matches";

import { addListener } from "@thednp/event-listener/src/event-listener";
import Listener from "@thednp/event-listener/src/event-listener";

import Alert from "bootstrap.native/src/components/alert-native";
import Button from "bootstrap.native/src/components/button-native";
// import Carousel from "bootstrap.native/src/components/carousel-native";
import Collapse from "bootstrap.native/src/components/collapse-native";
import Dropdown from "bootstrap.native/src/components/dropdown-native";
import Modal from "bootstrap.native/src/components/modal-native";
import Offcanvas from "bootstrap.native/src/components/offcanvas-native";
import Popover from "bootstrap.native/src/components/popover-native";
import ScrollSpy from "bootstrap.native/src/components/scrollspy-native";
// import Tab from "bootstrap.native/src/components/tab-native";
import Tab from "./custom-tab";
import Toast from "bootstrap.native/src/components/toast-native";
import Tooltip from "bootstrap.native/src/components/tooltip-native";

import Version from "bootstrap.native/src/version";

/** @type {Record<string, any>} */
const componentsList = {
  Alert,
  Button,
  // Carousel,
  Collapse,
  Dropdown,
  Modal,
  Offcanvas,
  Popover,
  ScrollSpy,
  Tab,
  Toast,
  Tooltip,
};

// We initialize ourselves
const ignoreList = ["Tooltip"];

/**
 * Initialize all matched `Element`s for one component.
 * @param {BSN.InitCallback<any>} callback
 * @param {NodeListOf<HTMLElement | Element> | (HTMLElement | Element)[]} collection
 */
function initComponentDataAPI(callback, collection) {
  [...collection].forEach((x) => callback(x));
}

/**
 * Remove one component from a target container element or all in the page.
 * @param {string} component the component name
 * @param {(Element | HTMLElement | Document)=} context parent `Element`
 */
function removeComponentDataAPI(component, context) {
  const compData = Data.getAllFor(component);

  if (compData) {
    [...compData].forEach((x) => {
      const [element, instance] = x;
      if (context && context.contains(element)) instance.dispose();
    });
  }
}

/**
 * Initialize all BSN components for a target container.
 * @param {ParentNode=} context parent `Node`
 */
function initCallback(context) {
  const lookUp = context && context.nodeName ? context : document;
  const elemCollection = [...getElementsByTagName("*", lookUp)];

  ObjectKeys(componentsList).forEach((comp) => {
    if (ignoreList.includes(comp)) {
      return;
    }
    const { init, selector } = componentsList[comp];
    initComponentDataAPI(
      init,
      elemCollection.filter((item) => matches(item, selector))
    );
  });
}

/**
 * Remove all BSN components for a target container.
 * @param {ParentNode=} context parent `Node`
 */
function removeDataAPI(context) {
  const lookUp = context && context.nodeName ? context : document;

  ObjectKeys(componentsList).forEach((comp) => {
    removeComponentDataAPI(comp, lookUp);
  });
}

// bulk initialize all components
function init() {
  if (document.body) initCallback();
  else {
    addListener(document, "DOMContentLoaded", () => initCallback(), {
      once: true,
    });
  }
}

const BSN = Object.assign(componentsList, {
  initCallback,
  init,
  removeDataAPI,
  Version,
  Listener,
});

// We need this in the import otherwise other imports might get undefined global bootstrap
window.bootstrap = BSN; // Alias for scripts sharing the same api as Bootstrap 5
window.BSN = BSN;

export default BSN;
