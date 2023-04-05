/**
 * @param {String} selectors
 * @param {HTMLElement|Document} root
 * @returns {HTMLElement|null}
 */
export function $(selectors, root = document) {
  return root.querySelector(selectors);
}

/**
 * @param {String} selectors
 * @param {HTMLElement|Document} root
 * @returns {Array<HTMLElement>}
 */
export function $$(selectors, root = document) {
  return Array.from(root.querySelectorAll(selectors));
}
