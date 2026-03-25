/**
 * Main application entry point.
 * Initializes the quiz, binds events, handles keyboard shortcuts.
 */
import { getState, setState, resetState, saveToStorage, loadFromStorage, clearStorage, loadTheme, saveTheme } from './state.js';
import { shuffle, getTopics } from './utils.js';
import { startTimer, stopTimer, updateTimerUI } from './timer.js';
import { calculateScore } from './quiz.js';
import {
  showScreen, renderStartScreen, renderQuestion, renderResults,
  handleSubmit, handleNext, handlePrev, handleFlag, handleExport,
  setTimerVisibility, renderNavigator
} from './ui.js';

let allQuestions = [];

// ─── Load Questions ────────────────────────────────────────────
async function loadQuestions() {
  try {
    const response = await fetch('questions.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) throw new Error('Invalid question data');
    return data;
  } catch (err) {
    document.getElementById('error-message').textContent =
      `Failed to load questions: ${err.message}. Please check your connection and try again.`;
    showScreen('error');
    throw err;
  }
}

// ─── Initialize ────────────────────────────────────────────────
async function init() {
  // Theme
  const theme = loadTheme();
  applyTheme(theme);
  setState({ theme });

  try {
    allQuestions = await loadQuestions();
    setState({ questions: allQuestions });
  } catch {
    return; // Error screen already shown
  }

  // Check for saved state
  const saved = loadFromStorage();
  if (saved && saved.screen === 'quiz' && saved.filteredQuestionIds) {
    // Restore in-progress quiz
    const filtered = saved.filteredQuestionIds
      .map(id => allQuestions.find(q => q.id === id))
      .filter(Boolean);

    if (filtered.length > 0) {
      setState({
        mode: saved.mode,
        filteredQuestions: filtered,
        currentIndex: saved.currentIndex || 0,
        answers: saved.answers || {},
        flagged: saved.flagged,
        score: saved.score || 0,
        timeRemaining: saved.timeRemaining || 3600,
        timePerQuestion: saved.timePerQuestion || {},
        selectedTopics: saved.selectedTopics || [],
        questionStartTime: Date.now(),
        quizStartTime: saved.quizStartTime,
      });

      showScreen('quiz');
      setTimerVisibility(saved.mode === 'exam');
      renderQuestion();
      renderNavigator();

      if (saved.mode === 'exam') {
        updateTimerUI(saved.timeRemaining, getState().totalTime);
        startTimer();
      }

      bindQuizEvents();
      bindKeyboardShortcuts();
      return;
    }
  }

  // Fresh start
  renderStartScreen(allQuestions);
  showScreen('start');
  bindStartEvents();
  bindKeyboardShortcuts();
}

// ─── Theme ─────────────────────────────────────────────────────
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const btn = document.getElementById('theme-toggle');
  if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
}

function toggleTheme() {
  const current = getState().theme;
  const next = current === 'dark' ? 'light' : 'dark';
  setState({ theme: next });
  saveTheme(next);
  applyTheme(next);
}

// ─── Start Quiz ────────────────────────────────────────────────
function startQuiz() {
  const modeInput = document.querySelector('input[name="quiz-mode"]:checked');
  const mode = modeInput ? modeInput.value : 'exam';

  // Get selected topics
  const topicInputs = document.querySelectorAll('#topic-checkboxes input:checked');
  const selectedTopics = [...topicInputs].map(el => el.value);

  // Filter questions by topic
  let filtered = selectedTopics.length > 0
    ? allQuestions.filter(q => selectedTopics.includes(q.topic))
    : [...allQuestions];

  if (filtered.length === 0) {
    filtered = [...allQuestions];
  }

  // Shuffle questions and options
  filtered = shuffle(filtered).map(q => ({
    ...q,
    options: shuffle(q.options),
  }));

  resetState();
  setState({
    mode,
    filteredQuestions: filtered,
    currentIndex: 0,
    selectedTopics,
    questionStartTime: Date.now(),
    quizStartTime: Date.now(),
    timeRemaining: 3600,
  });

  showScreen('quiz');
  setTimerVisibility(mode === 'exam');

  if (mode === 'exam') {
    updateTimerUI(3600, 3600);
    startTimer();
  }

  renderQuestion();
  saveToStorage();
  bindQuizEvents();
}

// ─── Finish Quiz ───────────────────────────────────────────────
function finishQuiz() {
  stopTimer();
  setState({ quizEndTime: Date.now() });
  clearStorage();
  renderResults();
}

// ─── Retake ────────────────────────────────────────────────────
function retakeQuiz() {
  resetState();
  renderStartScreen(allQuestions);
  showScreen('start');
}

// ─── Event Binding ─────────────────────────────────────────────
function bindStartEvents() {
  document.getElementById('start-quiz').addEventListener('click', startQuiz);
  document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
  document.getElementById('retry-btn').addEventListener('click', () => location.reload());
}

function bindQuizEvents() {
  // Remove old listeners by cloning (idempotent approach)
  const submitBtn = document.getElementById('submit-btn');
  const nextBtn = document.getElementById('next-btn');
  const prevBtn = document.getElementById('prev-btn');
  const flagBtn = document.getElementById('flag-btn');
  const finishBtn = document.getElementById('finish-btn');
  const retakeBtn = document.getElementById('retake-btn');
  const exportBtn = document.getElementById('export-btn');

  submitBtn.onclick = handleSubmit;
  nextBtn.onclick = handleNext;
  prevBtn.onclick = handlePrev;
  flagBtn.onclick = handleFlag;
  finishBtn.onclick = finishQuiz;
  retakeBtn.onclick = retakeQuiz;
  exportBtn.onclick = handleExport;

  // Time up event
  document.addEventListener('quiz:timeup', () => finishQuiz(), { once: true });
}

function bindKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    const state = getState();
    if (state.screen !== 'quiz') return;

    // Don't interfere with text inputs
    if (e.target.tagName === 'INPUT' && e.target.type === 'text') return;

    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        if (!document.getElementById('submit-btn').classList.contains('hidden')) {
          handleSubmit();
        } else if (!document.getElementById('next-btn').classList.contains('hidden')) {
          handleNext();
        } else if (!document.getElementById('finish-btn').classList.contains('hidden')) {
          finishQuiz();
        }
        break;
      case 'ArrowRight':
        if (state.answers[state.filteredQuestions[state.currentIndex]?.id]) {
          handleNext();
        }
        break;
      case 'ArrowLeft':
        handlePrev();
        break;
      case 'f':
      case 'F':
        if (!e.ctrlKey && !e.metaKey) {
          handleFlag();
        }
        break;
      case 't':
      case 'T':
        if (!e.ctrlKey && !e.metaKey) {
          toggleTheme();
        }
        break;
      case '1': case '2': case '3': case '4': case '5':
        {
          const index = parseInt(e.key) - 1;
          const options = document.querySelectorAll('#options-container input');
          if (options[index] && !options[index].disabled) {
            options[index].checked = !options[index].checked;
            // For radio buttons, uncheck others
            if (options[index].type === 'radio') {
              options.forEach((opt, i) => {
                if (i !== index) opt.checked = false;
              });
            }
          }
        }
        break;
    }
  });
}

// ─── Service Worker Registration ───────────────────────────────
function registerSW() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {
      // SW registration failed — app works fine without it
    });
  }
}

// ─── Boot ──────────────────────────────────────────────────────
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => { init(); registerSW(); });
} else {
  init();
  registerSW();
}
