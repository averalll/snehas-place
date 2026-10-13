const chips = document.querySelectorAll(".chip[data-filter]");

function activeFilters() {
  return [...chips]
    .filter((chip) => chip.getAttribute("aria-pressed") === "true")
    .map((chip) => chip.dataset.filter);
}

// Cards are built from content/work.json, so look them up fresh each time.
function applyFilter() {
  const selected = activeFilters();
  document.querySelectorAll(".work-card[data-roles]").forEach((card) => {
    const roles = card.dataset.roles.split(/\s+/);
    const show =
      selected.length === 0 || selected.some((filter) => roles.includes(filter));
    card.hidden = !show;
  });
}
window.applyWorkFilter = applyFilter;

chips.forEach((chip) => {
  chip.addEventListener("click", () => {
    const alreadyOn = chip.getAttribute("aria-pressed") === "true";
    chips.forEach((other) => {
      other.setAttribute("aria-pressed", "false");
    });
    if (!alreadyOn) {
      chip.setAttribute("aria-pressed", "true");
    }
    const url = new URL(window.location.href);
    const on = activeFilters()[0];
    if (on) url.searchParams.set("filter", on);
    else url.searchParams.delete("filter");
    history.replaceState(null, "", url);
    applyFilter();
  });
});

const incoming = new URLSearchParams(window.location.search).get("filter");
const start = incoming || "producer";

chips.forEach((chip) => {
  chip.setAttribute("aria-pressed", String(chip.dataset.filter === start));
});

applyFilter();
