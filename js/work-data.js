// Loads Sneha's projects from content/work.json (edited through /admin)
// and builds the Work cards and the project detail page from it.
(function () {
  const DATA_URL = "/content/work.json";

  const esc = (value) =>
    String(value ?? "").replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    })[c]);

  const slugify = (text) =>
    String(text || "project")
      .toLowerCase()
      .normalize("NFKD").replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "project";

  const paragraphs = (text) =>
    String(text || "")
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean)
      .map((p) => `<p>${esc(p).replace(/\n/g, "<br />")}</p>`)
      .join("");

  async function loadProjects() {
    const res = await fetch(DATA_URL, { cache: "no-cache" });
    if (!res.ok) throw new Error(`Could not load ${DATA_URL}`);
    const data = await res.json();
    const seen = {};
    return (data.projects || [])
      .filter((p) => p && p.title && p.show !== false)
      .map((p) => {
        let slug = slugify(p.slug || p.title);
        if (seen[slug]) slug = `${slug}-${++seen[slug]}`;
        else seen[slug] = 1;
        return { ...p, slug };
      });
  }

  function creditLines(p) {
    const lines = [];
    if (p.company) lines.push(esc(p.company));
    if (p.director) lines.push(`Dir. ${esc(p.director)}`);
    return lines.join("<br />");
  }

  function cardHTML(p) {
    const tabs = (p.tabs && p.tabs.length ? p.tabs : ["producer"]).join(" ");
    const roles = (p.roles || []).filter(Boolean);
    const meta = [p.year, p.format].filter(Boolean).map(esc).join(" · ");
    return `
      <article class="work-card" data-roles="${esc(tabs)}">
        <a class="work-card-link" href="project.html?p=${encodeURIComponent(p.slug)}">
          <div class="work-card-copy">
            <h2>${esc(p.title)}</h2>
            ${p.description ? `<p class="work-card-desc">${esc(p.description)}</p>` : ""}
            ${creditLines(p) ? `<p class="work-card-credits">${creditLines(p)}</p>` : ""}
            ${meta ? `<p class="work-card-meta">${meta}</p>` : ""}
            ${roles.length ? `<p class="work-card-roles">${roles.map((r) => `<span class="role-tag">${esc(r)}</span>`).join("")}</p>` : ""}
          </div>
          <div class="work-card-still">
            ${p.cover ? `<img src="${esc(p.cover)}" alt="${esc(p.cover_alt || p.title)}" loading="lazy" />` : ""}
          </div>
        </a>
      </article>`;
  }

  function videoEmbed(url) {
    if (!url) return "";
    let m;
    let src = "";
    if ((m = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{6,})/))) {
      src = `https://www.youtube-nocookie.com/embed/${m[1]}`;
    } else if ((m = url.match(/vimeo\.com\/(?:video\/)?(\d+)(?:\/(\w+))?/))) {
      src = `https://player.vimeo.com/video/${m[1]}${m[2] ? `?h=${m[2]}` : ""}`;
    }
    if (src) {
      return `<div class="project-video"><iframe src="${esc(src)}" title="Watch the film" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>`;
    }
    return `<p class="project-watch"><a href="${esc(url)}" target="_blank" rel="noopener">Watch it here →</a></p>`;
  }

  async function renderWorkPage() {
    const grid = document.querySelector("[data-work-grid]");
    if (!grid) return;
    try {
      const projects = await loadProjects();
      grid.innerHTML = projects.length
        ? projects.map(cardHTML).join("")
        : `<p class="work-empty">New work coming soon.</p>`;
    } catch (err) {
      console.error(err);
      grid.innerHTML = `<p class="work-empty">The work shelf is being dusted. Try again in a minute.</p>`;
    }
    if (window.applyWorkFilter) window.applyWorkFilter();
  }

  async function renderProjectPage() {
    const root = document.querySelector("[data-project]");
    if (!root) return;
    const slug = new URLSearchParams(location.search).get("p");
    let p;
    try {
      p = (await loadProjects()).find((item) => item.slug === slug);
    } catch (err) {
      console.error(err);
    }
    if (!p) {
      root.innerHTML = `
        <div class="project-intro">
          <p class="eyebrow">On file</p>
          <h1>Hmm, that file's missing.</h1>
          <a class="back-out" href="work.html">Back to work</a>
        </div>`;
      return;
    }

    document.title = `${p.title} · Sneha’s Place`;
    const backTab = (p.tabs && p.tabs[0]) || "producer";
    const credits = [];
    if (p.company) credits.push(`Production Company: ${esc(p.company)}`);
    if (p.director) credits.push(`Director: ${esc(p.director)}`);
    (p.credits || []).forEach((c) => {
      if (c && c.label && c.name) credits.push(`${esc(c.label)}: ${esc(c.name)}`);
    });
    const meta = [p.year, p.format, p.status].filter(Boolean).map(esc).join(" · ");
    const roles = (p.roles || []).filter(Boolean);
    const gallery = (p.gallery || [])
      .map((g) => (typeof g === "string" ? { image: g } : g))
      .filter((g) => g && g.image);

    root.innerHTML = `
      <div class="project-intro">
        <p class="eyebrow">On file${meta ? ` · ${meta}` : ""}</p>
        <h1>${esc(p.title)}</h1>
        ${roles.length ? `<p class="work-card-roles project-roles">${roles.map((r) => `<span class="role-tag">${esc(r)}</span>`).join("")}</p>` : ""}
        ${p.logline ? `<p class="project-logline">${esc(p.logline)}</p>` : ""}
        ${credits.length ? `<p class="project-credits">${credits.join("<br />")}</p>` : ""}
        ${p.about ? `<div class="project-about">${paragraphs(p.about)}</div>` : ""}
        <a class="back-out" href="work.html?filter=${esc(backTab)}">Back to work</a>
      </div>
      ${videoEmbed(p.video)}
      ${gallery.length ? `
        <div class="project-gallery">
          ${gallery.map((g, i) => `
            <div class="project-still${i === 0 && !p.video ? " project-still-hero" : ""}">
              <img src="${esc(g.image)}" alt="${esc(g.alt || p.title)}" loading="lazy" />
            </div>`).join("")}
        </div>` : ""}`;
  }

  renderWorkPage();
  renderProjectPage();
})();
