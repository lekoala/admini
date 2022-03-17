"use strict";
export default function cssDropdowns() {
  document.querySelectorAll('[data-bs-toggle="dropdown"]').forEach((el) => {
    el.addEventListener("click", (e) => {
      el.classList.toggle("dropdown-focus");
      if (!el.classList.contains("dropdown-focus")) {
        document.activeElement.blur();
      }
    });
    el.addEventListener("blur", (e) => {
      el.classList.remove("dropdown-focus");
    });
  });
}
