/**
 * Query elements in a typesafe manner
 *
 * You can declare your owns tags in the HTMLElementTagNameMap namespace
 *
 * ```js
 * // my-tag.d.ts
 * declare global {
 *   interface HTMLElementTagNameMap {
 *      "my-tag": MyTag;
 *   }
 * }
 * ```
 *
 * @template {keyof HTMLElementTagNameMap} K
 * @param {K|String} tagName Name of the element, or global selector string (returns any element).
 * @param {String} selector Selector appended to the type. If it contains a space, type is ignored.
 * @param {Document|HTMLElement} ctx Context (document by default). If a context is specified, :scope is applied
 * @returns {Array<HTMLElementTagNameMap[K]>}
 */
export default function q(tagName, selector = "", ctx = document) {
  // Don't prepend the type if we are asking for children, eg: #my-element type
  selector = selector.includes(" ") ? selector : `${tagName}${selector}`;
  // Needed for direct children queries
  // @link https://developer.mozilla.org/en-US/docs/Web/CSS/:scope#direct_children
  // Needed to avoid inconsistent behaviour
  // @link https://lists.w3.org/Archives/Public/public-webapi/2008Apr/0251.html
  if (!(ctx instanceof Document)) {
    selector = `:scope ${selector}`;
  }
  return Array.from(ctx.querySelectorAll(selector));
}
