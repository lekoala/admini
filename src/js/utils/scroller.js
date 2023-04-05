import debounce from "./debounce.js";

/**
 * This set allows to easily handle at a global level scroll events on the window
 * Thansk to the Set, the same handlers cannot be added multiple times
 */

const scroller = new Set();
const fn = debounce(
  /**
   * @param {Event} ev
   */
  (ev) => {
    for (let callback of scroller) {
      callback(ev);
    }
  }
);
window.addEventListener("scroll", fn, {
  passive: true,
});

export default scroller;
