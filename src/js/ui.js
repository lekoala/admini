import Cookies from "js-cookie";
import ResponsiveTabs from "./bs-companion/responsive-tabs";
import LinkableTabs from "./bs-companion/linkable-tabs";
import ResponsiveTable from "./bs-companion/responsive-table";
import "./bs-companion/bs-tabs";

const MOBILE_SIZE = 768;
const MINIMENU = "minimenu";

class AdminiUi {
  constructor() {
    this.sidebar = document.querySelector("#sidebar");

    // Expose as public properties
    this.ResponsiveTabs = ResponsiveTabs;
    this.LinkableTabs = LinkableTabs;
    this.ResponsiveTable = ResponsiveTable;
  }

  /**
   * The minimenu behaviour of the sidebar is controlled by a toggle
   * We store the state in a cookie so that user preference is preserved
   */
  minimenu() {
    // This should be done by the serverside to avoid layout shift on load
    if (Cookies.get(MINIMENU) && !document.body.classList.contains(MINIMENU)) {
      document.body.classList.add(MINIMENU);
    }

    document.querySelectorAll(".js-sidebar-toggle").forEach((el) => {
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
    });
  }

  /**
   * Enable all tooltips by default
   */
  tooltips() {
    document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach((el) => {
      if (!el.hasAttribute("title")) {
        el.setAttribute("title", el.innerHTML);
      }
      if (bootstrap.Tooltip) {
        bootstrap.Tooltip.getInstance(el) || new bootstrap.Tooltip(el);
      } else {
        // rely on css tooltips
        el.dataset.title = el.getAttribute("title");
        el.removeAttribute("title");
      }
    });
    this.toggleMobileTooltips(window.innerWidth);
  }

  /**
   * Some elements are collapsed down to tooltips (eg: badges) if the screen size is too small
   * @param {int} w
   */
  toggleMobileTooltips(w) {
    if (!bootstrap.Tooltip) {
      return;
    }
    document
      .querySelectorAll('[data-bs-toggle="tooltip"].js-mobile-tooltip')
      .forEach((el) => {
        let tooltip =
          bootstrap.Tooltip.getInstance(el) || new bootstrap.Tooltip(el);
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
   * @return {bootstrap.Offcanvas|null}
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
      const sidebarOffcanvas =
        bootstrap.Offcanvas.getInstance(this.sidebar) ||
        new bootstrap.Offcanvas(this.sidebar);
      return sidebarOffcanvas;
    }
    return null;
  }

  /**
   * Register js behaviour that augment response behaviour
   */
  responsive() {
    window.addEventListener("resize", () => {
      this.toggleMobileTooltips(window.innerWidth);
      this.toggleSidebar(window.innerWidth);
      this.setMobileSize();
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
      el.addEventListener(
        "closed.bs.alert",
        () => {
          dismissed.push(el.getAttribute("id"));
          Cookies.set("dismissed_alerts", dismissed);
        },
        { once: true }
      );
    });
  }

  /**
   * Create test from html. To create toast from js, use toaster
   */
  toasts() {
    let list = document.querySelectorAll(".toast");
    list.forEach((el) => {
      let toast = new bootstrap.Toast(el);
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

  simpleDropdowns() {
    document
      .querySelectorAll(".dropdown-toggle:not([data-bs-toggle])")
      .forEach((el) => {
        const menu = el.parentElement.querySelector(".dropdown-menu");
        el.addEventListener("click", (e) => {
          menu.classList.toggle("show");
          if (!menu.classList.contains("show")) {
            document.activeElement.blur();
          }
        });
        el.addEventListener("blur", (e) => {
          menu.classList.remove("show");
        });
      });
  }

  init() {
    // this.setMobileSize();
    this.minimenu();
    this.tooltips();
    this.responsive();
    this.dismissableAlerts();
    this.toasts();
    this.toggleSidebar();
    this.simpleDropdowns();

    // BS Companion
    ResponsiveTable.init();
    ResponsiveTabs.init();
    LinkableTabs.init();
  }
}

export default AdminiUi;
