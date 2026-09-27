document.querySelectorAll(".copy-email").forEach((button) => {
  const flash = button.parentElement.querySelector(".copy-flash");
  let flashTimer = 0;

  function showFlash(message) {
    if (!flash) {
      return;
    }

    flash.textContent = message;
    flash.classList.add("is-on");
    window.clearTimeout(flashTimer);
    flashTimer = window.setTimeout(() => {
      flash.classList.remove("is-on");
    }, 1600);
  }

  button.addEventListener("click", async () => {
    const value = button.getAttribute("data-copy");
    if (!value) {
      return;
    }

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(value);
      } else {
        const field = document.createElement("textarea");
        field.value = value;
        field.setAttribute("readonly", "");
        field.style.position = "fixed";
        field.style.left = "-999px";
        document.body.appendChild(field);
        field.select();
        document.execCommand("copy");
        field.remove();
      }

      button.setAttribute("aria-label", "Copied");
      showFlash("Copied!");
      window.setTimeout(() => {
        button.setAttribute("aria-label", "Copy email");
      }, 1600);
    } catch {
      button.setAttribute("aria-label", "Copy failed");
      showFlash("Copy failed");
      window.setTimeout(() => {
        button.setAttribute("aria-label", "Copy email");
      }, 1600);
    }
  });
});
