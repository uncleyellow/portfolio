
/* =========================
   MULTI-LANGUAGE INTRO
   ========================= */

document.addEventListener('DOMContentLoaded', () => {
  const greetings = [
    'Hello there',
    'Xin chào',
    'Bonjour',
    'こんにちは',
    '안녕하세요',
    'Welcome to my portfolio',
    'Let’s build something meaningful'
  ];

  const introScreen = document.getElementById('introScreen');
  const introGreeting = document.getElementById('introGreeting');

  let index = 0;
  let stopped = false;

  function showGreeting() {
    if (stopped) return;

    introGreeting.textContent = greetings[index];
    introGreeting.classList.remove('show');
    void introGreeting.offsetWidth; // force reflow
    introGreeting.classList.add('show');

    index++;

    if (index < greetings.length) {
      setTimeout(showGreeting, 1350);
    } else {
      // intro kết thúc → chuyển sang loader
      setTimeout(finish, 800);
    }
  }

  function finish() {
    stopped = true;
    introScreen.classList.add('hidden');
    introScreen.setAttribute('aria-hidden', 'true');
  }

  // Cho phép click / tap để bỏ qua intro

  // ✅ click skip
  introScreen.addEventListener('click', finish);


  // ESC để skip
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        finish();
    }
  });

  showGreeting();
});