/**
 * Delegate listener to any events on any elements
 * Set passive elements by default
 * Avoid listening multiple times to the same event for the same handler
 */

import passiveOpts from "./passiveOpts.js";

const ownTargetTypes = ["mouseenter", "mouseleave"];

/**
 * Store all listened selectors in here by type
 * @type {Map<String, Map>}
 */
const map = new Map();

let globalListener = {
  /**
   * @param {Event} ev
   */
  handleEvent(ev) {
    const selectors = map.get(ev.type);

    if (!selectors.size) {
      return;
    }

    let t = ev.target;
    if (t instanceof Text) {
      t = t.parentElement;
    }
    if (t instanceof Element) {
      for (const [s, h] of selectors) {
        let trigger = false;
        let closest = t;
        // Enter/leave should only match on self
        if (ownTargetTypes.includes(ev.type)) {
          trigger = t.matches(s);
        } else {
          // Leverage closest selector to match parent
          // This is useful if you listen for example on a button with a nested svg icon that can be the actual target
          closest = t.closest(s);
          // Make sure the current target contains closest element (or is the whole document)
          trigger = !!closest;
        }

        if (trigger) {
          h(ev, closest); // also pass actual element as second param
        }
      }
    }
  },
};

/**
 * @callback EventCallback
 * @param {Event} ev
 * @param {HTMLElement} el
 * @returns {void}
 */

/**
 * @param {String} selector A selector that should work with .closest()
 * @param {String|Array} type Event type or array of event types
 * @param {EventCallback} listener A callback function
 * @returns {Function} Remove callback
 */
function delegate(selector, type, listener) {
  if (Array.isArray(type)) {
    const results = type.map((type) => {
      return delegate(selector, type, listener);
    });
    return () => {
      results.forEach((cb) => cb());
    };
  }

  // We always capture
  // @link https://javascript.info/bubbling-and-capturing#capturing
  const listenerOptions = passiveOpts(type, {
    capture: true,
  });

  // The focusin and focusout fire at the same time as focus and blur, however, they bubble while the focus and blur do not.
  if (type == "focus") {
    type = "focusin";
  }
  if (type == "blur") {
    type = "focusout";
  }

  // We can safely call this multiple times since we can't add a globalListener more than once on the same element
  document.addEventListener(type, globalListener, listenerOptions);

  const listenerMap = map.get(type) ?? new Map();

  // it's a new map, register the type
  if (listenerMap.size === 0) {
    map.set(type, listenerMap);
  }

  // Listeners are stored BY SELECTOR. There can be only one listener per selector.
  listenerMap.set(selector, listener);

  return () => {
    listenerMap.delete(selector);
  };
}

export default delegate;
