(function () {
  window.HCT_STUDY_SITE = window.HCT_STUDY_SITE || {
    title: "Histopathologic Techniques Study Guide",
    subject: "MT 2 Midyear",
    generatedFor: "GitHub Pages"
  };
const navLinks = Array.from(document.querySelectorAll('nav a[href^="#"]'));
  const targets = navLinks
    .map(link => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  const setActive = () => {
    let current = targets[0];
    for (const target of targets) {
      if (target.getBoundingClientRect().top <= 120) current = target;
    }
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${current.id}`);
    });
  };

  const addTools = () => {
    const main = document.querySelector('main');
    if (!main || document.querySelector('.study-tools')) return;

    const tools = document.createElement('div');
    tools.className = 'study-tools';
    tools.innerHTML = `
      <label class="search-box">
        <span>Search guide</span>
        <input id="guide-search" type="search" placeholder="fixative, BNF, dehydration...">
      </label>
      <button type="button" id="expand-answers">Expand answers</button>
      <button type="button" id="collapse-answers">Collapse answers</button>
    `;
    const hero = document.querySelector('.hero');
    hero.insertAdjacentElement('afterend', tools);

    const search = tools.querySelector('#guide-search');
    search.addEventListener('input', () => {
      const q = search.value.trim().toLowerCase();
      document.querySelectorAll('main section').forEach(section => {
        section.hidden = q && !section.textContent.toLowerCase().includes(q);
      });
    });

    tools.querySelector('#expand-answers').addEventListener('click', () => {
      document.querySelectorAll('details').forEach(item => item.open = true);
    });

    tools.querySelector('#collapse-answers').addEventListener('click', () => {
      document.querySelectorAll('details').forEach(item => item.open = false);
    });
  };

  document.addEventListener('DOMContentLoaded', () => {
    addTools();
    setActive();
    document.addEventListener('scroll', setActive, { passive: true });
  });
})();

