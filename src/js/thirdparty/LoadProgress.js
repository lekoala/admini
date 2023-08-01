const html = `<bs-progress id="full-page-load" style="visibility:hidden">
<div class="progress progress-top progress-ratio" role="progressbar" aria-label="Loading...">
  <div class="progress-bar progress-bar-indeterminate">
  </div>
</div>
</bs-progress>`;

const restartAnimations = (element) => {
  for (const animation of document.getAnimations()) {
    //@ts-ignore
    if (element.contains(animation.effect.target)) {
      animation.cancel();
      animation.play();
    }
  }
};

const div = document.createElement("div");
div.innerHTML = html;
document.body.appendChild(div);

/**
 * @type {HTMLElement}
 */
//@ts-ignore
const fp = document.querySelector("#full-page-load");
/**
 * @type {HTMLElement}
 */
//@ts-ignore
const pbar = fp ? fp.firstElementChild.firstElementChild : null;

let to;

class LoadProgress {
  static start() {
    // Reset ratio
    const barCe = customElements.get("bs-progress");
    //@ts-ignore
    barCe.setRatio(pbar);

    to = setTimeout(() => {
      // Reset anim
      restartAnimations(pbar);

      pbar.style.animationPlayState = "running";
      fp.style.visibility = "visible";
    }, 300);
  }

  static done() {
    if (to) {
      clearTimeout(to);
    }
    if (pbar.style.animationPlayState != "running") {
      return;
    }

    // Increase speed in order to finish quickly
    const ratio = pbar.style.getPropertyValue("--indeterminate-speed");
    //@ts-ignore
    pbar.style.setProperty("--indeterminate-speed", ratio / 4);

    pbar.addEventListener(
      "animationiteration",
      (ev) => {
        pbar.style.animationPlayState = "paused";
        pbar.style.animationFillMode = "forwards";
        fp.style.visibility = "hidden";
      },
      {
        once: true,
      }
    );
  }
}

export default LoadProgress;
