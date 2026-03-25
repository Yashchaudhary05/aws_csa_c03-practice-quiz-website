/**
 * UI rendering — all DOM updates happen here.
 * Uses textContent for user-facing strings to prevent XSS.
 */
import { getState, setState, saveToStorage } from './state.js';
import { recordAnswer, isCorrect, calculateScore, getAnalytics, toggleFlag } from './quiz.js';
import { startTimer, stopTimer, updateTimerUI } from './timer.js';
import { escapeHtml, formatTime, getTopics, shuffle, generateCSV, downloadFile, getDifficultyColor } from './utils.js';
import { showToast } from './toast.js';
import { fireConfetti } from './confetti.js';
import { recordSRResults, getWeakTopics } from './spaced-repetition.js';

// ─── Screen Management ────────────────────────────────────────
export function showScreen(screen) {
  ['start-screen', 'quiz-screen', 'results-screen', 'error-screen'].forEach(id => {
    document.getElementById(id).classList.add('hidden');
  });
  const target = document.getElementById(`${screen}-screen`);
  target.classList.remove('hidden');
  setState({ screen });
  // Focus management for accessibility
  const focusTarget = target.querySelector('h1, h2, button, [tabindex]');
  if (focusTarget) setTimeout(() => focusTarget.focus({ preventScroll: true }), 100);
}

// ─── Skeleton Loading ──────────────────────────────────────────
export function showSkeletonCards(container, count = 3) {
  container.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const card = document.createElement('div');
    card.className = 'skeleton-card';
    card.innerHTML = `
      <div class="skeleton-line skeleton-icon"></div>
      <div class="skeleton-line skeleton-title"></div>
      <div class="skeleton-line skeleton-text"></div>
      <div class="skeleton-line skeleton-short"></div>
    `;
    container.appendChild(card);
  }
}

// ─── Exam Card Rendering ──────────────────────────────────────
export function renderExamCards(exams, onSelect) {
  const container = document.getElementById('exam-cards');
  container.innerHTML = '';
  exams.forEach(exam => {
    const card = document.createElement('div');
    card.className = 'exam-card';
    card.style.setProperty('--exam-color', exam.color);
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `Select ${exam.title}`);

    const quizLen = exam.quizLength || exam.questionCount;
    card.innerHTML = `
      <span class="exam-card-icon" style="background: ${escapeHtml(exam.color)}15">${escapeHtml(exam.icon)}</span>
      <div class="exam-card-title">${escapeHtml(exam.shortTitle || exam.title)}</div>
      <div class="exam-card-desc">${escapeHtml(exam.description)}</div>
      <div class="exam-card-meta">
        <span>📝 ${quizLen} of ${exam.questionCount} Qs</span>
        <span>⏱️ ${Math.round(exam.timeLimit / 60)} min</span>
        <span>✅ ${exam.passingScore}% pass</span>
      </div>
    `;

    card.addEventListener('click', () => onSelect(exam));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(exam); }
    });
    container.appendChild(card);
  });
}

// ─── Start Screen Config ──────────────────────────────────────
export function renderStartConfig(exam, questions) {
  const configEl = document.getElementById('quiz-config');
  const selectorEl = document.querySelector('.exam-selector-section');

  // Show config, hide exam selector
  configEl.classList.remove('hidden');
  selectorEl.classList.add('hidden');

  // Populate exam info
  document.getElementById('selected-exam-icon').textContent = exam.icon;
  document.getElementById('selected-exam-title').textContent = exam.shortTitle || exam.title;
  document.getElementById('selected-exam-desc').textContent = exam.description;

  // Populate topics
  const topics = getTopics(questions);
  const container = document.getElementById('topic-checkboxes');
  container.innerHTML = '';

  topics.forEach(topic => {
    const label = document.createElement('label');
    label.className = 'topic-checkbox checked';

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.value = topic;
    input.checked = true;

    input.addEventListener('change', () => {
      label.classList.toggle('checked', input.checked);
    });

    const span = document.createElement('span');
    span.textContent = topic;

    label.appendChild(input);
    label.appendChild(span);
    container.appendChild(label);
  });

  // Populate quiz length options
  renderQuizLengthOptions(exam, questions);
}

