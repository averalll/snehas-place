document.documentElement.classList.add("js");

const toggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".site-nav");
const header = document.querySelector(".site-header, .panel-nav");

if (toggle && nav && header) {
  const media = window.matchMedia("(max-width: 760px)");
  const label = toggle.querySelector(".visually-hidden");
  const backdrop = document.createElement("button");
  const closeButton = document.createElement("button");
  const home = document.createComment("site-nav");

  backdrop.className = "menu-backdrop";
  backdrop.type = "button";
  backdrop.setAttribute("aria-label", "Close menu");
  backdrop.hidden = true;

  closeButton.className = "menu-close";
  closeButton.type = "button";
  closeButton.innerHTML =
    '<span class="menu-close-icon" aria-hidden="true"></span><span class="visually-hidden">Close menu</span>';
  nav.prepend(closeButton);

  function menuOpen() {
    return document.body.classList.contains("menu-open");
  }

  function focusable() {
    return [closeButton, ...nav.querySelectorAll("a")];
  }

  function setMenu(open) {
    if (open === menuOpen()) {
      return;
    }

    document.body.classList.toggle("menu-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    if (label) {
      label.textContent = open ? "Close menu" : "Open menu";
    }
    backdrop.hidden = !open;

    if (open) {
      nav.before(home);
      document.body.append(backdrop, nav);
      closeButton.focus();
    } else {
      backdrop.remove();
      home.after(nav);
      home.remove();
      if (media.matches) {
        toggle.focus();
      }
    }
  }

  toggle.addEventListener("click", () => {
    setMenu(!menuOpen());
  });

  closeButton.addEventListener("click", () => setMenu(false));
  backdrop.addEventListener("click", () => setMenu(false));

  document.addEventListener("keydown", (event) => {
    if (!menuOpen()) {
      return;
    }

    if (event.key === "Escape") {
      setMenu(false);
      return;
    }

    if (event.key !== "Tab") {
      return;
    }

    const items = focusable();
    const first = items[0];
    const last = items[items.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  media.addEventListener("change", () => {
    if (!media.matches) {
      setMenu(false);
    }
  });
}
