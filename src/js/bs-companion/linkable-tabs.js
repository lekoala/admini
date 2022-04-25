"use strict";

function setActiveTab(activeTab) {
  if (!activeTab.classList.contains("active")) {
    // Remove previous active if any
    var prevActiveTab = activeTab.parentElement.parentElement.querySelector(".active");
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
  let inst = bootstrap.Tab.getInstance(activeTab) || new bootstrap.Tab(activeTab);
  inst.show();
}

/**
 * Make tab fully linkable by using hash
 * Make sure you don't set a default active tab in your html
 * This only works for tabs with bs-target attribute, since there will be no navigation
 * @param {string} tabsSelector Selector for the tabs element that need to be deep linked
 */
export default function linkableTabs(tabsSelector = ".nav-tabs-linkable") {
  // Restore state
  let hash = document.location.hash;
  if (hash) {
    let parts = hash.split("__").slice(0, -1);
    parts.push(hash);
    parts.forEach((part) => {
      let activeTab = document.querySelector("[data-bs-target='" + part + "']");
      if (activeTab) {
        setActiveTab(activeTab);
      }
    });
  }

  document.querySelectorAll(tabsSelector).forEach((el) => {
    // They don't have a default tab active to avoid fouc
    let activeTab = el.querySelector(".active");
    if (!activeTab) {
      activeTab = el.querySelector("a:not([disabled])");
      if (!activeTab) {
        return;
      }
      setActiveTab(activeTab);
    }
    el.style.visibility = "visible";

    // Track tabs clicks
    el.addEventListener("show.bs.tab", (e) => {
      let hash = e.target.dataset.bsTarget;
      if (!hash) {
        return;
      }
      const url = new URL(window.location);
      url.hash = hash;
      window.history.pushState({}, "", url);
    });
  });
}
