import debounce from "../utils/debounce.js";

// A lightweight alternative to popper.js or floating ui

/**
 * @typedef Config
 * @property {Function} [offsetX]
 * @property {Function} [offsetY]
 * @property {HTMLElement} [parent]
 * @property {Boolean} [end]
 */

/**
 * @typedef Coords
 * @property {Number} x
 * @property {Number} y
 */

let initComplete = false;

/**
 * @type {Map<HTMLElement, Config>}
 */
let map = new Map();

// This mutation observer helps clearing the map from deleted nodes
const observer = new MutationObserver(
  /**
   * @param {Array<MutationRecord>} mutations
   */
  (mutations) => {
    mutations.forEach((mutation) => {
      if (!mutation.removedNodes.length) {
        return;
      }
      const nodes = Array.from(mutation.removedNodes);
      for (const [target] of map) {
        const directMatch = nodes.indexOf(target) > -1;
        const parentMatch = nodes.some((parent) => parent.contains(target));
        if (directMatch || parentMatch) {
          map.delete(target);
        }
      }
    });
  }
);

/**
 * Get scroll offset from all scrollable parents
 * @param {HTMLElement} el
 * @returns {Coords}
 */
function getScrollPosition(el) {
  let parent = el.parentElement;
  const scroll = {
    x: 0,
    y: 0,
  };
  while (parent && parent instanceof HTMLElement) {
    const styles = getComputedStyle(parent);
    if (parent.style.position === "fixed") {
      return scroll;
    }
    if (styles.overflowX == "auto" || styles.overflowX == "scroll") {
      scroll.x += parent.scrollLeft;
    }
    if (styles.overflowY == "auto" || styles.overflowY == "scroll") {
      scroll.y += parent.scrollTop;
    }
    parent = parent.parentElement;
  }
  return scroll;
}

/**
 * Initialize scroll/resize listeners
 * Listen also for custom update_position event
 * Observe the dom for changes and detected removed nodes
 */
function init() {
  const fn = debounce((e) => {
    for (let [el, opts] of map) {
      // Skip hidden elements
      if (!el.offsetHeight) {
        continue;
      }

      const scroll = getScrollPosition(el);
      let x = opts.offsetX ? opts.offsetX(scroll.x) : `${scroll.x * -1}px`;
      let y = opts.offsetY ? opts.offsetY(scroll.y) : `${scroll.y * -1}px`;

      if (opts.end) {
        x = `${(scroll.x - opts.parent.offsetWidth + el.offsetWidth) * -1}px`;
      }

      el.style.transform = `translate(${x},${y})`;

      // overflow check, only for elements with fixed parents
      if (scroll.x === 0 && scroll.y === 0) {
        const bounds = el.getBoundingClientRect();
        const scrollbarWidth = window.innerWidth - document.body.clientWidth;

        // avoid drop menu going over its container
        if (bounds.x + bounds.width > window.innerWidth) {
          x = scroll.x - scrollbarWidth - (bounds.x + bounds.width - window.innerWidth) + "px";
        }
        if (bounds.y + bounds.height > window.innerHeight) {
          const styles = window.getComputedStyle(el);
          const margin = parseInt(styles.marginTop) + parseInt(styles.marginBottom);
          y = `calc(-100% - ${opts.parent.offsetHeight - margin + scroll.y}px)`;
        }

        el.style.transform = `translate(${x},${y})`;
      }
    }
  }, 0);
  window.addEventListener("scroll", fn);
  window.addEventListener("resize", fn);
  window.addEventListener("update_position", fn);
  observer.observe(document, { subtree: true, childList: true });
}

/**
 * Attach behaviour when scroll or resize event happen
 * Ideal for setting fixed element position either through css transform
 * @param {HTMLElement} el
 * @param {Config} opts
 */
export default function attach(el, opts) {
  if (!initComplete) {
    init();
    initComplete = true;
  }
  if (!map.has(el)) {
    el.style.position = "fixed";
    map.set(el, opts);
  }
}
