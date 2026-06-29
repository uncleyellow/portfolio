import {
    CONFIG,
    TEXT,
    SELECTORS,
    OBSERVER_CONFIG,
    COMMON_CONSTANT
} from "./constants/constants.js";

// ── i18n ──
let i18n = COMMON_CONSTANT.empty_object;
let currentLang = CONFIG.DEFAULT_LANG;

let twPhrases = COMMON_CONSTANT.empty_array;
let twIndex = COMMON_CONSTANT.zero;
let twChar = COMMON_CONSTANT.zero;
let twDeleting = false;

document.getElementById(COMMON_CONSTANT.year).textContent = new Date().getFullYear();
document.addEventListener('mousemove', (e) => {
    const x = (window.innerWidth / 2 - e.clientX) / 25;
    const y = (window.innerHeight / 2 - e.clientY) / 25;

    document.querySelectorAll('.hero-avatar-card').forEach(el => {
        el.style.transform = `translate(${x}px, ${y}px)`;
    });
});
document.querySelectorAll('.btn-primary').forEach(btn => {
    btn.addEventListener('click', function(e) {
        const circle = document.createElement('span');
        circle.classList.add('ripple');

        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);

        circle.style.width = circle.style.height = size + 'px';
        circle.style.left = e.clientX - rect.left - size / 2 + 'px';
        circle.style.top = e.clientY - rect.top - size / 2 + 'px';

        this.appendChild(circle);

        setTimeout(() => circle.remove(), 600);
    });
});
window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const height = document.body.scrollHeight - window.innerHeight;
    const progress = (scrollTop / height) * 100;

    document.getElementById('progressBar').style.width = progress + '%';
});
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
    let current = '';

    sections.forEach(section => {
        const top = section.offsetTop - 100;
        if (window.scrollY >= top) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').includes(current)) {
            link.classList.add('active');
        }
    });
});
document.querySelectorAll('.contact-cv').forEach(btn => {
    btn.addEventListener('click', function(e) {
        const circle = document.createElement('span');

        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);

        circle.style.width = circle.style.height = size + 'px';
        circle.style.left = e.clientX - rect.left - size / 2 + 'px';
        circle.style.top = e.clientY - rect.top - size / 2 + 'px';

        circle.classList.add('ripple');
        this.appendChild(circle);

        setTimeout(() => circle.remove(), 600);
    });
});
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

