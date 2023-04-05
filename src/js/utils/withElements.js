/**
 * Do something with a selection of elements
 * @param {String} selector
 * @param {(el:HTMLElement) => void} callback
 * @param {HTMLElement|Document} root
 */
export default function withElements(selector, callback, root = document) {
  root.querySelectorAll(selector).forEach(
    /**
     * @param {HTMLElement} el
     */
    (el) => {
      callback(el);
    }
  );
}