export function showExamSelector() {
  const configEl = document.getElementById('quiz-config');
  const selectorEl = document.querySelector('.exam-selector-section');
  configEl.classList.add('hidden');
  selectorEl.classList.remove('hidden');
}

function renderQuizLengthOptions(exam, questions) {
  const container = document.getElementById('quiz-length-options');
  if (!container) return;
  container.innerHTML = '';

  const total = questions.length;
  const defaultLen = exam.quizLength || total;
  const options = [15, 30, 65, total].filter((v, i, a) => v <= total && a.indexOf(v) === i);

  options.forEach(len => {
    const label = document.createElement('label');
    label.className = 'quiz-length-option';

    const input = document.createElement('input');
    input.type = 'radio';
    input.name = 'quiz-length';
    input.value = len;
    if (len === defaultLen) input.checked = true;

    const pill = document.createElement('span');
    pill.className = 'quiz-length-pill';
    pill.textContent = len === total ? `All ${total}` : `${len} Qs`;

    label.appendChild(input);
    label.appendChild(pill);
    container.appendChild(label);
  });
}

// ─── Question Navigator ────────────────────────────────────────
export function renderNavigator() {
  const state = getState();
  const container = document.getElementById('nav-buttons');
  container.innerHTML = '';

  state.filteredQuestions.forEach((q, i) => {
    const btn = document.createElement('button');
    btn.className = 'nav-btn';
    btn.textContent = i + 1;
    btn.setAttribute('aria-label', `Go to question ${i + 1}`);

    if (i === state.currentIndex) {
      btn.classList.add('current');
      btn.setAttribute('aria-current', 'step');
    }
    if (state.answers[q.id]) btn.classList.add('answered');
    if (state.flagged.has(q.id)) btn.classList.add('flagged');

    btn.addEventListener('click', () => {
      saveQuestionTime();
      setState({ currentIndex: i, questionStartTime: Date.now() });
      renderQuestion();
      renderNavigator();
      saveToStorage();
    });

    container.appendChild(btn);
  });
}

// ─── Question Rendering ────────────────────────────────────────
export function renderQuestion() {
  const state = getState();
  const q = state.filteredQuestions[state.currentIndex];
  if (!q) return;

  // Question number & meta
  document.getElementById('question-number').textContent = `Question ${state.currentIndex + 1} of ${state.filteredQuestions.length}`;
  document.getElementById('question-topic').textContent = q.topic;
  document.getElementById('question-difficulty').textContent = q.difficulty;
  document.getElementById('question-difficulty').style.backgroundColor = getDifficultyColor(q.difficulty);

  // Question text
  document.getElementById('question-text').textContent = q.question;

  // Multi-select hint
  const hint = document.getElementById('multi-select-hint');
  if (q.multiSelect) {
    hint.textContent = `Select ${q.selectCount || 2} answers`;
    hint.classList.remove('hidden');
  } else {
    hint.classList.add('hidden');
  }

  // Flag button
  const flagBtn = document.getElementById('flag-btn');
  flagBtn.classList.toggle('active', state.flagged.has(q.id));

  // Options
  const container = document.getElementById('options-container');
  container.innerHTML = '';

  const inputType = q.multiSelect ? 'checkbox' : 'radio';
  const legend = document.getElementById('options-legend');
  legend.textContent = q.multiSelect ? `Select ${q.selectCount} answers` : 'Select your answer';

  const isAnswered = !!state.answers[q.id];

  q.options.forEach((opt, i) => {
    const label = document.createElement('label');
    label.className = 'option-label';

    const input = document.createElement('input');
    input.type = inputType;
    input.name = 'quiz-option';
    input.value = opt;

    // Restore previous selection
    if (isAnswered && state.answers[q.id].includes(opt)) {
      input.checked = true;
      label.classList.add('selected');
    }

    const span = document.createElement('span');
    span.className = 'option-text';
    span.textContent = opt;

    const shortcut = document.createElement('kbd');
    shortcut.className = 'option-shortcut';
    shortcut.textContent = i + 1;

    label.appendChild(input);
    label.appendChild(shortcut);
    label.appendChild(span);

    // ★ Click handler to toggle visual selected state
    if (!isAnswered && state.mode !== 'review') {
      input.addEventListener('change', () => {
        if (inputType === 'radio') {
          // Deselect all others
          container.querySelectorAll('.option-label').forEach(l => l.classList.remove('selected'));
        }
        label.classList.toggle('selected', input.checked);
      });
    }

    container.appendChild(label);
  });

  // Buttons visibility
  const submitBtn = document.getElementById('submit-btn');
  const nextBtn = document.getElementById('next-btn');
  const finishBtn = document.getElementById('finish-btn');
  const prevBtn = document.getElementById('prev-btn');

  prevBtn.disabled = state.currentIndex === 0;

  // Clear feedback area
  document.getElementById('result-feedback').classList.add('hidden');
  document.getElementById('explanation-box').classList.add('hidden');

  if (state.mode === 'review') {
    submitBtn.classList.add('hidden');
    showReviewAnswers(q);
    if (state.currentIndex < state.filteredQuestions.length - 1) {
      nextBtn.classList.remove('hidden');
      finishBtn.classList.add('hidden');
    } else {
      nextBtn.classList.add('hidden');
      finishBtn.classList.remove('hidden');
    }
  } else if (isAnswered) {
    submitBtn.classList.add('hidden');
    if (state.mode === 'practice') {
      showFeedback(q);
    }
    // Disable inputs
    container.querySelectorAll('input').forEach(inp => inp.disabled = true);
    container.querySelectorAll('.option-label').forEach(l => l.classList.add('disabled'));

    if (state.currentIndex < state.filteredQuestions.length - 1) {
      nextBtn.classList.remove('hidden');
      finishBtn.classList.add('hidden');
    } else {
      nextBtn.classList.add('hidden');
      finishBtn.classList.remove('hidden');
    }
  } else {
    submitBtn.classList.remove('hidden');
    nextBtn.classList.add('hidden');
    finishBtn.classList.add('hidden');
  }

  // Progress
  updateProgress();
  renderNavigator();
}

