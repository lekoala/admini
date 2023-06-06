import passiveOpts from "./passiveOpts";

/**
 * Adds an event listener (or more) to an element and returns a function to unsubscribe.
 * @param {EventTarget} el
 * @param {String|Array} type
 * @param {EventListenerOrEventListenerObject} listener
 * @param {Boolean|AddEventListenerOptions} options
 * @returns {Function}
 */
export default function on(el, type, listener, options) {
  const types = Array.isArray(type) ? type : [type];
  types.forEach((t) => el.addEventListener(t, listener, passiveOpts(t, options)));
  return () => {
    types.forEach((t) => el.removeEventListener(t, listener, passiveOpts(t, options)));
  };
}
