/**
 * Listen to any events on any elements
 * Set passive elements by default
 * Avoid listening multiple times to the same event for the same handler
 * Support a virtual "connected" event that allows triggering code only once
 */

const CONNECTED = "connected";
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

// Store all listened elements in here
// Use a WeakMap so they can be garbage collected once removed from dom
// event listeners will be cleaned up eventually in modern browsers (hopefully)
const map = new WeakMap();

/**
 * @param {String|NodeList|Array} target
 * @param {String|Array} type
 * @param {EventListener} listener
 * @param {EventListenerOptions|Boolean} options
 */
function listen(target, type, listener, options = false) {
  if (Array.isArray(type)) {
    type.forEach((type) => {
      listen(target, type, listener, options);
    });
    return;
  }
  const list = target instanceof NodeList || target instanceof Array ? target : document.querySelectorAll(target);
  list.forEach(
    /**
     * @param {HTMLElement} el
     */
    (el) => {
      let registry, set;
      registry = map.get(el);
      if (!registry) {
        registry = new Map();
        map.set(el, registry);
      }
      set = registry.get(type);
      if (!set) {
        set = new Set();
        registry.set(type, set);
      }
      // Need toString comparison to compare anonymous functions instantiated multiple times
      const str = listener.toString();
      if (set.has(str)) {
        // Don't listen multiple times for the same listener
        return;
      }
      set.add(str);

      /**
       * @type {AddEventListenerOptions}
       */
      let listenerOptions = {};
      if (options instanceof Boolean) {
        listenerOptions.capture = !!options;
      } else {
        listenerOptions = Object.assign(listenerOptions, options);
      }
      // @link https://developer.chrome.com/docs/lighthouse/best-practices/uses-passive-event-listeners/
      if (supportedPassiveTypes.includes(type)) {
        listenerOptions = Object.assign(
          {
            passive: true,
          },
          listenerOptions
        );
      }
      el.addEventListener(type, listener, listenerOptions);

      // Fake connected event, which makes syntax simpler when defining init code that should run only once
      if (type === CONNECTED) {
        el.dispatchEvent(new Event(CONNECTED));
      }
    }
  );
}

export default listen;
