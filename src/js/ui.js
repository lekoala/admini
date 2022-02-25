import Cookies from "js-cookie";

const MOBILE_SIZE = 768;
const MINIMENU = "minimenu";

class AdminiUi {
  constructor() {
    this.sidebar = document.querySelector("#sidebar");
  }

  /**
   * The minimenu behaviour of the sidebar is controlled by a toggle
   * We store the state in a cookie so that user preference is preserved
   */
  minimenu() {
    const el = document.querySelector("#js-sidebar-toggle");
    el.addEventListener("click", (ev) => {
      ev.preventDefault();

      document.body.classList.toggle(MINIMENU);
      if (document.body.classList.contains(MINIMENU)) {
        Cookies.set(MINIMENU, 1);
      } else {
        Cookies.remove(MINIMENU);
        const cta = document.querySelector(".sidebar-cta-content");
        if (cta) {
          cta.style.cssText = "";
        }
      }
      document.activeElement.blur();
      this.toggleMobileTooltips(window.innerWidth);
    });
    // This should be done by the serverside to avoid layout shift on load
    if (Cookies.get(MINIMENU) && !document.body.classList.contains(MINIMENU)) {
      document.body.classList.add(MINIMENU);
    }
  }

  /**
   * Enable all tooltips by default
   */
  tooltips() {
    document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach((el) => {
      if (!el.hasAttribute("title")) {
        el.setAttribute("title", el.innerHTML);
      }
      let tooltip = bootstrap.Tooltip.getInstance(el) || new bootstrap.Tooltip(el);
    });
    this.toggleMobileTooltips(window.innerWidth);
  }

  /**
   * Some elements are collapsed down to tooltips (eg: badges) if the screen size is too small
   * @param {int} w
   */
  toggleMobileTooltips(w) {
    document.querySelectorAll('[data-bs-toggle="tooltip"].js-mobile-tooltip').forEach((el) => {
      let tooltip = bootstrap.Tooltip.getInstance(el) || new bootstrap.Tooltip(el);
      // On large screen, display the badge
      if (w > MOBILE_SIZE && el.offsetWidth > 12) {
        tooltip.disable();
        el.removeAttribute("title");
      } else {
        // Enable tooltip for small screen or small items based on its content
        tooltip.enable();
      }
    });
  }

  /**
   * Sidebar layout is controlled with offcanvas but we may need to restore
   * visibility if it was hidden
   * @param {int} w
   */
  toggleSidebar(w = null) {
    if (w === null) {
      w = window.innerWidth;
    }
    if (w > MOBILE_SIZE) {
      // A simple fix in case we resized the window and the menu was hidden by offcanvas
      this.sidebar.style.visibility = "visible";
      this.sidebar.classList.remove("offcanvas");
    }
    // BSN does not init offcanvas like BS5
    if (w <= MOBILE_SIZE) {
      this.sidebar.classList.add("offcanvas");
      const sidebarOffcanvas = bootstrap.Offcanvas.getInstance(this.sidebar) || new bootstrap.Offcanvas(this.sidebar);
    }
  }

  /**
   * Register js behaviour that augment response behaviour
   */
  responsive() {
    window.addEventListener("resize", () => {
      this.toggleMobileTooltips(window.innerWidth);
      this.toggleSidebar(window.innerWidth);
    });
  }

  /**
   * Dismissable alerts with an id will be stored in a cookie
   * You might even skip rendering entirely by checking the cookies with the server
   */
  dismissableAlerts() {
    document.querySelectorAll(".alert-dismissible[id]").forEach((el) => {
      let dismissed = Cookies.get("dismissed_alerts");
      if (!dismissed) {
        dismissed = [];
      }
      if (dismissed.includes(el.getAttribute("id"))) {
        el.style.display = "none";
      }
      el.addEventListener("closed.bs.alert", () => {
        dismissed.push(el.getAttribute("id"));
        Cookies.set("dismissed_alerts", dismissed);
      });
    });
  }

  /**
   * Dead simple confirm
   */
  confirmable() {
    document.querySelectorAll("button[data-confirm]").forEach((el) => {
      el.addEventListener("click", (e) => {
        if (!confirm(el.dataset.confirm)) {
          e.preventDefault();
        }
      });
    });
  }

  /**
   * Create test from html. To create toast from js, use bs5.toast
   */
  toasts() {
    let list = document.querySelectorAll(".toast");
    list.forEach((el) => {
      let toast = new bootstrap.Toast(el);
      toast.show();
    });
  }

