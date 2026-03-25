/**
 * Main application entry point.
 * Initializes the quiz, binds events, handles keyboard shortcuts.
 */
import { getState, setState, resetState, saveToStorage, loadFromStorage, clearStorage, loadTheme, saveTheme } from './state.js';
import { shuffle, getTopics } from './utils.js';
import { startTimer, stopTimer, updateTimerUI } from './timer.js';
import { calculateScore } from './quiz.js';
import {
  showScreen, renderExamCards, renderStartConfig, showExamSelector,
  renderQuestion, renderResults,
  handleSubmit, handleNext, handlePrev, handleFlag, handleExport,
  setTimerVisibility, renderNavigator
} from './ui.js';

let allExams = [];
let allQuestions = [];

// ─── Load Exams Manifest ──────────────────────────────────────
async function loadExams() {
  const response = await fetch('exams.json');
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

// ─── Load Questions for an Exam ────────────────────────────────
async function loadQuestions(questionFile) {
  const response = await fetch(questionFile);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json();
  if (!Array.isArray(data) || data.length === 0) throw new Error('Invalid question data');
  return data;
}

// ─── Select an Exam ────────────────────────────────────────────
async function selectExam(exam) {
  try {
    allQuestions = await loadQuestions(exam.questionFile);
    setState({ questions: allQuestions, currentExam: exam });
    renderStartConfig(exam, allQuestions);
  } catch (err) {
    document.getElementById('error-message').textContent =
      `Failed to load questions for ${exam.shortTitle}: ${err.message}`;
    showScreen('error');
  }
}

// ─── Initialize ────────────────────────────────────────────────
async function init() {
  // Theme
  const theme = loadTheme();
  applyTheme(theme);
  setState({ theme });

  try {
    allExams = await loadExams();
  } catch (err) {
    document.getElementById('error-message').textContent =
      `Failed to load exam list: ${err.message}`;
    showScreen('error');
    bindGlobalEvents();
    return;
  }

  // Check for saved state
  const saved = loadFromStorage();
  if (saved && saved.screen === 'quiz' && saved.filteredQuestionIds && saved.examId) {
    const exam = allExams.find(e => e.id === saved.examId);
    if (exam) {
      try {
        allQuestions = await loadQuestions(exam.questionFile);
        setState({ questions: allQuestions, currentExam: exam });

        const filtered = saved.filteredQuestionIds
          .map(id => allQuestions.find(q => q.id === id))
          .filter(Boolean);

        if (filtered.length > 0) {
          setState({
            mode: saved.mode,
            filteredQuestions: filtered,
            currentIndex: saved.currentIndex || 0,
            answers: saved.answers || {},
            flagged: new Set(saved.flagged || []),
            score: saved.score || 0,
            timeRemaining: saved.timeRemaining || exam.timeLimit,
            totalTime: exam.timeLimit,
            timePerQuestion: saved.timePerQuestion || {},
            selectedTopics: saved.selectedTopics || [],
            questionStartTime: Date.now(),
            quizStartTime: saved.quizStartTime,
          });

          showScreen('quiz');
          updateExamBadge(exam);
          setTimerVisibility(saved.mode === 'exam');
          renderQuestion();
          renderNavigator();

          if (saved.mode === 'exam') {
            updateTimerUI(saved.timeRemaining, exam.timeLimit);
            startTimer();
          }

          bindQuizEvents();
          bindGlobalEvents();
          return;
        }
      } catch {
        clearStorage();
      }
    }
  }

  // Fresh start — show exam cards
  renderExamCards(allExams, selectExam);
  showScreen('start');
  bindStartEvents();
  bindGlobalEvents();
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
  const state = getState();
  const exam = state.currentExam;
  if (!exam) return;

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

  // Shuffle questions and options, then take quizLength
  filtered = shuffle(filtered).map(q => ({
    ...q,
    options: shuffle(q.options),
  }));

  const quizLength = exam.quizLength || filtered.length;
  if (filtered.length > quizLength) {
    filtered = filtered.slice(0, quizLength);
  }

  resetState();
  setState({
    mode,
    currentExam: exam,
    questions: allQuestions,
    filteredQuestions: filtered,
    currentIndex: 0,
    selectedTopics,
    questionStartTime: Date.now(),
    quizStartTime: Date.now(),
    timeRemaining: exam.timeLimit,
    totalTime: exam.timeLimit,
  });

  showScreen('quiz');
  updateExamBadge(exam);
  setTimerVisibility(mode === 'exam');

  if (mode === 'exam') {
    updateTimerUI(exam.timeLimit, exam.timeLimit);
    startTimer();
  }

  renderQuestion();
  saveToStorage();
  bindQuizEvents();
}

function updateExamBadge(exam) {
  const badge = document.getElementById('exam-badge');
  if (badge) badge.textContent = `${exam.icon} ${exam.shortTitle}`;
}

// ─── Finish Quiz ───────────────────────────────────────────────
function finishQuiz() {
  stopTimer();
  setState({ quizEndTime: Date.now() });
  clearStorage();
  renderResults();
}

// ─── Exit Quiz ─────────────────────────────────────────────────
function showExitModal() {
  const modal = document.getElementById('exit-modal');
  if (modal && typeof modal.showModal === 'function') {
    modal.showModal();
  }
}

function exitQuiz() {
  const modal = document.getElementById('exit-modal');
  if (modal && modal.open) modal.close();
  stopTimer();
  resetState();
  clearStorage();
  backToHome();
}

// ─── Back to Home ──────────────────────────────────────────────
function backToHome() {
  stopTimer();
  renderExamCards(allExams, selectExam);
  showExamSelector();
  showScreen('start');
}

// ─── Event Binding ─────────────────────────────────────────────
function bindGlobalEvents() {
  document.getElementById('theme-toggle').onclick = toggleTheme;
  document.getElementById('home-btn').onclick = () => {
    const state = getState();
    if (state.screen === 'quiz') {
      showExitModal();
    } else {
      backToHome();
    }
  };
  document.getElementById('retry-btn').onclick = () => location.reload();
  document.getElementById('home-error-btn').onclick = backToHome;

  // Exit modal
  document.getElementById('exit-quiz').onclick = showExitModal;
  document.getElementById('exit-confirm').onclick = exitQuiz;
  document.getElementById('exit-cancel').onclick = () => {
    const modal = document.getElementById('exit-modal');
    if (modal && modal.open) modal.close();
  };

  // Keyboard shortcuts
  document.addEventListener('keydown', handleKeyboard);
}

function bindStartEvents() {
  document.getElementById('start-quiz').onclick = startQuiz;
  document.getElementById('back-to-exams').onclick = () => {
    showExamSelector();
  };
}

function bindQuizEvents() {
  const submitBtn = document.getElementById('submit-btn');
  const nextBtn = document.getElementById('next-btn');
  const prevBtn = document.getElementById('prev-btn');
  const flagBtn = document.getElementById('flag-btn');
  const finishBtn = document.getElementById('finish-btn');
  const retakeBtn = document.getElementById('retake-btn');
  const exportBtn = document.getElementById('export-btn');
  const homeResultsBtn = document.getElementById('home-results-btn');

  submitBtn.onclick = handleSubmit;
  nextBtn.onclick = handleNext;
  prevBtn.onclick = handlePrev;
  flagBtn.onclick = handleFlag;
  finishBtn.onclick = finishQuiz;
  retakeBtn.onclick = () => {
    const exam = getState().currentExam;
    if (exam) selectExam(exam);
  };
  exportBtn.onclick = handleExport;
  homeResultsBtn.onclick = backToHome;

  // Time up event
  document.addEventListener('quiz:timeup', () => finishQuiz(), { once: true });
}

function handleKeyboard(e) {
  const state = getState();
  if (state.screen !== 'quiz') return;
  if (e.target.tagName === 'INPUT' && e.target.type === 'text') return;

  switch (e.key) {
    case 'Escape':
      e.preventDefault();
      showExitModal();
      break;
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
      if (!e.ctrlKey && !e.metaKey) handleFlag();
      break;
    case 't':
    case 'T':
      if (!e.ctrlKey && !e.metaKey) toggleTheme();
      break;
    case '1': case '2': case '3': case '4': case '5': {
      const index = parseInt(e.key) - 1;
      const options = document.querySelectorAll('#options-container input');
      if (options[index] && !options[index].disabled) {
        if (options[index].type === 'radio') {
          document.querySelectorAll('#options-container .option-label').forEach(l => l.classList.remove('selected'));
          options.forEach((opt, i) => { if (i !== index) opt.checked = false; });
        }
        options[index].checked = !options[index].checked;
        options[index].closest('.option-label').classList.toggle('selected', options[index].checked);
      }
      break;
    }
  }
}

// ─── Service Worker Registration ───────────────────────────────
function registerSW() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
}

// ─── Boot ──────────────────────────────────────────────────────
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => { init(); registerSW(); });
} else {
  init();
  registerSW();
}
