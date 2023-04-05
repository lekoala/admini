/**
 * @typedef {Function & EventListenerOrEventListenerObject} ExtendedFunction
 */

/**
 * @param {Function} handler
 * @param {Number} timeout
 * @returns {ExtendedFunction}
 */
export default function debounce(handler, timeout = 300) {
  let timer = null;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      handler(...args);
    }, timeout);
  };
}