  /**
   * Deep link for nav tabs
   */
  trackTabs() {
    // Restore state
    let hash = document.location.hash;
    if (hash) {
      let parts = hash.split("__").slice(0, -1);
      parts.push(hash);
      parts.forEach((part) => {
        let activeTab = document.querySelector("[data-bs-target='" + part + "']");
        if (activeTab) {
          if (!activeTab.classList.contains("active")) {
            activeTab.classList.add("active");
            document.querySelector(activeTab.dataset.bsTarget).classList.add(...["active", "show"]);
          }
          let inst = bootstrap.Tab.getInstance(activeTab) || new bootstrap.Tab(activeTab);
          inst.show();
        }
      });
    }

    document.querySelectorAll(".nav-tabs-deep").forEach((el) => {
      // They don't have a default tab active to avoid fouc
      let activeTab = el.querySelector(".active");
      if (!activeTab) {
        activeTab = el.querySelector("a:not([disabled])");
        if (!activeTab) {
          return;
        }
        activeTab.classList.add("active");
        document.querySelector(activeTab.dataset.bsTarget).classList.add(...["active", "show"]);
        let inst = bootstrap.Tab.getInstance(activeTab) || new bootstrap.Tab(activeTab);
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

  /**
   * Automatically hide row as needed
   * Add a .table-responsive-hide class to th for columns that are optional
   */
  responsiveTables() {
    // Make sure we have colindex to allowing mixing th and td on a row
    document.querySelectorAll(".table-responsive-auto").forEach((el) => {
      el.querySelectorAll("tr").forEach((row) => {
        // Ensure we have an index (starts at 1)
        let idx = 0;
        row.querySelectorAll("th,td").forEach((col) => {
          idx++;
          if (!col.ariaColIndex) {
            col.ariaColIndex = idx;
          }
        });
      });

      // Register observer to trigger responsive layout
      const resizeObserver = new ResizeObserver((entries) => {
        for (let entry of entries) {
          const container = entry.target;
          const table = container.querySelector("table");
          // check inlineSize (width) or blockSize (height)
          const contentBoxSize = Array.isArray(entry.contentBoxSize) ? entry.contentBoxSize[0] : entry.contentBoxSize;
          const diff = table.offsetWidth - contentBoxSize.inlineSize;
          let remaining = diff;
          if (!table.dataset.baseWidth) {
            table.dataset.baseWidth = table.offsetWidth;
          }

          // The table is too big
          if (table.offsetWidth > contentBoxSize.inlineSize) {
            table.querySelectorAll(".table-responsive-hide").forEach((col) => {
              const colWidth = col.offsetWidth;
              const colIdx = col.ariaColIndex;

              if (remaining < 0) {
                return;
              }
              col.dataset.originalWidth = colWidth;
              // Hide all columns with this index
              table.querySelectorAll("[aria-colindex='" + colIdx + "']").forEach((idxCol) => {
                idxCol.setAttribute("hidden", "hidden");
              });
              remaining -= colWidth;
            });
          } else {
            // Do we have any hidden column that we can restore ?
            table.querySelectorAll(".table-responsive-hide[hidden]").forEach((col) => {
              const colWidth = parseInt(col.dataset.originalWidth);
              const colIdx = col.ariaColIndex;

              if (contentBoxSize.inlineSize < colWidth + parseInt(table.dataset.baseWidth)) {
                return;
              }
              // Hide all columns with this index
              table.querySelectorAll("[aria-colindex='" + colIdx + "']").forEach((idxCol) => {
                idxCol.removeAttribute("hidden");
              });
              remaining += colWidth;
            });
          }
        }
      });
      resizeObserver.observe(el);
    });
  }

  responsiveTabs() {
    document.querySelectorAll(".nav-tabs-responsive").forEach((el) => {
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
        newChild.append(newChildLink);
        newChildLink.classList.add(...["dropdown-item", "no-br"]);
        newChildLink.innerHTML = link.innerHTML.replace(/<br[^>]*>/, " ");
        newChildLink.setAttribute("href", link.dataset.bsTarget);
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
          const tabs = entry.target.querySelector(".nav-tabs-responsive");
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
          let active = menu.querySelector("a[href='" + a.dataset.bsTarget + "']");
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

  init() {
    this.minimenu();
    this.tooltips();
    this.responsive();
    this.trackTabs();
    this.responsiveTabs();
    this.responsiveTables();
    this.dismissableAlerts();
    this.confirmable();
    this.toasts();
    this.toggleSidebar();
  }
}

export default AdminiUi;
