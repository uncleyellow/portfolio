
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

/**
 * Displays the current greeting message on the intro screen, animates it,
 * then schedules the next greeting until all greetings have been shown.
 *
 * Flow:
 * - Stops immediately if the intro sequence has already been stopped.
 * - Updates `introGreeting.textContent` with the current greeting.
 * - Restarts the CSS animation by removing and re-adding the `show` class.
 * - Increments the greeting index.
 * - Calls itself again after a delay if more greetings remain.
 * - Calls `finish()` after the final greeting.
 *
 * @function showGreeting
 * @returns {void}
 */
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

/**
 * Finishes the intro greeting sequence and hides the intro screen.
 *
 * Flow:
 * - Marks the intro sequence as stopped.
 * - Adds the `hidden` class to trigger the intro screen hide animation/state.
 * - Updates `aria-hidden` for accessibility so assistive technologies
 *   know the intro screen is no longer visible.
 *
 * @function finish
 * @returns {void}
 */
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