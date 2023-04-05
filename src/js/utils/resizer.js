import debounce from "./debounce.js";

/**
 * This set allows to easily handle at a global level resize events on the window
 * Thansk to the Set, the same handlers cannot be added multiple times
 */

const resizer = new Set();
const fn = debounce(
  /**
   * @param {Event} ev
   */
  (ev) => {
    for (let callback of resizer) {
      callback(ev);
    }
  }
);
window.addEventListener("resize", fn, {
  passive: true,
});

export default resizer;
