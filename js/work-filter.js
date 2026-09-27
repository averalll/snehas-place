const chips = document.querySelectorAll(".chip[data-filter]");
const cards = document.querySelectorAll(".work-card[data-roles]");

function activeFilters() {
  return [...chips]
    .filter((chip) => chip.getAttribute("aria-pressed") === "true")
    .map((chip) => chip.dataset.filter);
}

function applyFilter() {
  const selected = activeFilters();

  cards.forEach((card) => {
    const roles = card.dataset.roles.split(/\s+/);
    const show =
      selected.length === 0 || selected.some((filter) => roles.includes(filter));
    card.hidden = !show;
  });
}

chips.forEach((chip) => {
  chip.addEventListener("click", () => {
    const alreadyOn = chip.getAttribute("aria-pressed") === "true";
    chips.forEach((other) => {
      other.setAttribute("aria-pressed", "false");
    });
    if (!alreadyOn) {
      chip.setAttribute("aria-pressed", "true");
    }
    applyFilter();
  });
});

const incoming = new URLSearchParams(window.location.search).get("filter");
const start = incoming || "producer";

chips.forEach((chip) => {
  chip.setAttribute("aria-pressed", String(chip.dataset.filter === start));
});

applyFilter();
