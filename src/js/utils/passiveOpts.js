const supportedPassiveTypes = [
  "scroll",
  "wheel",
  // https://www.w3.org/TR/touch-events/#list-of-touchevent-types
  // there is no touchenter and touchleave
  "touchstart",
  "touchmove",
  "touchend",
  "mouseout",
  "mouseleave",
  "mouseup",
  "mousedown",
  "mousemove",
  "mouseenter",
  "mousewheel",
  "mouseover",
];

/**
 * @link https://developer.chrome.com/docs/lighthouse/best-practices/uses-passive-event-listeners/
 * @param {string} type
 * @param {AddEventListenerOptions|Boolean} opts
 * @returns {AddEventListenerOptions}
 */
function passiveOpts(type, opts = {}) {
  if (typeof opts === "boolean") {
    opts = {
      capture: opts,
    };
  }
  if (supportedPassiveTypes.includes(type)) {
    opts.passive = true;
  }
  return opts;
}

export default passiveOpts;
