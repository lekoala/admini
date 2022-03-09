"use strict";

/**
 * Properly escape the html
 * @param {string} str
 * @returns {string}
 */
export default function escapeHTML(str) {
  const p = document.createElement("p");
  p.appendChild(document.createTextNode(str));
  return p.innerHTML;
}
