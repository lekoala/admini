/**
 * Entwine is inspired by a js lib (https://github.com/hafriedlander/jquery.entwine) 
 * that allows binding behaviour to a give selector
 * 
 * This library is a modern take on the same subject
 *
 * All elements get their own event listeners attached. This is an alternative approach
 * to have one big delegator that deals with everything (see listen.js if that's what you want)
 * I'm actually not sure what's the course of action ? :-)
 * 
 * Supports once and passive events
 * 
 * (dis)connected logic inspired by https://github.com/WebReflection/disconnected
 */
const CONNECTED = "connected";
const DISCONNECTED = "disconnected";

let observer;
let globalListener;
let onceListener;
/**
 * A map that stores all elements with listeners
 * Since it's a weak map, elements will get garbage collected
 * But even then, we remove them as early as possible
 * @type {WeakMap<HTMLElement|EventTarget, Array>}
 */
let elementsMap = new WeakMap();
/**
 * Holds all definitions
 * Multiple selectors can match the same elements (eg: button, .btn)
 * @type {Object<string, Map<string, Object>>}
 */
let definitionsNS = {};

const supportedPassiveTypes = [
  "scroll",
  "wheel",
  "touchstart",
  "touchmove",
  "touchenter",
  "touchend",
  "touchleave",
  "mouseout",
  "mouseleave",
  "mouseup",
  "mousedown",
  "mousemove",
  "mouseenter",
  "mousewheel",
  "mouseover",
];

class Listener {
  constructor(once = false) {
    this.once = once;
  }

  /**
   * @param {Event} ev
   */
  handleEvent(ev) {
    /*
    Note: The value of event.currentTarget is only available while the event is being handled. 
    If you console.log() the event object,
    storing it in a variable, and then look for the currentTarget key 
    in the console, its value will be null`.
    */
    const target = ev.currentTarget;
    const selectors = elementsMap.get(target);
    if (!selectors) {
      return;
    }
    // Call all definitions for this element by matching selector
    selectors.forEach((selector) => {
      callDefinitions(target, ev, selector, this.once);
    });
  }
}

/**
 * @param {HTMLElement|EventTarget} el
 * @param {Event} ev
 * @param {String} selector
 * @param {Boolean} once
 * @returns {void}
 */
function callDefinitions(el, ev, selector, once = false) {
  // Look for all definitions by namespace
  for (const [ns, definitionsMap] of Object.entries(definitionsNS)) {
    const def = definitionsMap.get(selector);
    // Check if we have the event in our definitions
    if (!def) {
      continue;
    }
    const eventType = once ? `once_${ev.type}` : ev.type;
    if (def[eventType]) {
      def[eventType](ev, el);
    }
  }
}

/**
 * @param {HTMLElement} el
 */
function bindRelevantDefinitions(el) {
  for (const [ns, definitionsMap] of Object.entries(definitionsNS)) {
    definitionsMap.forEach((definitions, selector) => {
      queryAndMatch(el, selector).forEach((el) => {
        bindDefinitions(el, definitions, selector);
      });
    });
  }
}

/**
 * @param {String} selector
 * @param {Object} definitions
 * @param {HTMLElement|Document} root
 */
function bindSelectorDefinitions(selector, definitions, root = document) {
  root.querySelectorAll(selector).forEach(
    /**
     * @param {HTMLElement} el
     */
    (el) => {
      bindDefinitions(el, definitions, selector);
    }
  );
}

/**
 * Ignore private methods (starting with _), any other key is considered as an event
 * @param {Object} definitions
 * @returns {Array}
 */
function getValidEvents(definitions) {
  return Object.keys(definitions).filter((k) => {
    return k.indexOf("_") !== 0;
  });
}

/**
 * @typedef {object} ListenerOptions
 * @property {string} type
 * @property {EventListenerObject} listener
 * @property {AddEventListenerOptions} opts
 */

/**
 * @param {String} type
 * @returns {ListenerOptions}
 */
function getListenerOptions(type) {
  const opts = {};
  if (supportedPassiveTypes.includes(type)) {
    opts.passive = true;
  }
  let listener = globalListener;
  if (type.indexOf("once_") === 0) {
    listener = onceListener;
    type = type.replace("once_", "");
    opts.once = true;
  }
  return { type, listener, opts };
}

/**
 *
 * @param {HTMLElement} el
 * @param {Object} definitions
 * @param {String} selector
 */
