// ── i18n ──
let i18n = {};
let currentLang = 'en';

let twPhrases = [];
let twIndex = 0;
let twChar = 0;
let twDeleting = false;
document.getElementById("year").textContent = new Date().getFullYear();


const timelineObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.2 });

document.querySelectorAll('.timeline-item2').forEach(el => {
  timelineObserver.observe(el);
});
const modal = document.getElementById("cvModal");
const openBtn = document.getElementById("openCV");
const closeBtn = document.querySelector(".cv-close");

if (openBtn) {
  openBtn.onclick = () => modal.style.display = "block";
}

if (closeBtn) {
  closeBtn.onclick = () => modal.style.display = "none";
}

globalThis.onclick = (e) => {
  if (e.target === modal) modal.style.display = "none";
};

// ── Load language ──
async function loadLang(lang) {
  try {
    currentLang = lang;

    const res = await fetch(`./assets/i18n/${lang}.json`);
    if (!res.ok) throw new Error("Load failed");

    i18n = await res.json();
  } catch (e) {
    console.error("Fallback to EN", e);

    const res = await fetch(`./assets/i18n/en.json`);
    i18n = await res.json();
  }

  document.documentElement.lang = lang;

  // update text
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (i18n[key]) el.innerHTML = i18n[key];
  });

  // update typewriter data
  twPhrases = i18n.tw || [];

  // reset typewriter state
  twIndex = 0;
  twChar = 0;
  twDeleting = false;

  // update title
  document.title =
    lang === 'vi'
      ? 'Portfolio — Lập trình viên Frontend / Fullstack'
      : 'Portfolio — Frontend / Fullstack Developer';

  // update active button
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.textContent.toLowerCase() === lang);
  });
}

async function loadGithubRepos() {
  const username = "uncleyellow";

  try {
    const res = await fetch(`https://api.github.com/users/${username}/repos?sort=updated`);
    const repos = await res.json();

    const container = document.getElementById("githubRepos");
    if (!container) return;

    // ✅ filter repo chất lượng
    let filtered = repos
      .filter(r => !r.fork && r.description) // bỏ fork + repo rỗng
      .sort((a, b) => b.stargazers_count - a.stargazers_count) // sort theo star
      .slice(0, 6); // lấy top 6

    container.innerHTML = filtered.map(repo => `
      <div class="project-card github-card visible">

        <div class="project-title">
          ${repo.name}
        </div>

        <div class="project-desc">
          ${repo.description}
        </div>

        <div class="project-stack">
          <span class="project-tag">${repo.language || "Code"}</span>
          <span class="project-tag">⭐ ${repo.stargazers_count}</span>
          <span class="project-tag">🍴 ${repo.forks_count}</span>
        </div>

        <a href="${repo.html_url}" target="_blank" class="project-arrow-link">
          <div class="project-arrow">→</div>
        </a>

      </div>
    `).join("");

  } catch (err) {
    console.error("GitHub error", err);
  }
}

function toggleCase(el) {
  el.classList.toggle("active");
}

// ── change language ──
function setLang(lang) {
  localStorage.setItem('lang', lang);
  loadLang(lang);
}

// ── Cursor Orb ──
const orb = document.getElementById('orb');
if (orb) {
  document.addEventListener('mousemove', e => {
    orb.style.left = e.clientX + 'px';
    orb.style.top = e.clientY + 'px';
  });
}

// ── Nav scroll ──
const navbar = document.getElementById('navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  });
}

// ── Hamburger ──
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
  });
}

function closeMobile() {
  if (mobileMenu) mobileMenu.classList.remove('open');
}

// ── Typewriter ──
const tw = document.getElementById('typewriter');

function type() {
  if (!tw || !twPhrases.length) {
    setTimeout(type, 200);
    return;
  }

  const phrase = twPhrases[twIndex % twPhrases.length];

  if (!twDeleting) {
    tw.textContent = phrase.slice(0, ++twChar);

    if (twChar === phrase.length) {
      twDeleting = true;
      setTimeout(type, 1800);
      return;
    }
  } else {
    tw.textContent = phrase.slice(0, --twChar);

    if (twChar === 0) {
      twDeleting = false;
      twIndex++;
    }
  }

  setTimeout(type, twDeleting ? 50 : 90);
}

// ── Intersection Observer — reveal ──
const io = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, i * 80);

      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal, .timeline-item, .project-card')
  .forEach(el => io.observe(el));

// ── Skill bars ──
const skillObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.style.width = entry.target.dataset.width + '%';
      }, 200);

      skillObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

document.querySelectorAll('.skill-fill')
  .forEach(f => skillObs.observe(f));


// ✅ INIT APP (QUAN TRỌNG NHẤT)
const savedLang = localStorage.getItem('lang') || 'en';

loadLang(savedLang).then(() => {
  type(); // start ONLY AFTER data ready
  loadGithubRepos();
});