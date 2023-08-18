const html = `<bs-progress id="full-page-load" style="visibility:hidden">
<div class="progress progress-top progress-ratio" role="progressbar" aria-label="Loading...">
  <div class="progress-bar progress-bar-indeterminate">
  </div>
</div>
</bs-progress>`;

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
// @link https://developer.mozilla.org/en-US/docs/Web/API/Element/getAnimations
const animation = pbar ? pbar.getAnimations()[0] : null;
let playbackRate;
let to;

if (pbar) {
  pbar.style.animationPlayState = "paused";
  animation.cancel();
}

class LoadProgress {
  static start() {
    if (!pbar) {
      return;
    }

    // Reset ratio
    const barCe = customElements.get("bs-progress");
    //@ts-ignore
    barCe.setRatio(pbar);

    to = setTimeout(() => {
      // Reset anim
      animation.play();

      playbackRate = animation.playbackRate;

      pbar.style.animationPlayState = "running";
      fp.style.visibility = "visible";
    }, 300);
  }

  static done() {
    if (to) {
      clearTimeout(to);
    }
    if (!pbar || pbar.style.animationPlayState != "running") {
      return;
    }

    // Increase speed in order to finish quickly
    animation.updatePlaybackRate(playbackRate * 4);

    // Pause on end
    pbar.addEventListener(
      "animationiteration",
      (ev) => {
        fp.style.visibility = "hidden";

        animation.cancel();
        animation.updatePlaybackRate(playbackRate);
      },
      {
        once: true,
      }
    );
  }
}

export default LoadProgress;
