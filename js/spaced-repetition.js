/**
 * Spaced repetition — track weak areas across sessions.
 * Stores per-question stats in localStorage and prioritizes
 * questions the user gets wrong more often.
 */

const SR_KEY = 'cloudquiz-spaced-repetition';

function loadSRData() {
  try {
    const raw = localStorage.getItem(SR_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveSRData(data) {
  try {
    localStorage.setItem(SR_KEY, JSON.stringify(data));
  } catch {
    // Storage full — silently ignore
  }
}

/**
 * Record results after a quiz.
 * @param {string} examId - The exam identifier
 * @param {Array} questions - Array of question objects
 * @param {Object} answers - { questionId: selectedOptions[] }
 * @param {Function} isCorrectFn - Function(questionId) → boolean
 */
export function recordSRResults(examId, questions, answers, isCorrectFn) {
  const data = loadSRData();
  if (!data[examId]) data[examId] = {};

  questions.forEach(q => {
    if (!answers[q.id]) return; // unanswered
    if (!data[examId][q.id]) {
      data[examId][q.id] = { attempts: 0, correct: 0, lastSeen: 0 };
    }
    const entry = data[examId][q.id];
    entry.attempts++;
    if (isCorrectFn(q.id)) entry.correct++;
    entry.lastSeen = Date.now();
  });

  saveSRData(data);
}

/**
 * Sort questions so weaker ones appear first.
 * Score = correct/attempts ratio (lower = weaker).
 * Unseen questions get medium priority.
 */
export function prioritizeWeakQuestions(examId, questions) {
  const data = loadSRData();
  const examData = data[examId] || {};

  return [...questions].sort((a, b) => {
    const sa = examData[a.id];
    const sb = examData[b.id];

    const scoreA = sa && sa.attempts > 0 ? sa.correct / sa.attempts : 0.5;
    const scoreB = sb && sb.attempts > 0 ? sb.correct / sb.attempts : 0.5;

    // Lower score (weaker) first
    return scoreA - scoreB;
  });
}

/**
 * Get weak area stats for an exam.
 * Returns the topics user is weakest at.
 */
export function getWeakTopics(examId, questions) {
  const data = loadSRData();
  const examData = data[examId] || {};
  const topicStats = {};

  questions.forEach(q => {
    const entry = examData[q.id];
    if (!entry || entry.attempts === 0) return;
    if (!topicStats[q.topic]) topicStats[q.topic] = { attempts: 0, correct: 0 };
    topicStats[q.topic].attempts += entry.attempts;
    topicStats[q.topic].correct += entry.correct;
  });

  return Object.entries(topicStats)
    .map(([topic, s]) => ({ topic, accuracy: s.attempts > 0 ? Math.round((s.correct / s.attempts) * 100) : 0, attempts: s.attempts }))
    .sort((a, b) => a.accuracy - b.accuracy);
}
