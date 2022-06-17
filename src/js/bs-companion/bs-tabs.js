import LinkableTabs from "./linkable-tabs.js";
import ResponsiveTabs from "./responsive-tabs.js";

/**
 * This custom element will trigger much faster than having to wait for the whole dom to load
 * and init to be triggered. This will make the overall UI feel more responsive
 */
class BsTabs extends HTMLElement {
  constructor() {
    // Always call super first in constructor
    super();

    this.style.visibility = "hidden";
  }

  connectedCallback() {
    if (this.getAttribute("linkable")) {
      new LinkableTabs(this.querySelector("ul"));
    }
    if (this.getAttribute("responsive")) {
      new ResponsiveTabs(this.querySelector("ul"));
    }
    this.style.visibility = "visible";
  }
}

customElements.define("bs-tabs", BsTabs);
