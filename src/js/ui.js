import resizer from "./utils/resizer.js";
import initialize from "./utils/initialize.js";
import q from "./utils/q.js";
import cookies from "./utils/cookies.js";

const initCallbacks = new Set();

class AdminiUi {
  /**
   * The minimenu behaviour of the sidebar is controlled by a toggle
   * We store the state in a cookie so that user preference is preserved and can be read by the server for rendering
   */
  minimenu() {
    const MINIMENU = "minimenu";

    // Class should be added serverside to avoid layout shift on load
    if (cookies(MINIMENU) === "1" && !document.body.classList.contains(MINIMENU)) {
      document.body.classList.add(MINIMENU);
    }

    initialize(".js-sidebar-toggle", (el) => {
      el.addEventListener("click", (ev) => {
        ev.preventDefault();

        document.body.classList.toggle(MINIMENU);
        const enabled = document.body.classList.contains(MINIMENU);
        // If you set a new cookie, other cookies are not overwritten
        if (enabled) {
          cookies(MINIMENU, 1);
        } else {
          cookies(MINIMENU, 0);
          const cta = document.querySelector(".sidebar-cta-content");
          if (cta) {
            //@ts-ignore
            cta.style.cssText = "";
          }
        }
        //@ts-ignore
        document.activeElement.blur();
        document.dispatchEvent(
          new CustomEvent("admini.minimenu", {
            detail: {
              state: enabled,
            },
          })
        );
      });
    });
  }

  /**
   * Enable all tooltips by default
   * You can also use the bs-toggle custom element
   */
  tooltips() {
    if (!window.bootstrap.Tooltip) {
      return;
    }
    initialize('[data-bs-toggle="tooltip"]', (el) => {
      if (!el.hasAttribute("title")) {
        el.setAttribute("title", el.innerText.trim());
      }
      window.bootstrap.Tooltip.getOrCreateInstance(el);
    });
  }

  /**
   * Sidebar layout is controlled with offcanvas but we may need to restore
   * visibility if it was hidden
   */
  toggleSidebar() {
    const MOBILE_SIZE = 768;
    /**
     * @type {HTMLElement}
     */
    const sidebar = document.querySelector("#sidebar");
    if (!sidebar) {
      return;
    }
    const classes = ["offcanvas", "offcanvas-start"];
    const w = window.innerWidth;
    if (w > MOBILE_SIZE) {
      // A simple fix in case we resized the window and the menu was hidden by offcanvas
      sidebar.style.visibility = "visible";
      sidebar.classList.remove("show");
      // Kill offcanvas if created
      if (sidebar.classList.contains("offcanvas")) {
        const sidebarOffcanvas = window.bootstrap.Offcanvas.getOrCreateInstance(sidebar);
        sidebarOffcanvas.dispose();
        sidebar.classList.remove(...classes);
      }
    }
    // BSN does not init offcanvas like BS5
    if (w <= MOBILE_SIZE) {
      sidebar.classList.add(...classes);
      const sidebarOffcanvas = window.bootstrap.Offcanvas.getOrCreateInstance(sidebar);
    }
  }

  hideSidebar() {
    /**
     * @type {HTMLElement}
     */
    const sidebar = document.querySelector("#sidebar");
    if (!sidebar) {
      return;
    }
    const sidebarOffcanvas = window.bootstrap.Offcanvas.getOrCreateInstance(sidebar);
    sidebarOffcanvas.hide();
  }

  hideDropdowns(root = document) {
    q("div", ".dropdown-menu.show", root).forEach((el) => {
      el.classList.remove("show");
    });
  }

  /**
   * Register js behaviour that augment responsive behaviour
   */
  responsive() {
    // A Set only add the value if it does not exist
    // Functions must be stateless to ensure they don't get added multiple times
    resizer.add(this.toggleSidebar);
    resizer.add(this.setMobileSize);
  }

