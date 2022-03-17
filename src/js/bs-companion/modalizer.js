"use strict";

/**
 * Create a modal object.
 *
 * @param {string} attr.body Body content. Can also be filled with html tags (eg: Hello <b>World</b>)
 * @param {string} attr.title (none) Title content. Can also be filled with html tags (eg : <h6 class="mb-0">Success</h6>)
 * @param {string} attr.id (modal-{ts}) Specific id if required
 * @param {boolean} attr.static (false) Static backdrop
 * @param {boolean} attr.scrollable (true) Scrollable modal
 * @param {boolean} attr.centered (true) Centered modal
 * @param {boolean} attr.animated (true) Animated modal
 * @param {boolean} attr.fullscreen (false) Fullscreen modal
 * @param {boolean} attr.showClose (true)
 * @param {boolean} attr.showConfirm (false)
 * @param {boolean} attr.showCancel (false)
 * @param {boolean} attr.showDeny (false)
 * @param {string} attr.closeLabel (Close)
 * @param {string} attr.confirmText (v)
 * @param {string} attr.confirmClass (success)
 * @param {string} attr.cancelText (x)
 * @param {string} attr.cancelClass (light)
 * @param {string} attr.denyText (/)
 * @param {string} attr.denyClass (danger)
 * @param {string} attr.size (none) Size of the modal (sm|md|lg)
 * @param {string} attr.showIcon (true)
 * @param {string} attr.icon (alert)
 * @returns {bootstrap.Modal}
 */
export default function modalizer(attr = {}) {
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
    static: false,
    animated: true,
    scrollable: true,
    centered: true,
    fullscreen: false,
    showClose: true,
    closeLabel: "Close",
    showConfirm: false,
    confirmText: '<l-i name="check" size="18"></l-i>',
    confirmClass: "success",
    showCancel: false,
    cancelText: '<l-i name="close" size="18"></l-i>',
    cancelClass: "light",
    showDeny: false,
    denyText: '<l-i name="block" size="18"></l-i>',
    denyClass: "danger",
    showIcon: true,
    icon: "warning",
  };
  attr = Object.assign(defaults, attr);

  // Build template
  let staticAttr = ` data-bs-backdrop="static" data-bs-keyboard="false"`;
  let template = document.createElement("template");
  template.innerHTML = `<div class="modal${attr.scrollable ? " fade" : ""}${attr.size ? " modal-" + attr.size : ""}" id="${attr.id}"${
    attr.static ? staticAttr : ""
  } tabindex="-1" aria-hidden="true">
  <div class="modal-dialog${attr.scrollable ? " modal-dialog-scrollable" : ""}${attr.scrollable ? " modal-dialog-centered " : ""}${
    attr.fullscreen ? " modal-fullscreen" : ""
  }">
    <div class="modal-content text-center">
     <button type="button" class="btn-close position-absolute top-0 end-0 m-3" data-bs-dismiss="modal" aria-label="${
       attr.closeLabel
     }"></button>
      <div class="modal-icon-holder p-3 pt-4 pb-0"><div class="modal-icon modal-${attr.icon}"></div></div>
      <div class="modal-title d-flex p-3 pt-4 pb-0 align-items-center justify-content-center">
        <h5 class="fs-2">${attr.title}</h4>
      </div>
      <div class="modal-body"><form>
        ${attr.body}
      </form></div>
      <div class="modal-actions d-flex mt-2 justify-content-center">
        <div class="btn-group flex-fill" style="min-height:44px">
          <button type="button" data-event="cancel" class="btn btn-${attr.cancelClass} rounded-0">${attr.cancelText}</button>
          <button type="button" data-event="deny" class="btn btn-${attr.denyClass} rounded-0">${attr.denyText}</button>
          <button type="button" data-event="confirm" class="btn btn-${attr.confirmClass} rounded-0">${attr.confirmText}</button>
        </div>
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
  if (!attr.showIcon) {
    el.querySelector(".modal-icon-holder").remove();
  }
  if (!attr.showClose) {
    el.querySelector(".btn-close").remove();
  }
  if (!attr.showCancel) {
    el.querySelector('[data-event="cancel"]').remove();
  }
  if (!attr.showDeny) {
    el.querySelector('[data-event="deny"]').remove();
  }
  if (!attr.showConfirm) {
    el.querySelector('[data-event="confirm"]').remove();
  }
  if (!attr.showCancel && !attr.showDeny && !attr.showConfirm) {
    el.querySelector(".modal-actions").remove();
  }
  document.body.insertAdjacentElement("afterbegin", el);
  let modal = new bootstrap.Modal(el);
  // Cleanup instead of just hiding
  el.addEventListener(
    "hidden.bs.modal",
    () => {
      el.querySelectorAll('[data-bs-toggle="tooltip"]').forEach((n) => bootstrap.Tooltip.getInstance(n).dispose());
      el.querySelectorAll('[data-bs-toggle="popover"]').forEach((n) => bootstrap.Popover.getInstance(n).dispose());
      modal.dispose();
      el.remove();
    },
    { once: true }
  );

  // Trigger hide
  el.querySelectorAll(".modal-actions button").forEach((btn) => {
    btn.addEventListener(
      "click",
      (ev) => {
        modal.hide();
        // Attach form data to the event
        el.dispatchEvent(
          new CustomEvent("modal." + btn.dataset.event, {
            detail: new FormData(el.querySelector("form")),
            bubbles: true,
          })
        );
      },
      { once: true }
    );
  });

  // BSN needs explicit init
  el.querySelectorAll('[data-bs-toggle="tooltip"]').forEach((n) => bootstrap.Tooltip.getInstance(n) || new bootstrap.Tooltip(n));
  el.querySelectorAll('[data-bs-toggle="popover"]').forEach((n) => bootstrap.Popover.getInstance(n) || new bootstrap.Popover(n));

  modal.show();

  // Show animation
  if (attr.icon && attr.animated && attr.showIcon) {
    el.addEventListener("shown.bs.modal", () => el.querySelector(".modal-icon").classList.add("modal-icon-show"), { once: true });
  }

  return modal;
}
/**
 * @param {object} attr
 * @param {function(ev)} onResolve
 * @param {function(ev)} onReject
 * @returns {bootstrap.Modal}
 */
export function modalizerConfirm(attr = {}, onResolve = null, onReject = null) {
  if (typeof attr === "string") {
    attr = {
      body: attr,
    };
  }
  attr = Object.assign(
    {
      static: true,
      showClose: false,
      showCancel: true,
      showConfirm: true,
    },
    attr
  );
  const modal = modalizer(attr);
  // Bootstrap 5 use _element and BSN use element
  const element = modal.element || modal._element;
  if (onResolve) {
    element.addEventListener("modal.confirm", (ev) => onResolve(ev), { once: true });
  }
  if (onReject) {
    element.addEventListener("modal.cancel", (ev) => onReject(ev), { once: true });
  }
  return modal;
}
