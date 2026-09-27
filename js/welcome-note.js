const note = document.querySelector(".welcome-note");
const closeButton = document.querySelector(".welcome-note-close");
const storageKey = "sneha-welcome";

if (note && closeButton && !sessionStorage.getItem(storageKey)) {
  let hideTimer = 0;

  function dismiss() {
    sessionStorage.setItem(storageKey, "1");
    note.classList.remove("is-open");
    window.clearTimeout(hideTimer);
    hideTimer = window.setTimeout(() => {
      note.hidden = true;
    }, 300);
  }

  note.hidden = false;

  window.setTimeout(() => {
    if (!sessionStorage.getItem(storageKey)) {
      note.classList.add("is-open");
    }
  }, 1600);

  closeButton.addEventListener("click", dismiss);

  document.querySelectorAll(".room-hotspot").forEach((hotspot) => {
    hotspot.addEventListener("pointerenter", dismiss);
    hotspot.addEventListener("click", dismiss);
  });
}