function showReviewAnswers(q) {
  const container = document.getElementById('options-container');
  container.querySelectorAll('input').forEach(input => {
    const label = input.closest('.option-label');
    input.disabled = true;
    label.classList.add('disabled');
    if (q.answer.includes(input.value)) {
      label.classList.add('show-correct');
    }
  });

  const explanation = document.getElementById('explanation-box');
  if (q.explanation) {
    explanation.textContent = q.explanation;
    explanation.classList.remove('hidden');
  }
}

function showFeedback(q) {
  const correct = isCorrect(q.id);
  const feedback = document.getElementById('result-feedback');
  const explanation = document.getElementById('explanation-box');

  feedback.textContent = correct ? '✅ Correct!' : `❌ Incorrect. Correct: ${q.answer.join(', ')}`;
  feedback.className = `result-feedback ${correct ? 'correct' : 'incorrect'}`;
  feedback.classList.remove('hidden');

  if (q.explanation) {
    explanation.textContent = q.explanation;
    explanation.classList.remove('hidden');
  }

  // Highlight options with show-correct / show-incorrect
  const container = document.getElementById('options-container');
  container.querySelectorAll('input').forEach(input => {
    const label = input.closest('.option-label');
    input.disabled = true;
    label.classList.add('disabled');
    if (q.answer.includes(input.value)) {
      label.classList.add('show-correct');
    } else if (input.checked) {
      label.classList.add('show-incorrect');
    }
  });
}

function updateProgress() {
  const state = getState();
  const total = state.filteredQuestions.length;
  const answered = Object.keys(state.answers).length;
  const pct = total > 0 ? Math.round((answered / total) * 100) : 0;

  const fill = document.getElementById('progress-fill');
  const text = document.getElementById('progress-text');
  const bar = document.querySelector('.progress-bar');

  if (fill) fill.style.width = `${pct}%`;
  if (text) text.textContent = `${answered} / ${total}`;
  if (bar) {
    bar.setAttribute('aria-valuenow', pct);
    bar.setAttribute('aria-valuemax', 100);
  }
}

