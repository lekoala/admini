/**
 * Initialize an element exactly once
 * @param {String} selector
 * @param {(el:HTMLElement) => void} callback
 */
export default function initialize(selector, callback) {
  document.querySelectorAll(selector).forEach(
    /**
     * @param {HTMLElement} el
     */
    (el) => {
      if (el.dataset.initialized) {
        return;
      }
      el.dataset.initialized = "1";
      callback(el);
    }
  );
}