function bindDefinitions(el, definitions, selector) {
  getValidEvents(definitions).forEach((k) => {
    const { type, listener, opts } = getListenerOptions(k);
    el.addEventListener(type, listener, opts);
    // If definition is added after DOMContentLoaded, call connected immediately
    if (k === CONNECTED && DOMContentLoaded) {
      callDefinitions(el, new Event(CONNECTED), selector);
    }
  });

  let selectors = elementsMap.get(el) ?? [];
  // Add selector to element map
  if (selectors.indexOf(selector) === -1) {
    selectors.push(selector);
    elementsMap.set(el, selectors);
  }
}

/**
 * @param {HTMLElement} el
 */
function removeDefinitions(el) {
  for (const [ns, definitionsMap] of Object.entries(definitionsNS)) {
    definitionsMap.forEach((definitions, selector) => {
      queryAndMatch(el, selector).forEach((el) => {
        getValidEvents(definitions).forEach((k) => {
          const { type, listener, opts } = getListenerOptions(k);
          el.removeEventListener(type, listener, opts);
        });
      });
    });
  }
}

/**
 * @callback ElementCallback
 * @param {HTMLElement} el
 * @returns {void}
 */

/**
 * Call a function on an element and all its children
 * @param {HTMLElement} el
 * @param {ElementCallback} cb
 */
function recursive(el, cb) {
  cb(el);
  Array.from(el.children).forEach(
    /**
     * @param {HTMLElement} child
     */
    (child) => {
      cb(child);
    }
  );
}

/**
 * Returns all children matching selector and also check root element
 * @param {HTMLElement} el
 * @param {String} selector
 * @returns {Array<HTMLElement>}
 */
function queryAndMatch(el, selector) {
  let arr = [];
  if (el.matches(selector)) {
    arr.push(el);
  }
  return arr.concat(Array.from(el.querySelectorAll(`:scope ${selector}`)));
}

/**
 * @param {HTMLElement} el
 */
function removeElementFromMap(el) {
  recursive(el, (el) => {
    if (elementsMap.has(el)) {
      elementsMap.delete(el);
    }
  });
}

/**
 * @param {NodeList} nodes
 * @param {String} type
 */
function dispatchAll(nodes, type) {
  for (let length = nodes.length, i = 0; i < length; ) {
    const node = nodes[i++];
    if (!(node instanceof HTMLElement)) {
      continue;
    }
    dispatchTarget(node, new Event(type));
  }
}

/**
 *
 * @param {HTMLElement} el
 * @param {Event} ev
 */
function dispatchTarget(el, ev) {
  let dispatched = false;
  recursive(el, (el) => {
    if (dispatched) {
      return;
    }
    if (elementsMap.has(el)) {
      el.dispatchEvent(ev);
      dispatched = true;
    }
  });
}

let DOMContentLoaded = false;
document.addEventListener("DOMContentLoaded", (ev) => {
  // Call connected on all relevant selectors
  for (const [ns, definitionsMap] of Object.entries(definitionsNS)) {
    definitionsMap.forEach((defs, selector) => {
      if (!defs[CONNECTED]) {
        return;
      }
      document.querySelectorAll(selector).forEach((el) => {
        callDefinitions(el, new Event(CONNECTED), selector);
      });
    });
  }
  DOMContentLoaded = true;
});

/**
 * @param {string} selector
 * @param {Object} definitions
 * @param {string} ns
 */
export default function entwine(selector, definitions, ns = "default") {
  // init
  if (!observer) {
    observer = new MutationObserver(
      /**
       * @param {Array<MutationRecord>} mutations
       */
      (mutations) => {
        mutations.forEach((mutation) => {
          // Bind all relevant definitions
          mutation.addedNodes.forEach(
            /**
             * @param {HTMLElement} el
             */
            (el) => {
              bindRelevantDefinitions(el);
            }
          );
          dispatchAll(mutation.removedNodes, DISCONNECTED);
          dispatchAll(mutation.addedNodes, CONNECTED);
          // Don't wait for GC
          mutation.removedNodes.forEach(
            /**
             * @param {HTMLElement} el
             */
            (el) => {
              // Is this really necessary ?
              removeDefinitions(el);
              removeElementFromMap(el);
            }
          );
        });
      }
    );

    observer.observe(document, { subtree: true, childList: true });

    globalListener = new Listener();
    onceListener = new Listener(true);
  }

  const definitionsMap = definitionsNS[ns] ?? new Map();

  // It's a new definition namespace, register it
  if (definitionsMap.size === 0) {
    definitionsNS[ns] = definitionsMap;
  }

  let defs = Object.assign(definitionsMap.get(selector) ?? {}, definitions);
  definitionsMap.set(selector, defs);
  bindSelectorDefinitions(selector, defs);
}
