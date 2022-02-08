import Superfile from "superfile";
import Tags from "bootstrap5-tags";
import flatpickr from "flatpickr";
import Cleave from "cleave.js";
import bs5 from "bs5-toast";

class AdminiForms {
  constructor() {}

  init() {
    // https://github.com/lekoala/bootstrap5-tags
    Tags.init();

    // https://github.com/lekoala/superfile
    Superfile.init();

    this.cleave();
    this.flatpickr();

    this.validation();
  }

  /**
   *
   * @param {string} val
   */
  static normalizeData(val) {
    if (val === "true") {
      return true;
    }
    if (val === "false") {
      return false;
    }
    if (val === Number(val).toString()) {
      return Number(val);
    }
    if (val === "" || val === "null") {
      return null;
    }
    if (val.indexOf("[") === 0 || val.indexOf("{") === 0) {
      try {
        return JSON.parse(val.replaceAll("'", '"'));
      } catch {
        console.log("Failed to parse " + val);
        return {};
      }
    }
    return val;
  }

  /**
   * @param {object} object
   * @returns {object}
   */
  static parseDataset(object) {
    const attributes = {};
    Object.keys(object).forEach((key) => {
      attributes[key] = AdminiForms.normalizeData(object[key]);
    });
    return attributes;
  }

  /**
   * @link https://getbootstrap.com/docs/5.1/forms/validation/
   */
  validation() {
    // Loop over them and prevent submission
    document.querySelectorAll(".needs-validation").forEach((form) => {
      if (!form.hasAttribute("novalidate")) {
        form.setAttribute("novalidate", "");
      }
      form.addEventListener(
        "submit",
        (event) => {
          form.querySelectorAll(".nav-tabs .nav-link.is-invalid").forEach((link) => {
            link.classList.remove("is-invalid");
          });
          form.querySelectorAll(".accordion-item.is-invalid").forEach((accordionItem) => {
            accordionItem.classList.remove("is-invalid");
          });
          Array.from(form.elements).forEach((el) => {
            if (!el.checkValidity()) {
              // Mark all tabs and accordions as invalid as well
              let parent = el.parentElement;
              let accordion = null;
              while (parent && !parent.classList.contains("tab-pane")) {
                if (parent.classList.contains("accordion-item")) {
                  accordion = parent;
                }
                parent = parent.parentElement;
              }
              if (parent && !parent.classList.contains("active")) {
                let link = form.querySelector("a[data-bs-target='#" + parent.getAttribute("id") + "']");
                if (link) {
                  link.classList.add("is-invalid");
                }
              }
              if (accordion) {
                accordion.classList.add("is-invalid");
              }
            }
          });

          if (!form.checkValidity()) {
            event.preventDefault();
            event.stopPropagation();
            // Show message
            if (form.dataset.validationMessage) {
              const errToast = new bs5.Toast({
                body: form.dataset.validationMessage,
                className: "border-0 bg-danger text-white",
                btnCloseWhite: true,
              });
              errToast.show();
            }
          }

          form.classList.add("was-validated");
        },
        false
      );
    });
  }

  /**
   * @link https://nosir.github.io/cleave.js/
   */
  cleave() {
    // Use data attributes to configure
    document.querySelectorAll("input.cleave").forEach((el) => {
      const cleave = new Cleave(el, AdminiForms.parseDataset(el.dataset));
    });
  }

  /**
   * @link https://flatpickr.js.org/getting-started/
   */
  flatpickr() {
    document.querySelectorAll("input.flatpickr").forEach((el) => {
      flatpickr(el, AdminiForms.parseDataset(el.dataset));
    });
  }
}

export default AdminiForms;