// ─── Submit Answer ─────────────────────────────────────────────
export function handleSubmit() {
  const state = getState();
  const q = state.filteredQuestions[state.currentIndex];
  if (!q || state.answers[q.id]) return;

  const selected = [...document.querySelectorAll('#options-container input:checked')]
    .map(el => el.value);

  if (selected.length === 0) {
    shakeButton(document.getElementById('submit-btn'));
    return;
  }

  if (q.multiSelect && selected.length !== q.selectCount) {
    shakeButton(document.getElementById('submit-btn'));
    return;
  }

  recordAnswer(q.id, selected);

  // Show feedback in practice mode
  if (state.mode === 'practice') {
    showFeedback(q);
  }

  // Update buttons
  document.getElementById('submit-btn').classList.add('hidden');
  if (state.currentIndex < state.filteredQuestions.length - 1) {
    document.getElementById('next-btn').classList.remove('hidden');
  } else {
    document.getElementById('finish-btn').classList.remove('hidden');
  }

  // Disable option inputs
  document.querySelectorAll('#options-container input').forEach(inp => inp.disabled = true);
  document.querySelectorAll('#options-container .option-label').forEach(l => l.classList.add('disabled'));
  renderNavigator();
}

function shakeButton(btn) {
  btn.classList.add('shake');
  setTimeout(() => btn.classList.remove('shake'), 500);
}

// ─── Navigation ────────────────────────────────────────────────
export function handleNext() {
  const state = getState();
  if (state.currentIndex < state.filteredQuestions.length - 1) {
    saveQuestionTime();
    setState({ currentIndex: state.currentIndex + 1, questionStartTime: Date.now() });
    renderQuestion();
    saveToStorage();
  }
}

export function handlePrev() {
  const state = getState();
  if (state.currentIndex > 0) {
    saveQuestionTime();
    setState({ currentIndex: state.currentIndex - 1, questionStartTime: Date.now() });
    renderQuestion();
    saveToStorage();
  }
}

function saveQuestionTime() {
  const state = getState();
  const q = state.filteredQuestions[state.currentIndex];
  if (!q || state.timePerQuestion[q.id]) return;
}

export function handleFlag() {
  const state = getState();
  const q = state.filteredQuestions[state.currentIndex];
  if (!q) return;
  toggleFlag(q.id);
  document.getElementById('flag-btn').classList.toggle('active', state.flagged.has(q.id));
  renderNavigator();
}

