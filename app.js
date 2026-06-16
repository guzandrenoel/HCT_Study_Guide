(function () {
  const STORAGE_KEY = "hct_reviewed_sections";
  const THEME_KEY = "hct_theme";

  window.HCT_STUDY_SITE = window.HCT_STUDY_SITE || {
    title: "Histopathologic Techniques Study Guide",
    subject: "MT 2 Midyear",
    generatedFor: "GitHub Pages"
  };

  const navLinks = Array.from(document.querySelectorAll('nav a[href^="#"]'));
  const targets = navLinks
    .map(link => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);
  const reviewableSections = Array.from(document.querySelectorAll("main section[id]"));

  let reviewed = new Set(loadJson(STORAGE_KEY, []));

  function loadJson(key, fallback) {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : fallback;
    } catch {
      return fallback;
    }
  }

  function saveReviewed() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(reviewed)));
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    const toggle = document.querySelector("#theme-toggle");
    if (toggle) toggle.textContent = theme === "light" ? "Light" : "Dark";
  }

  function initTheme() {
    const saved = localStorage.getItem(THEME_KEY) || "dark";
    applyTheme(saved);
    document.querySelector("#theme-toggle")?.addEventListener("click", () => {
      const next = document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
      localStorage.setItem(THEME_KEY, next);
      applyTheme(next);
    });
  }

  function updateProgress() {
    const total = reviewableSections.length || 1;
    const done = reviewableSections.filter(section => reviewed.has(section.id)).length;
    const pct = Math.round((done / total) * 100);
    const label = document.querySelector("#header-pct");
    const fill = document.querySelector("#pill-fill");
    const toolFill = document.querySelector("#tool-progress-fill");
    const status = document.querySelector("#tools-status");

    if (label) label.textContent = `${pct}%`;
    if (fill) fill.style.width = `${pct}%`;
    if (toolFill) toolFill.style.width = `${pct}%`;
    if (status) status.textContent = `${done} of ${total} sections complete`;

    reviewableSections.forEach(section => {
      const isReviewed = reviewed.has(section.id);
      section.classList.toggle("reviewed", isReviewed);
      section.querySelector(".section-review-toggle")?.classList.toggle("is-active", isReviewed);
      const sectionButton = section.querySelector(".section-review-toggle");
      if (sectionButton) sectionButton.textContent = isReviewed ? "Done" : "Mark as done";
    });

  }

  function setActive() {
    let current = targets[0];
    for (const target of targets) {
      if (target.getBoundingClientRect().top <= 120) current = target;
    }
    if (!current) return;
    navLinks.forEach(link => {
      link.classList.toggle("active", link.getAttribute("href") === `#${current.id}`);
    });

  }

  function toggleReviewed(id) {
    if (!id) return;
    if (reviewed.has(id)) reviewed.delete(id);
    else reviewed.add(id);
    saveReviewed();
    updateProgress();
    setActive();
  }

  function addSectionReviewControls() {
    reviewableSections.forEach(section => {
      if (section.querySelector(".section-review-toggle")) return;
      const heading = section.querySelector("h2");
      if (!heading) return;

      const title = heading.textContent.trim();
      heading.textContent = "";

      const titleLabel = document.createElement("span");
      titleLabel.className = "section-title-label";
      titleLabel.textContent = title;

      const button = document.createElement("button");
      button.type = "button";
      button.className = "section-review-toggle";
      button.dataset.section = section.id;
      button.textContent = "Mark as done";
      heading.appendChild(titleLabel);
      heading.appendChild(button);
      button.addEventListener("click", event => {
        event.preventDefault();
        toggleReviewed(event.currentTarget.dataset.section);
      });
    });
  }

  function addTools() {
    const hero = document.querySelector(".hero");
    if (!hero || document.querySelector(".study-tools")) return;

    const tools = document.createElement("div");
    tools.className = "study-tools";
    tools.innerHTML = `
      <div class="tool-search">
        <label class="search-box">
          <span>Search guide</span>
          <input id="guide-search" type="search" placeholder="fixative, BNF, dehydration...">
        </label>
      </div>
      <div class="tool-answer-panel">
        <button type="button" id="expand-answers">Show answers</button>
        <button type="button" id="collapse-answers">Hide answers</button>
      </div>
      <div class="tool-progress-panel">
        <span class="tool-label">Progress</span>
        <strong class="tools-status" id="tools-status">0 of ${reviewableSections.length} sections complete</strong>
        <span class="tool-progress-track"><span id="tool-progress-fill"></span></span>
        <button type="button" id="clear-reviewed">Clear</button>
      </div>
    `;
    hero.insertAdjacentElement("afterend", tools);

    const search = tools.querySelector("#guide-search");
    search.addEventListener("input", () => {
      const q = search.value.trim().toLowerCase();
      document.querySelectorAll("main section, .lecture-divider").forEach(block => {
        block.classList.toggle("is-hidden-by-search", Boolean(q) && !block.textContent.toLowerCase().includes(q));
      });
    });

    tools.querySelector("#clear-reviewed").addEventListener("click", () => {
      reviewed = new Set();
      saveReviewed();
      updateProgress();
      setActive();
    });

    tools.querySelector("#expand-answers").addEventListener("click", () => {
      document.querySelectorAll("details").forEach(item => item.open = true);
    });

    tools.querySelector("#collapse-answers").addEventListener("click", () => {
      document.querySelectorAll("details").forEach(item => item.open = false);
    });
  }

  function fadeLoader() {
    const loader = document.querySelector("#loading-screen");
    if (!loader) return;
    window.setTimeout(() => loader.classList.add("fade-out"), 350);
    window.setTimeout(() => loader.remove(), 800);
  }

  document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    addSectionReviewControls();
    addTools();
    updateProgress();
    setActive();
    fadeLoader();
    document.addEventListener("scroll", setActive, { passive: true });
    window.addEventListener("resize", setActive);
  });
})();