window.onclick = (e) => {
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
 * Escapes HTML special characters to safely render external text.
 *
 * @param {string} value - Raw string value.
 * @returns {string} Escaped string safe for innerHTML rendering.
 */
function escapeHTML(value = '') {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

/**
 * Gets a stable color for a repository language.
 *
 * @param {string|null} language - Repository primary language.
 * @returns {string} Hex color for the language dot.
 */
function getLanguageColor(language) {
    const colors = {
        JavaScript: '#f7df1e',
        TypeScript: '#3178c6',
        Python: '#3776ab',
        HTML: '#e34f26',
        CSS: '#38bdf8',
        Java: '#f97316',
        CSharp: '#a855f7',
        PHP: '#777bb4',
        Vue: '#42b883',
        React: '#61dafb'
    };

    return colors[language] || '#38bdf8';
}

/**
 * Formats an ISO date string into a short readable date.
 *
 * @param {string} isoDate - ISO date string.
 * @returns {string} Formatted date.
 */
function formatRepoDate(isoDate) {
    if (!isoDate) return '';

    return new Intl.DateTimeFormat(currentLang === CONFIG.VI_LANG ? 'vi-VN' : 'en-US', {
        year: 'numeric',
        month: 'short'
    }).format(new Date(isoDate));
}

/**
 * Fetches GitHub repositories and renders selected repositories as premium project cards.
 *
 * Behavior:
 * - Calls the GitHub REST API using the configured GitHub username.
 * - Filters out forked repositories and repositories without descriptions.
 * - Sorts repositories by stars first, then by latest update date.
 * - Renders up to 6 repositories into the GitHub projects container.
 * - Shows a clean empty state if API fails or no valid repositories are found.
 *
 * @async
 * @returns {Promise<void>} Resolves after repositories are rendered or fallback state is shown.
 */
async function loadGithubRepos() {
    const username = CONFIG.GITHUB_USERNAME;
    const container = document.getElementById('githubRepos');
    const section = document.getElementById('github');

    if (!container || !section) return;

    try {
        container.classList.add('loading');

        const res = await fetch(
            `${CONFIG.GITHUB_API}${username}/repos?sort=updated&per_page=100`,
            {
                headers: {
                    Accept: 'application/vnd.github+json'
                }
            }
        );

        if (!res.ok) {
            throw new Error(`GitHub API error: ${res.status}`);
        }

        const repos = await res.json();

        const filtered = repos
            .filter(repo => !repo.fork && repo.description)
            .sort((a, b) => {
                const starDiff = b.stargazers_count - a.stargazers_count;

                if (starDiff !== 0) return starDiff;

                return new Date(b.updated_at) - new Date(a.updated_at);
            })
            .slice(0, 6);

        container.classList.remove('loading');

        if (!filtered.length) {
            container.innerHTML = `
                <div class="github-empty">
                    ${i18n['github.empty'] || 'No public repositories with descriptions found.'}
                </div>
            `;
            return;
        }

        container.innerHTML = filtered.map(repo => {
            const repoName = escapeHTML(repo.name);
            const repoDesc = escapeHTML(repo.description);
            const repoLanguage = escapeHTML(repo.language || 'Code');
            const repoUrl = escapeHTML(repo.html_url);
            const updatedAt = formatRepoDate(repo.updated_at);
            const languageColor = getLanguageColor(repo.language);

            return `
                <article class="github-card visible">
                    <div class="github-card-top">
                        <div class="github-icon">⌘</div>

                        <div class="github-meta">
                            <span>⭐ ${repo.stargazers_count}</span>
                            <span>🍴 ${repo.forks_count}</span>
                        </div>
                    </div>

                    <h3 class="github-title">
                        ${repoName}
                    </h3>

                    <p class="github-desc">
                        ${repoDesc}
                    </p>

                    <div class="github-footer">
                        <div class="github-language">
                            <span
                                class="github-language-dot"
                                style="background:${languageColor}"
                            ></span>
                            <span>${repoLanguage}</span>
                            ${updatedAt ? `<span>· ${updatedAt}</span>` : ''}
                        </div>

                        <a
                            href="${repoUrl}"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="github-link"
                            aria-label="Open ${repoName} repository"
                        >
                            →
                        </a>
                    </div>
                </article>
            `;
        }).join('');

    } catch (err) {
        console.error('GitHub error', err);

        container.classList.remove('loading');

        container.innerHTML = `
            <div class="github-empty">
                ${i18n['github.error'] || 'GitHub repositories could not be loaded right now.'}
            </div>
        `;
    }
}

const caseGrid = document.querySelector('.case-grid');

if (caseGrid) {
    caseGrid.addEventListener('click', handleCaseToggle);
    caseGrid.addEventListener('keydown', handleCaseKeyboard);
}

/**
 * Handles click events for interactive case study items.
 *
 * Behavior:
 * - Finds the closest `.case-item` from the clicked target.
 * - Closes all currently active case items.
 * - Opens the clicked item if it was not already active.
 * - Updates the plus/minus toggle icon.
 * - Scrolls the opened item into the center of the viewport for better UX.
 *
 * @param   {MouseEvent} e - Click event triggered inside the case study grid.
 * @returns {void}
 */
function handleCaseToggle(e) {
    const item = e.target.closest('.case-item');
    if (!item) return;

    const isActive = item.classList.contains('active');

    // close all items
    document.querySelectorAll('.case-item.active').forEach(el => {
        el.classList.remove('active');
        updateToggleIcon(el, false);
    });

    // open current
    if (!isActive) {
        item.classList.add('active');
        updateToggleIcon(item, true);

        // smooth scroll (UX xịn)
        item.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
    }
}


/**
 * Handles keyboard accessibility for case study items.
 *
 * Allows users to open or close a `.case-item` using:
 * - Enter
 * - Space
 *
 * This improves accessibility for keyboard-only users.
 *
 * @param   {KeyboardEvent} e - Keyboard event triggered on a case study item.
 * @returns {void}
 */
function handleCaseKeyboard(e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;

    const item = e.target.closest('.case-item');
    if (!item) return;

    e.preventDefault();
    item.click();
}

/**
 * Updates the toggle icon of a case study item.
 *
 * Displays:
 * - `−` when the item is open.
 * - `+` when the item is closed.
 *
 * @param   {Element} item - The case study item containing the `.case-toggle` element.
 * @param   {boolean} isOpen - Whether the case item is currently open.
 * @returns {void}
 */
function updateToggleIcon(item, isOpen) {
    const toggle = item.querySelector('.case-toggle');
    if (toggle) {
        toggle.textContent = isOpen ? '−' : '+';
    }
}

/**
 * Changes the active language of the portfolio.
 *
 * Behavior:
 * - Saves the selected language to localStorage.
 * - Loads the matching i18n JSON file.
 * - Updates all elements using `data-i18n`.
 * - Resets the typewriter animation text.
 *
 * @param   {string} lang - Language code to activate. Expected values: `"en"` or `"vi"`.
 * @returns {void}
 */
function setLang(lang) {
    localStorage.setItem('lang', lang);
    loadLang(lang);
}

globalThis.setLang = setLang;

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
 * Closes the mobile navigation menu.
 *
 * Removes the `open` class from the mobile menu element if the element exists.
 * Usually called when a user clicks a mobile navigation link.
 *
 * @returns {void}
 */
function closeMobile() {
    if (mobileMenu) mobileMenu.classList.remove('open');
}

// ── Typewriter ──
const tw = document.getElementById('typewriter');

/**
 * Runs the typewriter animation loop for the hero subtitle.
 *
 * Behavior:
 * - Waits until the typewriter element and translated phrases are available.
 * - Types characters one by one.
 * - Pauses when a full phrase is completed.
 * - Deletes characters one by one.
 * - Moves to the next phrase and repeats forever.
 *
 * This function depends on external state:
 * - `tw`: DOM element used for displaying the text.
 * - `twPhrases`: translated typewriter phrases.
 * - `twIndex`: current phrase index.
 * - `twChar`: current character index.
 * - `twDeleting`: whether the animation is currently deleting text.
 *
 * @returns {void}
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

/**
 * Observes revealable elements and applies the `visible` class
 * when they enter the viewport.
 */
document
    .querySelectorAll('.reveal, .timeline-item, .timeline-item2, .project-card, .case-item')
    .forEach(el => io.observe(el));

const fileUpload = document.getElementById('fileUpload');
const fileInput = document.getElementById('fileInput');
const fileDropZone = document.getElementById('fileDropZone');
const filePreview = document.getElementById('filePreview');
const fileName = document.getElementById('fileName');
const fileSize = document.getElementById('fileSize');
const filePreviewIcon = document.getElementById('filePreviewIcon');
const fileRemove = document.getElementById('fileRemove');
const fileError = document.getElementById('fileError');

const FILE_UPLOAD_CONFIG = {
  maxSizeMB: 5,
  allowedExtensions: ['pdf', 'doc', 'docx', 'png', 'jpg', 'jpeg']
};

/**
 * Formats a file size in bytes into a human-readable string.
 *
 * @param {number} bytes - File size in bytes.
 * @returns {string} Formatted file size.
 */
function formatFileSize(bytes) {
  if (!bytes) return '0 KB';

  const units = ['B', 'KB', 'MB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

/**
 * Gets the file extension from a file name.
 *
 * @param {string} fileNameValue - File name.
 * @returns {string} Lowercase file extension without dot.
 */
function getFileExtension(fileNameValue) {
  return fileNameValue.split('.').pop().toLowerCase();
}

/**
 * Returns a display icon based on the selected file extension.
 *
 * @param {string} extension - File extension.
 * @returns {string} Emoji icon for the file type.
 */
function getFileIcon(extension) {
  const iconMap = {
    pdf: '📕',
    doc: '📘',
    docx: '📘',
    png: '🖼️',
    jpg: '🖼️',
    jpeg: '🖼️'
  };

  return iconMap[extension] || '📄';
}

/**
 * Displays a localized file upload error message.
 *
 * @param {string} message - Error message to display.
 * @returns {void}
 */
function showFileError(message) {
  if (!fileError) return;

  fileError.textContent = message;
  fileError.hidden = false;
}

/**
 * Clears the current file upload error message.
 *
 * @returns {void}
 */
function clearFileError() {
  if (!fileError) return;

  fileError.textContent = '';
  fileError.hidden = true;
}

/**
 * Validates the selected file by extension and size.
 *
 * @param {File} file - Selected file object.
 * @returns {boolean} Whether the file is valid.
 */
function validateSelectedFile(file) {
  const extension = getFileExtension(file.name);
  const maxSizeBytes = FILE_UPLOAD_CONFIG.maxSizeMB * 1024 * 1024;

  if (!FILE_UPLOAD_CONFIG.allowedExtensions.includes(extension)) {
    showFileError(
      i18n['contact.form.file.error.type'] ||
      'Unsupported file type. Please upload PDF, DOC, DOCX, PNG, JPG, or JPEG.'
    );
    return false;
  }

  if (file.size > maxSizeBytes) {
    showFileError(
      i18n['contact.form.file.error.size'] ||
      `File is too large. Maximum size is ${FILE_UPLOAD_CONFIG.maxSizeMB}MB.`
    );
    return false;
  }

  clearFileError();
  return true;
}

/**
 * Updates the file upload preview UI after a file is selected.
 *
 * @param {File} file - Selected file object.
 * @returns {void}
 */
function renderSelectedFile(file) {
  const extension = getFileExtension(file.name);

  fileName.textContent = file.name;
  fileSize.textContent = formatFileSize(file.size);
  filePreviewIcon.textContent = getFileIcon(extension);

  filePreview.hidden = false;
}

/**
 * Resets the file upload input and preview UI.
 *
 * @returns {void}
 */
function resetSelectedFile() {
  if (!fileInput || !filePreview || !fileName || !fileSize || !filePreviewIcon) return;

  fileInput.value = '';
  fileName.textContent = i18n['contact.form.file.empty'] || 'No file selected';
  fileSize.textContent = '—';
  filePreviewIcon.textContent = '📄';
  filePreview.hidden = true;

  clearFileError();
}

/**
 * Handles file selection from both input change and drag-and-drop.
 *
 * @param {FileList|File[]} files - Selected files.
 * @returns {void}
 */
function handleSelectedFiles(files) {
  if (!files || !files.length) {
    resetSelectedFile();
    return;
  }

  const file = files[0];

  if (!validateSelectedFile(file)) {
    resetSelectedFile();
    return;
  }

  renderSelectedFile(file);
}

if (fileInput && fileName && fileSize && filePreview && filePreviewIcon) {
  fileInput.addEventListener('change', () => {
    handleSelectedFiles(fileInput.files);
  });
}

if (fileRemove) {
  fileRemove.addEventListener('click', resetSelectedFile);
}

if (fileUpload && fileDropZone && fileInput) {
  ['dragenter', 'dragover'].forEach(eventName => {
    fileDropZone.addEventListener(eventName, (event) => {
      event.preventDefault();
      fileUpload.classList.add('drag-over');
    });
  });

  ['dragleave', 'drop'].forEach(eventName => {
    fileDropZone.addEventListener(eventName, (event) => {
      event.preventDefault();
      fileUpload.classList.remove('drag-over');
    });
  });

  fileDropZone.addEventListener('drop', (event) => {
    const files = event.dataTransfer.files;

    if (!files || !files.length) return;

    fileInput.files = files;
    handleSelectedFiles(files);
  });
}

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

/**
 * Loads translation data for the selected language and updates the UI.
 *
 * Behavior:
 * - Fetches the matching language JSON file from `/assets/i18n`.
 * - Falls back to English if loading fails.
 * - Updates text content for all elements using `data-i18n`.
 * - Updates placeholders for elements using `data-i18n-placeholder`.
 * - Updates the document language attribute.
 * - Updates typewriter phrases.
 * - Resets typewriter state.
 * - Updates the document title.
 * - Updates the active language button.
 *
 * @async
 * @param   {string}        lang    Language code to load. Expected values: `"en"` or `"vi"`.
 * @returns {Promise<void>}         Resolves when language data has been loaded and UI text has been updated.
 */
loadLang(savedLang).then(() => {
    type(); // start ONLY AFTER data ready
    loadGithubRepos();
});