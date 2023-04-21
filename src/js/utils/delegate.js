/**
 * Delegate listener to any events on any elements
 * Set passive elements by default
 * Avoid listening multiple times to the same event for the same handler
 */

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

/**
 * Store all listened selectors in here by type
 * @type {Map<String, Map>}
 */
const map = new Map();

class Listener {
  handleEvent(ev) {
    const t = ev.target;
    const selectors = map.get(ev.type);

    if (t instanceof HTMLElement) {
      // Leverage closest selector to match parent
      // This is useful if you listen for example on a button with a nested svg icon that can be the actual target
      for (const [s, h] of selectors) {
        const closest = ev.target.closest(s);
        if (closest) {
          h(ev, closest); // also pass actual element as second param
        }
      }
    }
  }
}

let globalListener;

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
 */
function delegate(selector, type, listener) {
  if (Array.isArray(type)) {
    type.forEach((type) => {
      delegate(selector, type, listener);
    });
    return;
  }

  if (!globalListener) {
    globalListener = new Listener();
  }

  let listenerOptions = {
    capture: true, //@link https://javascript.info/bubbling-and-capturing#capturing
  };
  // @link https://developer.chrome.com/docs/lighthouse/best-practices/uses-passive-event-listeners/
  if (supportedPassiveTypes.includes(type)) {
    listenerOptions.passive = true;
  }

  // need capture for most events, note that you cannot prevent events this way (with stopPropagation, preventDefault...)
  document.addEventListener(type, globalListener, listenerOptions);

  const listenerMap = map.get(type) ?? new Map();
  if (listenerMap.size === 0) {
    map.set(type, listenerMap);
  }
  listenerMap.set(selector, listener);
}

export default delegate;
