"use strict";

/**
 * Create a modal object. The api follows sweetalert for the most part.
 *
 * @param {string} attr.body Body content. Can also be filled with html tags (eg: Hello <b>World</b>)
 * @param {string} attr.title (none) Title content. Can also be filled with html tags (eg : <h6 class="mb-0">Success</h6>)
 * @param {string} attr.id (modal-{ts}) Specific id if required
 * @param {boolean} attr.static (false) Static backdrop
 * @param {boolean} attr.scrollable (true) Scrollable modal
 * @param {boolean} attr.centered (true) Centered modal
 * @param {boolean} attr.animated (true) Animated modal
 * @param {boolean} attr.fullscreen (false) Fullscreen modal
 * @param {boolean} attr.showCloseButton (false)
 * @param {boolean} attr.showCancelButton (false)
 * @param {boolean} attr.showDenyButton (false)
 * @param {string} attr.closeButtonLabel (Close)
 * @param {string} attr.confirmButtonText (Ok)
 * @param {string} attr.cancelButtonText (Cancel)
 * @param {string} attr.denyButtonText (Deny)
 * @param {string} attr.size (none) Size of the modal (sm|md|lg)
 * @returns {bootstrap.Modal}
 */
function openModal(attr, options = {}) {
  // Shortcut
  if (typeof attr === "string") {
    attr = {
      body: attr,
    };
  }

  // Defaults
  const defaults = {
    id: "modal-" + Date.now(),
    size: "",
    animated: true,
    scrollable: true,
    centered: true,
    fullscreen: false,
    showCloseButton: false,
    showCancelButton: false,
    showDenyButton: false,
    confirmButtonText: "Ok",
    cancelButtonText: "Cancel",
    denyButtonText: "Deny",
    closeButtonLabel: "Close",
    icon: "warning",
  };
  attr = Object.assign(defaults, attr);

  // Build template
  let staticAttr = ` data-bs-backdrop="static" data-bs-keyboard="false"`;
  let template = document.createElement("template");
  template.innerHTML = `<div class="modal${attr.scrollable ? " fade" : ""}${attr.size ? " modal-" + attr.size : ""}" id="${attr.id}"${attr.static ? staticAttr : ""} tabindex="-1" aria-hidden="true">
  <div class="modal-dialog${attr.scrollable ? " modal-dialog-scrollable" : ""}${attr.scrollable ? " modal-dialog-centered " : ""}${attr.fullscreen ? " modal-fullscreen" : ""}">
    <div class="modal-content text-center">
      <div class="p-3 pt-4 pb-0"><div class="modal-icon modal-${attr.icon}"></div></div>
      <div class="modal-title d-flex p-3 pt-4 pb-0 align-items-center justify-content-center">
        <h5 class="modal-title fs-2">${attr.title}</h4>
        <button type="button" class="btn-close position-absolute top-0 end-0 m-3" data-bs-dismiss="modal" aria-label="${attr.closeButtonLabel}"></button>
      </div>
      <div class="modal-body">
        ${attr.body}
      </div>
      <div class="modal-actions d-flex p-3 pt-0 pb-4 align-items-center justify-content-center">
        <button type="button" data-event="close" class="btn btn-primary mx-2">${attr.confirmButtonText}</button>
        <button type="button" data-event="deny" class="btn btn-danger mx-2">${attr.denyButtonText}</button>
        <button type="button" data-event="cancel" class="btn btn-secondary mx-2">${attr.cancelButtonText}</button>
      </div>
      <div class="modal-footer justify-content-center">
         ${attr.footer}
      </div>
    </div>
    </div>
  </div>
</div>
`;
  let el = template.content.firstChild;
  if (!attr.title) {
    el.querySelector(".modal-title").remove();
  }
  if (!attr.showCloseButton) {
    el.querySelector(".btn-close").remove();
  }
  if (!attr.showCancelButton) {
    el.querySelector(".btn-secondary").remove();
  }
  if (!attr.showDenyButton) {
    el.querySelector(".btn-danger").remove();
  }
  if (!attr.footer) {
    el.querySelector(".modal-footer").remove();
  }
  document.body.insertAdjacentElement("afterbegin", el);
  let modal = new bootstrap.Modal(el, options);
  // Cleanup instead of just hiding
  el.addEventListener("hidden.bs.modal", () => {
    document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach((el) => bootstrap.Tooltip.getInstance(el).dispose());
    document.querySelectorAll('[data-bs-toggle="popover"]').forEach((el) => bootstrap.Popover.getInstance(el).dispose());
    // modal.dispose();
    el.remove();
  });

  // Trigger hide
  el.querySelectorAll(".modal-actions button").forEach((btn) => {
    btn.addEventListener("click", (ev) => {
      modal.hide();
      el.dispatchEvent(new Event("modal." + btn.dataset.event, { bubbles: true }));
    });
  });

  // BSN needs explicit init
  document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach((el) => bootstrap.Tooltip.getInstance(el) || new bootstrap.Tooltip(el));
  document.querySelectorAll('[data-bs-toggle="popover"]').forEach((el) => bootstrap.Popover.getInstance(el) || new bootstrap.Popover(el));

  modal.show();

  // Show animation
  if (attr.icon && attr.animated) {
    el.querySelector(".modal-icon").classList.add("modal-icon-show");
  }

  return modal;
}

export default openModal;
