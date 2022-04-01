import Data from "shorter-js/src/misc/data";
import ObjectKeys from "shorter-js/src/misc/ObjectKeys";
import parentNodes from "shorter-js/src/selectors/parentNodes";
import getElementsByTagName from "shorter-js/src/selectors/getElementsByTagName";
import matches from "shorter-js/src/selectors/matches";

import { addListener } from "event-listener.js";

import EventListener from "event-listener.js/src/event-listener";

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

// build the componentsList object
const componentsList = {
  Alert,
  Button,
  //   Carousel,
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

function initCallback(context) {
  const lookUp = context && parentNodes.some((x) => context instanceof x) ? context : undefined;
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

function removeDataAPI(context) {
  const lookUp = context && parentNodes.some((x) => context instanceof x) ? context : undefined;

  ObjectKeys(componentsList).forEach((comp) => {
    removeComponentDataAPI(comp, lookUp);
  });
}

// bulk initialize all components
if (document.body) initCallback();
else {
  addListener(document, "DOMContentLoaded", () => initCallback(), { once: true });
}

const BSN = Object.assign(componentsList, {
  initCallback,
  removeDataAPI,
  Version,
  EventListener,
});

export default BSN;
