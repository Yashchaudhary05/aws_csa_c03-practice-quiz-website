/**
 * Utility functions: shuffle, formatting, CSV export.
 */

/** Fisher-Yates shuffle — returns a new array */
export function shuffle(array) {
  const a = [...array];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Format seconds as MM:SS */
export function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/** Escape HTML to prevent XSS */
export function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/** Get unique topics from questions array */
export function getTopics(questions) {
  return [...new Set(questions.map(q => q.topic))].sort();
}

/** Generate CSV from results */
export function generateCSV(questions, answers, timePerQuestion) {
  const headers = ['#', 'Question', 'Topic', 'Difficulty', 'Your Answer', 'Correct Answer', 'Result', 'Time (s)'];
  const rows = questions.map((q, i) => {
    const userAnswer = (answers[q.id] || []).join('; ');
    const correctAnswer = q.answer.join('; ');
    const isCorrect = arraysEqual(answers[q.id] || [], q.answer) ? 'Correct' : 'Incorrect';
    const time = timePerQuestion[q.id] || 0;
    return [i + 1, `"${q.question.replace(/"/g, '""')}"`, q.topic, q.difficulty, `"${userAnswer}"`, `"${correctAnswer}"`, isCorrect, time];
  });
  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

/** Download a string as a file */
export function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Compare two arrays ignoring order */
export function arraysEqual(a, b) {
  if (!a || !b) return false;
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((val, i) => val === sortedB[i]);
}

/** Difficulty color mapping */
export function getDifficultyColor(difficulty) {
  const colors = { easy: '#4caf50', medium: '#ff9800', hard: '#f44336' };
  return colors[difficulty] || '#999';
}
