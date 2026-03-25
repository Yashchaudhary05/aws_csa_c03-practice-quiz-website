/**
 * Quiz logic — scoring, answer validation, analytics.
 */
import { getState, setState, saveToStorage } from './state.js';
import { arraysEqual } from './utils.js';

export function recordAnswer(questionId, selectedOptions) {
  const state = getState();
  const answers = { ...state.answers, [questionId]: selectedOptions };

  // Track time spent on this question
  const now = Date.now();
  const elapsed = Math.round((now - state.questionStartTime) / 1000);
  const timePerQuestion = { ...state.timePerQuestion, [questionId]: elapsed };

  setState({ answers, timePerQuestion });
  saveToStorage();
}

export function isCorrect(questionId) {
  const state = getState();
  const question = state.filteredQuestions.find(q => q.id === questionId);
  if (!question) return false;
  return arraysEqual(state.answers[questionId] || [], question.answer);
}

export function calculateScore() {
  const state = getState();
  let score = 0;
  state.filteredQuestions.forEach(q => {
    if (isCorrect(q.id)) score++;
  });
  return score;
}

export function getAnalytics() {
  const state = getState();
  const questions = state.filteredQuestions;
  const answers = state.answers;
  const timePerQ = state.timePerQuestion;

  // By topic
  const topicStats = {};
  questions.forEach(q => {
    if (!topicStats[q.topic]) {
      topicStats[q.topic] = { total: 0, correct: 0, totalTime: 0 };
    }
    topicStats[q.topic].total++;
    if (isCorrect(q.id)) topicStats[q.topic].correct++;
    topicStats[q.topic].totalTime += (timePerQ[q.id] || 0);
  });

  // By difficulty
  const difficultyStats = {};
  questions.forEach(q => {
    if (!difficultyStats[q.difficulty]) {
      difficultyStats[q.difficulty] = { total: 0, correct: 0 };
    }
    difficultyStats[q.difficulty].total++;
    if (isCorrect(q.id)) difficultyStats[q.difficulty].correct++;
  });

  // Overall
  const totalTime = Object.values(timePerQ).reduce((a, b) => a + b, 0);
  const avgTime = questions.length > 0 ? Math.round(totalTime / questions.length) : 0;

  return { topicStats, difficultyStats, totalTime, avgTime };
}

export function toggleFlag(questionId) {
  const state = getState();
  const flagged = new Set(state.flagged);
  if (flagged.has(questionId)) {
    flagged.delete(questionId);
  } else {
    flagged.add(questionId);
  }
  setState({ flagged });
  saveToStorage();
}
