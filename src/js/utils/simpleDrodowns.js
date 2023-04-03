import attach from "./attach.js";

/**
 * Simple utilities if you don't use bootstrap dropdowns
 */
export default function simpleDropdowns() {
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
