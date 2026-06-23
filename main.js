import { CONFIG, TEXT, SELECTORS, OBSERVER_CONFIG, COMMON_CONSTANT } from "./constants/constants.js";

// ── i18n ──
let i18n = COMMON_CONSTANT.empty_object;
let currentLang = CONFIG.DEFAULT_LANG;

let twPhrases = COMMON_CONSTANT.empty_array;
let twIndex = COMMON_CONSTANT.zero;
let twChar = COMMON_CONSTANT.zero;
let twDeleting = false;
document.getElementById(COMMON_CONSTANT.year).textContent = new Date().getFullYear();


const timelineObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add(OBSERVER_CONFIG.visible);
        }
    });
}, {
    threshold: OBSERVER_CONFIG.threshold
});

document.querySelectorAll(OBSERVER_CONFIG.timeline_item2).forEach(el => {
    timelineObserver.observe(el);
});
const modal = document.getElementById(SELECTORS.cvModal);
const openBtn = document.getElementById(SELECTORS.openCV);
const closeBtn = document.querySelector(SELECTORS.cv_close);

if (openBtn) {
    openBtn.onclick = () => modal.style.display = "block";
}

if (closeBtn) {
    closeBtn.onclick = () => modal.style.display = "none";
}

globalThis.onclick = (e) => {
    if (e.target === modal) modal.style.display = "none";
};

/**
 * Load language JSON file and update UI text
 * Includes fallback to English if loading fails
 * Also resets typewriter phrases
 * 
 * @param   {string}        lang - Language code
 * @returns {Promise<void>}
 */
async function loadLang(lang) {
    try {
        currentLang = lang;

        const res = await fetch(`./assets/i18n/${lang}.json`);
        if (!res.ok) throw new Error("Load failed");

        i18n = await res.json();
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
          const key = el.getAttribute('data-i18n-placeholder');
          if (i18n[key]) el.placeholder = i18n[key];
        });
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
        lang === CONFIG.VI_LANG ?
        'Portfolio — Lập trình viên Frontend / Fullstack' :
        'Portfolio — Frontend / Fullstack Developer';

    // update active button
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.textContent.trim().toLowerCase() === lang);
    });
}

/**
 * Fetch GitHub repositories and render top projects
 * Automatically hides section if API fails or no valid repo found
 * 
 * @returns {Promise<void>}
 */
async function loadGithubRepos() {
    const username = CONFIG.GITHUB_USERNAME;

    const container = document.getElementById("githubRepos");
    const section = document.getElementById("github");

    if (!container || !section) return;

    try {
        const res = await fetch(
          `${CONFIG.GITHUB_API}${username}/repos?sort=updated`,
          {
            headers: {
              Accept: "application/vnd.github+json"
            }
          }
        );

        // ❌ API fail
        if (!res.ok) throw new Error("GitHub API error");

        const repos = await res.json();

        // ✅ filter repo chất lượng
        let filtered = repos
            .filter(r => !r.fork && r.description)
            .sort((a, b) => b.stargazers_count - a.stargazers_count)
            .slice(0, 6);

        // ❌ Không có repo -> ẩn section
        if (!filtered || filtered.length === 0) {
            section.style.display = "none";
            return;
        }

        // ✅ render
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

        // ❌ Lỗi mạng / rate limit -> ẩn luôn
        section.style.display = "none";
    }
}

/**
 * Toggle expand/collapse for case study item
 * @param {HTMLElement} el - The clicked case study element
 */
function toggleCase(el) {
    el.classList.toggle("active");
}

/**
 * Change current language and save to localStorage
 * @param {string} lang - Language code ("en" or "vi")
 */
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

/**
 * Closes the mobile navigation menu
 * Removes the "open" class from the mobile menu element if it exists
 *
 * @function
 * @returns {void}
 */
function closeMobile() {
    if (mobileMenu) mobileMenu.classList.remove('open');
}

// ── Typewriter ──
const tw = document.getElementById('typewriter');

/**
 * Typewriter animation loop
 * Cycles through translated phrases with typing/deleting effect
 */
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
}, {
    threshold: 0.12
});

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
}, {
    threshold: 0.3
});

document.querySelectorAll('.skill-fill')
    .forEach(f => skillObs.observe(f));


// ✅ INIT APP 
const savedLang = localStorage.getItem('lang') || 'en';

loadLang(savedLang).then(() => {
    type(); // start ONLY AFTER data ready
    loadGithubRepos();
});