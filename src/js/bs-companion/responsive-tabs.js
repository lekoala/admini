"use strict";

/**
 * Collapses tabs to a dropdown menu if there is not enough space on one line
 * @param {string} tabsSelector Selector for the tabs element that need to be responsive
 */
export default function responsiveTabs(tabsSelector = ".nav-tabs-responsive") {
  document.querySelectorAll(tabsSelector).forEach((el) => {
    // This only works if the nav is visible on page load
    let totalWidth = 0;
    el.querySelectorAll("li").forEach((tab) => {
      totalWidth += tab.offsetWidth;
    });
    el.style.visibility = "visible";
    el.dataset.tabsWidth = totalWidth;

    // Create mobile menu
    let menu = document.createElement("ul");
    menu.classList.add("dropdown-menu");
    el.querySelectorAll("a").forEach((link) => {
      let newChild = document.createElement("li");
      let newChildLink = document.createElement("a");
      let href = link.dataset.bsTarget || link.getAttribute("href");
      newChild.append(newChildLink);
      newChildLink.classList.add(...["dropdown-item", "no-br"]);
      newChildLink.innerHTML = link.innerHTML.replace(/<br[^>]*>/, " ");
      newChildLink.setAttribute("href", href);
      if (link.classList.contains("disabled")) {
        newChildLink.classList.add("disabled");
      }
      // Forwards clicks to avoid binding stuff twice
      newChildLink.addEventListener("click", (ev) => {
        ev.preventDefault();
        link.dispatchEvent(new Event("click"));
      });
      menu.append(newChild);
    });
    el.parentElement.append(menu);

    // Register observer to trigger responsive layout
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const tabs = entry.target.querySelector(tabsSelector);
        // check inlineSize (width) or blockSize (height)
        const contentBoxSize = Array.isArray(entry.contentBoxSize) ? entry.contentBoxSize[0] : entry.contentBoxSize;
        const size = contentBoxSize.inlineSize - 30;
        if (size < tabs.dataset.tabsWidth) {
          tabs.classList.add("nav-tabs-dropdown");
        } else if (size >= tabs.dataset.tabsWidth) {
          tabs.classList.remove("nav-tabs-dropdown");
          menu.style.display = "none";
        }
      }
    });
    resizeObserver.observe(el.parentElement);

    // Handle responsive clicks
    el.querySelectorAll("a.nav-link").forEach((a) => {
      a.addEventListener("click", (ev) => {
        if (!a.classList.contains("active")) {
          return;
        }
        if (!a.parentElement.parentElement.classList.contains("nav-tabs-dropdown")) {
          return;
        }
        // Hide current element
        let hidden = menu.querySelector("a.d-none");
        if (hidden) {
          hidden.classList.remove("d-none");
        }
        let href = a.dataset.bsTarget || a.getAttribute("href");
        let active = menu.querySelector("a[href='" + href + "']");
        if (active) {
          active.classList.add("d-none");
        }

        // Toggle menu
        if (menu.style.display == "block") {
          menu.style.display = "none";
        } else {
          menu.style.display = "block";
          menu.style.top = a.parentElement.offsetHeight + "px";
        }
      });
    });
  });
}
