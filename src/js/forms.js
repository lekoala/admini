import Superfile from "superfile";
import Tags from "bootstrap5-tags";
import flatpickr from "flatpickr";
import Cleave from "cleave.js";
import normalizeData from "./bs-companion/normalize-data.js";
import FormValidator from "./bs-companion/form-validator.js";

class AdminiForms {
  constructor() {
    // Expose as public properties
    this.FormValidator = FormValidator;
  }

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
    FormValidator.init();
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
   * @link https://nosir.github.io/cleave.js/
   */
  cleave() {
    // Use data attributes to configure
    document.querySelectorAll("input.cleave").forEach((el) => {
      new Cleave(el, AdminiForms.parseDataset(el.dataset));
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
