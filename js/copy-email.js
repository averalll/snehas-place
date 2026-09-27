document.querySelectorAll(".copy-email").forEach((button) => {
  const original = button.textContent;

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

      button.textContent = "Copied!";
      window.setTimeout(() => {
        button.textContent = original;
      }, 1600);
    } catch {
      button.textContent = "Copy failed";
      window.setTimeout(() => {
        button.textContent = original;
      }, 1600);
    }
  });
});
