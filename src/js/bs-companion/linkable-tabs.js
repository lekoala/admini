"use strict";

class LinkableTabs {

  /**
   * @param {HTMLElement} el 
   */
  constructor(el) {
    this.restoreState();
    // They don't have a default tab active to avoid fouc
    let activeTab = el.querySelector(".active");
    if (!activeTab) {
      activeTab = el.querySelector("a:not([disabled])");
      if (!activeTab) {
        return;
      }
      this.setActiveTab(activeTab);
    }
    el.style.visibility = "visible";
    this.triggerLazyElements(activeTab);

    // e.target is the a.nav-link element
    el.addEventListener("show.bs.tab", (e) => {
      this.triggerLazyElements(e.target);

      // Track tabs clicks
      const hash = e.target.dataset.bsTarget;
      if (hash) {
        const url = new URL(window.location);
        url.hash = hash;
        window.history.pushState({}, "", url);
      }
    });
  }

  restoreState() {
    let hash = document.location.hash;
    if (!hash) {
      return;
    }
    let parts = hash.split("__").slice(0, -1);
    parts.push(hash);
    parts.forEach((part) => {
      let activeTab = document.querySelector("[data-bs-target='" + part + "']");
      if (activeTab) {
        this.setActiveTab(activeTab);
      }
    });
  }

  /**
   * @param {HTMLElement} activeTab the link item
   */
  setActiveTab(activeTab) {
    if (!activeTab.classList.contains("active")) {
      // Remove previous active if any
      var prevActiveTab =
        activeTab.parentElement.parentElement.querySelector(".active");
      if (prevActiveTab) {
        prevActiveTab.classList.remove("active");
      }
      // Set current
      activeTab.classList.add("active");
    }
    let target = document.querySelector(activeTab.dataset.bsTarget);
    if (target) {
      // Remove previous active if any
      let prevTarget = target.parentElement.querySelector(".active");
      if (prevTarget && prevTarget != target) {
        prevTarget.classList.remove(...["active", "show"]);
      }
      target.classList.add(...["active", "show"]);
    }
    let inst =
      bootstrap.Tab.getInstance(activeTab) || new bootstrap.Tab(activeTab);

    inst.show();
  }

  /**
   * @param {HTMLElement} activeTab the link item
   */
  triggerLazyElements(activeTab) {
    if (!activeTab.offsetWidth) {
      return; // not visible
    }
    let target = document.querySelector(activeTab.dataset.bsTarget);
    if (!target) {
      return; // no valid target
    }
    let lazySelector = target.dataset.lazySelector ?? ".lazy-loadable";
    let lazyEvent = target.dataset.lazyEvent ?? "lazyload";
    target.querySelectorAll(lazySelector).forEach((el) => {
      el.dispatchEvent(new Event(lazyEvent, { bubbles: true }));
    });
  }

  /**
   * Make tab fully linkable by using hash
   * Make sure you don't set a default active tab in your html
   * This only works for tabs with bs-target attribute, since there will be no navigation
   * @param {string} selector Selector for the tabs element that need to be deep linked
   */
  static init(selector = ".nav-tabs-linkable") {
    document.querySelectorAll(selector).forEach((el) => {
      new LinkableTabs(el);
    });
  }
}

/**
 * Make tab fully linkable by using hash
 * Make sure you don't set a default active tab in your html
 * This only works for tabs with bs-target attribute, since there will be no navigation
 * @param {string} tabsSelector Selector for the tabs element that need to be deep linked
 */
export default LinkableTabs;