// ─── Results Screen ────────────────────────────────────────────
export function renderResults() {
  const state = getState();
  const score = calculateScore();
  const total = state.filteredQuestions.length;
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  const analytics = getAnalytics();
  const exam = state.currentExam;
  const passing = exam ? exam.passingScore : 72;
  const passed = pct >= passing;

  // Result banner
  const headline = document.getElementById('result-headline');
  const subline = document.getElementById('result-subline');
  headline.textContent = passed ? '🎉 Congratulations!' : '📚 Keep Studying!';
  subline.textContent = passed
    ? `You passed with ${pct}% (passing: ${passing}%)`
    : `You scored ${pct}% (passing: ${passing}%)`;

  // Score circle animation
  const ring = document.getElementById('score-ring');
  const circumference = 2 * Math.PI * 54;
  ring.style.strokeDasharray = circumference;
  ring.style.strokeDashoffset = circumference;
  setTimeout(() => {
    ring.style.strokeDashoffset = circumference - (pct / 100) * circumference;
  }, 100);

  ring.style.stroke = pct >= passing ? '#22c55e' : pct >= 50 ? '#f59e0b' : '#ef4444';

  document.getElementById('score-percent').textContent = `${pct}%`;
  document.getElementById('score-text').textContent = `${score} out of ${total} correct`;

  // Time taken
  const elapsed = state.quizEndTime && state.quizStartTime
    ? Math.round((state.quizEndTime - state.quizStartTime) / 1000)
    : analytics.totalTime;
  document.getElementById('time-taken').textContent = state.mode === 'exam'
    ? `Time: ${formatTime(elapsed)} · Avg: ${formatTime(analytics.avgTime)}/question`
    : `Avg: ${formatTime(analytics.avgTime)}/question`;

  // Topic stats
  const topicContainer = document.getElementById('topic-stats');
  topicContainer.innerHTML = '';
  for (const [topic, stats] of Object.entries(analytics.topicStats)) {
    const div = document.createElement('div');
    div.className = 'topic-stat-card';

    const topicPct = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;

    const title = document.createElement('strong');
    title.textContent = topic;

    const detail = document.createElement('span');
    detail.textContent = `${stats.correct}/${stats.total} (${topicPct}%)`;
    detail.className = topicPct >= 72 ? 'stat-good' : topicPct >= 50 ? 'stat-warn' : 'stat-bad';

    const bar = document.createElement('div');
    bar.className = 'stat-bar';
    const barFill = document.createElement('div');
    barFill.className = 'stat-bar-fill';
    barFill.style.width = `${topicPct}%`;
    barFill.style.backgroundColor = topicPct >= 72 ? '#22c55e' : topicPct >= 50 ? '#f59e0b' : '#ef4444';
    bar.appendChild(barFill);

    div.appendChild(title);
    div.appendChild(detail);
    div.appendChild(bar);
    topicContainer.appendChild(div);
  }

  // Difficulty stats
  const diffContainer = document.getElementById('difficulty-stats');
  diffContainer.innerHTML = '';
  for (const [diff, stats] of Object.entries(analytics.difficultyStats)) {
    const span = document.createElement('span');
    span.className = 'difficulty-badge';
    span.style.borderColor = getDifficultyColor(diff);
    const diffPct = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
    span.textContent = `${diff}: ${stats.correct}/${stats.total} (${diffPct}%)`;
    diffContainer.appendChild(span);
  }

  // Review list
  const reviewContainer = document.getElementById('review-list');
  reviewContainer.innerHTML = '';

  state.filteredQuestions.forEach((q, i) => {
    const correct = isCorrect(q.id);
    const userAnswer = state.answers[q.id] || [];

    const item = document.createElement('details');
    item.className = `review-item ${correct ? 'review-correct' : 'review-incorrect'}`;

    const summary = document.createElement('summary');
    summary.innerHTML = `<span class="review-icon">${correct ? '✅' : '❌'}</span> <span class="review-num">Q${i + 1}</span> `;
    const summaryText = document.createElement('span');
    summaryText.textContent = q.question.length > 80 ? q.question.substring(0, 80) + '…' : q.question;
    summary.appendChild(summaryText);

    const body = document.createElement('div');
    body.className = 'review-body';

    const questionP = document.createElement('p');
    questionP.className = 'review-question';
    questionP.textContent = q.question;
    body.appendChild(questionP);

    const yourAns = document.createElement('p');
    yourAns.innerHTML = `<strong>Your answer:</strong> `;
    const yourAnsText = document.createElement('span');
    yourAnsText.textContent = userAnswer.length > 0 ? userAnswer.join(', ') : 'Not answered';
    yourAnsText.className = correct ? 'text-correct' : 'text-incorrect';
    yourAns.appendChild(yourAnsText);
    body.appendChild(yourAns);

    const correctAns = document.createElement('p');
    correctAns.innerHTML = `<strong>Correct answer:</strong> `;
    const correctText = document.createElement('span');
    correctText.textContent = q.answer.join(', ');
    correctText.className = 'text-correct';
    correctAns.appendChild(correctText);
    body.appendChild(correctAns);

    if (q.explanation) {
      const exp = document.createElement('p');
      exp.className = 'review-explanation';
      exp.textContent = q.explanation;
      body.appendChild(exp);
    }

    item.appendChild(summary);
    item.appendChild(body);
    reviewContainer.appendChild(item);
  });

  // Record spaced repetition data
  if (exam) {
    recordSRResults(exam.id, state.filteredQuestions, state.answers, isCorrect);
  }

  showScreen('results');

  // Fire confetti if passed
  if (passed) {
    setTimeout(() => fireConfetti(), 300);
  }
}

// ─── Export ─────────────────────────────────────────────────────
export function handleExport() {
  const state = getState();
  const csv = generateCSV(state.filteredQuestions, state.answers, state.timePerQuestion);
  const exam = state.currentExam;
  const prefix = exam ? exam.id : 'quiz';
  const date = new Date().toISOString().split('T')[0];
  downloadFile(csv, `${prefix}-results-${date}.csv`, 'text/csv');
}

// ─── Timer Display ─────────────────────────────────────────────
export function setTimerVisibility(visible) {
  const bar = document.getElementById('timer-bar');
  if (bar) bar.classList.toggle('hidden', !visible);
}
