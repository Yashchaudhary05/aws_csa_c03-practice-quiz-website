/**
 * Centralized state management with localStorage persistence.
 * Implements a simple pub/sub pattern for reactive state updates.
 */

const STORAGE_KEY = 'aws-quiz-state';

const defaultState = {
  mode: 'exam',           // 'exam' | 'practice' | 'review'
  questions: [],          // loaded from JSON
  filteredQuestions: [],   // after topic filtering
  currentIndex: 0,
  answers: {},            // { questionId: selectedOptions[] }
  flagged: new Set(),
  score: 0,
  totalTime: 3600,        // seconds
  timeRemaining: 3600,
  timePerQuestion: {},    // { questionId: seconds }
  questionStartTime: 0,
  selectedTopics: [],
  screen: 'start',       // 'start' | 'quiz' | 'results' | 'error'
  theme: 'dark',
  quizStartTime: null,
  quizEndTime: null,
};

let state = { ...defaultState };
const listeners = new Map();

export function getState() {
  return state;
}

export function setState(updates) {
  const prev = { ...state };
  // Handle Set objects specially
  if (updates.flagged instanceof Set) {
    state = { ...state, ...updates };
  } else {
    state = { ...state, ...updates };
  }
  // Notify listeners
  for (const [key, callbacks] of listeners) {
    if (key in updates && updates[key] !== prev[key]) {
      callbacks.forEach(cb => cb(state[key], prev[key]));
    }
  }
}

export function subscribe(key, callback) {
  if (!listeners.has(key)) {
    listeners.set(key, []);
  }
  listeners.get(key).push(callback);
}

export function saveToStorage() {
  const serializable = {
    mode: state.mode,
    currentIndex: state.currentIndex,
    answers: state.answers,
    flagged: [...state.flagged],
    score: state.score,
    timeRemaining: state.timeRemaining,
    timePerQuestion: state.timePerQuestion,
    selectedTopics: state.selectedTopics,
    screen: state.screen,
    theme: state.theme,
    quizStartTime: state.quizStartTime,
    filteredQuestionIds: state.filteredQuestions.map(q => q.id),
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
  } catch {
    // Storage full or unavailable — silently ignore
  }
}

export function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw);
    saved.flagged = new Set(saved.flagged || []);
    return saved;
  } catch {
    return null;
  }
}

export function clearStorage() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore
  }
}

export function resetState() {
  state = {
    ...defaultState,
    theme: state.theme,        // preserve theme
    questions: state.questions, // preserve loaded questions
    flagged: new Set(),
  };
  clearStorage();
}

export function loadTheme() {
  try {
    return localStorage.getItem('aws-quiz-theme') || 'dark';
  } catch {
    return 'dark';
  }
}

export function saveTheme(theme) {
  try {
    localStorage.setItem('aws-quiz-theme', theme);
  } catch {
    // Ignore
  }
}
