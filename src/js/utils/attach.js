import debounce from "./debounce.js";

// A lightweight alternative to popper.js or floating ui

let initComplete = false;
let map = new Map();

// This mutation observer helps clearing the map from deleted nodes
const observer = new MutationObserver(function (mutations) {
  mutations.forEach(function (mutation) {
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
});

/**
 * Get scroll offset from all scrollable parents
 * @param {HTMLElement} el
 * @returns {Array}
 */
function getScrollPosition(el) {
  let parent = el.parentElement;
  let scroll = [0, 0];
  while (parent && parent instanceof HTMLElement) {
    const styles = getComputedStyle(parent);
    if (styles.overflowX == "auto" || styles.overflowX == "scroll") {
      scroll[0] += parent.scrollLeft;
    }
    if (styles.overflowY == "auto" || styles.overflowY == "scroll") {
      scroll[1] += parent.scrollTop;
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
      if (!el.offsetHeight) {
        continue;
      }

      const scroll = getScrollPosition(el);
      const x = opts.offsetX ? opts.offsetX(scroll[0]) : `-${scroll[0]}px`;
      const y = opts.offsetY ? opts.offsetY(scroll[1]) : `-${scroll[1]}px`;
      
      el.style.transform = `translate(${x},${y})`;
    }
  }, 0);
  //@ts-ignore
  window.addEventListener("scroll", fn, true);
  //@ts-ignore
  window.addEventListener("resize", fn, true);
  //@ts-ignore
  window.addEventListener("update_position", fn, true);
  observer.observe(document, { subtree: true, childList: true });
}

/**
 * Attach behaviour when scroll or resize event happen
 * Ideal for setting fixed element position either through css transform
 * @param {HTMLElement} el
 * @param {Object} opts
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
