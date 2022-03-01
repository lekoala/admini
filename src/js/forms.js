import Superfile from "superfile";
import Tags from "bootstrap5-tags";
import flatpickr from "flatpickr";
import Cleave from "cleave.js";
import toaster from "./bs-companion/toaster.js";
import normalizeData from "./bs-companion/normalize-data.js";

class AdminiForms {
  constructor() {}

  init() {
    // https://github.com/lekoala/bootstrap5-tags
    Tags.init();

    // https://github.com/lekoala/superfile
    Superfile.init();

    // https://nosir.github.io/cleave.js/
    this.cleave();

    // https://flatpickr.js.org/
    this.flatpickr();

    // https://getbootstrap.com/docs/5.0/forms/validation/
    this.validation();
  }

  /**
   * @param {object} object
   * @returns {object}
   */
  static parseDataset(object) {
    const attributes = {};
    Object.keys(object).forEach((key) => {
      attributes[key] = normalizeData(object[key]);
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
              toaster({
                body: form.dataset.validationMessage,
                className: "border-0 bg-danger text-white",
              });
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
