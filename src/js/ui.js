import attach from "./utils/attach.js";
import debounce from "./utils/debounce.js";

const MOBILE_SIZE = 768;
const MINIMENU = "minimenu";
const THEME = "theme";

class AdminiUi {
  constructor() {
    /**
     * @type {HTMLElement}
     */
    this.sidebar = document.querySelector("#sidebar");
  }

  /**
   * The minimenu behaviour of the sidebar is controlled by a toggle
   * We store the state in a cookie so that user preference is preserved and can be read by the server for rendering
   */
  minimenu() {
    // Class should be added serverside to avoid layout shift on load
    if (document.cookie.includes(`${MINIMENU}=1`) && !document.body.classList.contains(MINIMENU)) {
      document.body.classList.add(MINIMENU);
    }

    document.querySelectorAll(".js-sidebar-toggle").forEach((el) => {
      el.addEventListener("click", (ev) => {
        ev.preventDefault();

        document.body.classList.toggle(MINIMENU);
        const enabled = document.body.classList.contains(MINIMENU);
        // If you set a new cookie, older cookies are not overwritten
        if (enabled) {
          document.cookie = `${MINIMENU}=1`;
        } else {
          document.cookie = `${MINIMENU}=0`;
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
    document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(
      /**
       * @param {HTMLElement} el
       */
      (el) => {
        if (!el.hasAttribute("title")) {
          el.setAttribute("title", el.innerText.trim());
        }
        window.bootstrap.Tooltip.getOrCreateInstance(el);
      }
    );
  }

  /**
   * Sidebar layout is controlled with offcanvas but we may need to restore
   * visibility if it was hidden
   * @param {Number} w
   * @return {bootstrap.Offcanvas|null}
   */
  toggleSidebar(w = null) {
    const classes = ["offcanvas", "offcanvas-start"];
    if (w === null) {
      w = window.innerWidth;
    }
    if (w > MOBILE_SIZE) {
      // A simple fix in case we resized the window and the menu was hidden by offcanvas
      this.sidebar.style.visibility = "visible";
      this.sidebar.classList.remove("show");
      // Kill offcanvas if created
      if (this.sidebar.classList.contains("offcanvas")) {
        const sidebarOffcanvas = window.bootstrap.Offcanvas.getOrCreateInstance(this.sidebar);
        sidebarOffcanvas.dispose();
        this.sidebar.classList.remove(...classes);
      }
    }
    // BSN does not init offcanvas like BS5
    if (w <= MOBILE_SIZE) {
      this.sidebar.classList.add(...classes);
      const sidebarOffcanvas = window.bootstrap.Offcanvas.getOrCreateInstance(this.sidebar);
      return sidebarOffcanvas;
    }
    return null;
  }

  /**
   * Register js behaviour that augment response behaviour
   */
  responsive() {
    const fn = debounce(() => {
      this.toggleSidebar(window.innerWidth);
      this.setMobileSize();
    });
    //@ts-ignore
    window.addEventListener("resize", fn);
  }

  /**
   * Dismissable alerts with an id will be stored in a localStorage
   */
  dismissableAlerts() {
    document.querySelectorAll(".alert-dismissible[id]").forEach((el) => {
      let dismissed = localStorage.getItem("dismissed_alerts");
      let arr = dismissed ? JSON.parse(dismissed) : [];
      if (arr.includes(el.getAttribute("id"))) {
        //@ts-ignore
        el.style.display = "none";
      }
      el.addEventListener(
        "closed.bs.alert",
        () => {
          arr.push(el.getAttribute("id"));
          localStorage.setItem("dismissed_alerts", JSON.stringify(arr));
        },
        { once: true }
      );
    });
  }

  /**
   * Create test from html. To create toast from js, use toaster
   */
  toasts() {
    let list = document.querySelectorAll(".toast:not(.toaster)");
    list.forEach((el) => {
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
   * Simple utilities for dropdowns
   */
  simpleDropdowns() {
    const showClass = "show";
    const menuClass = ".dropdown-menu";
    const fixedClass = "dropdown-fixed";

    // Dropdowns not using the bs-toggle
    document.querySelectorAll(".dropdown-toggle:not([data-bs-toggle])").forEach(
      /**
       * @param {HTMLElement} el
       */
      (el) => {
        /**
         * @type {HTMLElement}
         */
        const menu = el.parentElement.querySelector(menuClass);
        const isDropup = el.parentElement.classList.contains("dropup");
        el.ariaExpanded = menu.classList.contains(showClass) ? "true" : "false";
        el.addEventListener("click", (e) => {
          menu.classList.toggle(showClass);
          el.ariaExpanded = menu.classList.contains(showClass) ? "true" : "false";
          // Dropup need some love
          if (isDropup && !menu.classList.contains(fixedClass)) {
            menu.style.transform = "translateY(calc(-100% - " + el.offsetHeight + "px))";
          }
          // Another click should trigger blur
          if (!menu.classList.contains(showClass)) {
            //@ts-ignore
            document.activeElement.blur();
          }
          // Trigger positioning
          if (menu.classList.contains(fixedClass)) {
            menu.dispatchEvent(new CustomEvent("update_position"));
          }
        });
        el.addEventListener("blur", (e) => {
          menu.classList.remove(showClass);
        });

        // Fixed strategy
        if (menu.classList.contains(fixedClass)) {
          attach(menu, {
            parent: el,
            end: menu.classList.contains("dropdown-end"),
            offsetY: (y) => {
              return isDropup ? `calc(-100% - ${el.offsetHeight + y}px)` : `-${y}px`;
            },
          });
        }
      }
    );

    // Alternative triggers for dropdowns
    document.querySelectorAll(".dropdown-alias").forEach((el) => {
      const menu = el.parentElement.querySelector(menuClass);
      el.addEventListener("click", (e) => {
        menu.classList.toggle(showClass);
      });
    });
  }

  darkMode() {
    // Set mode according to html value
    let mode = document.documentElement.dataset.bsTheme ?? "";
    // If none set, check cookies
    // It's better to set it server side to avoid transition glitches
    if (!mode) {
      if (document.cookie.includes(`${THEME}=light`)) {
        mode = "light";
      } else if (document.cookie.includes(`${THEME}=dark`)) {
        mode = "dark";
      }
      document.documentElement.dataset.bsTheme = mode;
    }

    // Deal with selector
    const selector = document.querySelector("#toggle-dark-mode");
    if (selector) {
      selector.querySelectorAll("[value]").forEach((node) => {
        if (node.getAttribute("value") == mode) {
          node.removeAttribute("hidden");
        } else {
          node.setAttribute("hidden", "");
        }
      });
      selector.addEventListener("click", (e) => {
        e.preventDefault();
        if (document.documentElement.dataset.bsTheme == "dark") {
          mode = "light";
        } else {
          mode = "dark";
        }
        selector.querySelectorAll("[value]").forEach((node) => {
          if (node.getAttribute("value") == mode) {
            node.removeAttribute("hidden");
          } else {
            node.setAttribute("hidden", "");
          }
        });
        document.cookie = `${THEME}=${mode}`;

        document.documentElement.dataset.bsTheme = mode;
        document.dispatchEvent(
          new CustomEvent("admini.darkmode", {
            detail: {
              theme: mode,
            },
          })
        );
      });
    }
  }

  init() {
    this.setMobileSize();
    this.minimenu();
    this.tooltips();
    this.responsive();
    this.dismissableAlerts();
    this.toasts();
    this.toggleSidebar();
    this.simpleDropdowns();
    this.darkMode();
  }
}

export default AdminiUi;
