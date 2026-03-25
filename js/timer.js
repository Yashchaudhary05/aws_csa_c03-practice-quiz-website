/**
 * Timer module — manages the countdown and visual warnings.
 */
import { getState, setState, saveToStorage } from './state.js';
import { formatTime } from './utils.js';

let timerInterval = null;

export function startTimer() {
  stopTimer();
  const state = getState();
  if (state.mode !== 'exam') return; // No timer in practice/review

  timerInterval = setInterval(() => {
    const s = getState();
    const remaining = s.timeRemaining - 1;
    setState({ timeRemaining: remaining });
    updateTimerUI(remaining, s.totalTime);

    if (remaining % 10 === 0) saveToStorage(); // Save periodically

    if (remaining <= 0) {
      stopTimer();
      document.dispatchEvent(new CustomEvent('quiz:timeup'));
    }
  }, 1000);
}

export function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

export function updateTimerUI(remaining, total) {
  const fill = document.getElementById('timer-fill');
  const text = document.getElementById('timer-text');
  const bar = document.getElementById('timer-bar');
  if (!fill || !text) return;

  const pct = (remaining / total) * 100;
  fill.style.width = `${pct}%`;
  text.textContent = formatTime(remaining);

  // Warning colors
  bar.classList.remove('warning', 'danger');
  if (remaining <= 60) {
    bar.classList.add('danger');
  } else if (remaining <= 300) {
    bar.classList.add('warning');
  }
}

export function resetTimer() {
  stopTimer();
  setState({ timeRemaining: getState().totalTime });
  updateTimerUI(getState().totalTime, getState().totalTime);
}