  /**
   * Dismissable alerts with an id will be stored in a localStorage
   */
  dismissableAlerts() {
    initialize(".alert-dismissible[id]", (el) => {
      const storageKey = "admini.dismissed_alerts";
      let dismissed = localStorage.getItem(storageKey);
      let arr = dismissed ? JSON.parse(dismissed) : [];
      if (arr.includes(el.getAttribute("id"))) {
        el.style.display = "none";
      }
      // On close, add to storage
      el.addEventListener(
        "closed.bs.alert",
        () => {
          arr.push(el.getAttribute("id"));
          localStorage.setItem(storageKey, JSON.stringify(arr));
        },
        { once: true }
      );
    });
  }

  /**
   * Create toast from html. To create toast from js, use toaster
   */
  toasts() {
    initialize(".toast:not(.toaster)", (el) => {
      let toast = window.bootstrap.Toast.getOrCreateInstance(el);
      toast.show();
    });
  }

  /**
   * @link https://css-tricks.com/the-trick-to-viewport-units-on-mobile/
   */
  setMobileSize() {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty("--vh", `${vh}px`);
  }

  /**
   * Dark mode support
   */
  darkMode() {
    const THEME = "theme";
    const LIGHT = "light";
    const DARK = "dark";

    // Set mode according to html value
    let mode = document.documentElement.dataset.bsTheme ?? "";
    // If none set, check cookies
    // It's better to set it server side to avoid transition glitches
    if (!mode) {
      if (cookies(THEME) == LIGHT) {
        mode = LIGHT;
      } else if (cookies(THEME) == DARK) {
        mode = DARK;
      } else {
        mode = LIGHT;
      }
      document.documentElement.dataset.bsTheme = mode;
    }

    // We can have multiple toggles
    initialize(".js-darkmode-toggle", (el) => {
      // If we have a button toggle
      el.querySelectorAll("[value]").forEach((node) => {
        if (node.getAttribute("value") == mode) {
          node.removeAttribute("hidden");
        } else {
          node.setAttribute("hidden", "");
        }
      });
      // When clicking on a toggle
      el.addEventListener("click", (e) => {
        e.preventDefault();
        // Update mode
        if (document.documentElement.dataset.bsTheme == DARK) {
          mode = LIGHT;
        } else {
          mode = DARK;
        }
        cookies(THEME, mode);
        document.documentElement.dataset.bsTheme = mode;
        // Adjust all buttons
        document.querySelectorAll(".js-darkmode-toggle").forEach((el) => {
          el.querySelectorAll("[value]").forEach((node) => {
            if (node.getAttribute("value") == mode) {
              node.removeAttribute("hidden");
            } else {
              node.setAttribute("hidden", "");
            }
          });
        });
        // Notify
        document.dispatchEvent(
          new CustomEvent("admini.darkmode", {
            detail: {
              theme: mode,
            },
          })
        );
      });
    });
  }

  /**
   * Trigger dropdown from other elements
   */
  dropdownAlias() {
    const showClass = "show";
    const menuClass = ".dropdown-menu";

    // Alternative triggers for dropdowns
    initialize(".dropdown-alias", (el) => {
      const menu = el.parentElement.querySelector(menuClass);
      el.addEventListener("click", (e) => {
        menu.classList.toggle(showClass);
      });
    });
  }

  /**
   * @param {Function} cb
   */
  addInitCallback(cb) {
    initCallbacks.add(cb);
  }

  /**
   * @param {Function} cb
   */
  removeInitCallback(cb) {
    initCallbacks.delete(cb);
  }

  callInitCallbacks() {
    for (let callback of initCallbacks) {
      callback();
    }
  }

  init() {
    this.setMobileSize();
    this.responsive();
    this.minimenu();
    this.tooltips();
    this.dismissableAlerts();
    this.toasts();
    this.toggleSidebar();
    this.darkMode();
    this.dropdownAlias();
    this.callInitCallbacks();
  }
}

export default AdminiUi;
