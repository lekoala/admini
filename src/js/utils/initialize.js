/**
 * @callback ElementCallback
 * @param {HTMLElement} el
 * @returns {void}
 */

const set = new WeakSet();

/**
 * Initialize an element exactly once
 * @param {String} selector
 * @param {ElementCallback} callback
 */
export default function initialize(selector, callback) {
  document.querySelectorAll(selector).forEach(
    /**
     * @param {HTMLElement} el
     */
    (el) => {
      if (!set.has(el)) {
        set.add(el);
        callback(el);
      }
    }
  );
}
