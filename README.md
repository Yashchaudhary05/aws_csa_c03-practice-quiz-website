# ☁️ AWS SAA-C03 Practice Quiz

A modern, accessible, and feature-rich practice quiz web application for the **AWS Certified Solutions Architect – Associate (SAA-C03)** exam.

**[Live Demo →](https://yashchaudhary05.github.io/aws_csa_c03-practice-quiz-website/)**

---

## Features

### Quiz Modes
- **📝 Exam Mode** — Timed (60 min), results shown at the end, simulates real exam conditions
- **📖 Practice Mode** — Untimed, instant feedback with explanations after each answer
- **🔍 Review Mode** — Browse all questions with correct answers and explanations

### Core Functionality
- **65 AWS questions** covering S3, EC2, VPC, IAM, RDS, CloudFront, Route 53, ECS, Lambda, DynamoDB, Security, Analytics, and more
- **Multi-select support** — Questions requiring multiple answers use checkboxes with validation
- **Question randomization** — Shuffled questions and options on every attempt
- **Topic filtering** — Select specific AWS service areas to focus on
- **Question navigator** — Visual grid showing answered, unanswered, and flagged questions
- **Flag/bookmark** — Mark questions for later review during the quiz
- **Timer with warnings** — MM:SS display with color changes at 5min and 1min remaining
- **Progress persistence** — Quiz state saved to localStorage; resume after refresh
- **CSV export** — Download quiz results as a CSV file

### User Experience
- **Dark/Light theme** — Toggle with button or `T` key; preference persisted
- **Keyboard shortcuts** — `Enter` submit, `←`/`→` navigate, `F` flag, `1-5` select options
- **Smooth animations** — Fade-in cards, progress transitions, score ring animation
- **Mobile responsive** — Optimized layout for phones, tablets, and desktops
- **Skip navigation link** — Accessibility feature for keyboard/screen reader users

### Performance Analytics
- **Score visualization** — Animated SVG ring chart with percentage
- **Topic breakdown** — Per-topic accuracy with color-coded progress bars
- **Difficulty analysis** — Performance split by easy/medium/hard questions
- **Time tracking** — Total time and average time per question
- **Detailed review** — Expandable list of all questions with explanations

### Technical Quality
- **Semantic HTML5** — `<main>`, `<section>`, `<article>`, `<nav>`, `<fieldset>`, `<legend>`
- **ARIA attributes** — `role`, `aria-label`, `aria-live`, `aria-valuenow` throughout
- **Content Security Policy** — CSP meta tag restricting script/style sources
- **XSS prevention** — All user-facing content rendered via `textContent`, not `innerHTML`
- **ES Modules** — Clean separation into state, quiz logic, timer, UI, and utilities
- **PWA support** — Web app manifest and service worker for offline capability
- **Reduced motion** — Respects `prefers-reduced-motion` media query
- **Print styles** — Clean printable output hiding navigation controls

---

## Project Structure

```
├── index.html          # Semantic HTML with ARIA attributes
├── styles.css          # CSS custom properties, dark/light themes, responsive
├── questions.json      # Question bank with explanations, topics, difficulty
├── js/
│   ├── app.js          # Main entry point, initialization, event binding
│   ├── state.js        # Centralized state management with localStorage
│   ├── quiz.js         # Quiz logic, scoring, analytics
│   ├── timer.js        # Countdown timer with visual warnings
│   ├── ui.js           # All DOM rendering and screen management
│   └── utils.js        # Shuffle, formatting, CSV export, helpers
├── sw.js               # Service worker for offline caching
├── manifest.json       # PWA manifest
├── .github/
│   └── workflows/
│       └── deploy.yml  # GitHub Actions CI/CD pipeline
└── README.md
```

---

## Getting Started

### Run Locally
No build tools needed — just serve the files:

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve .

# Using VS Code
# Install "Live Server" extension → Right-click index.html → Open with Live Server
```

Then open `http://localhost:8000` in your browser.

### Deploy
The app is deployed automatically to GitHub Pages via GitHub Actions on every push to `main`.

---

## Adding Questions

Edit `questions.json` following this schema:

```json
{
  "id": 21,
  "question": "Your question text here?",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "answer": ["Option B"],
  "multiSelect": false,
  "topic": "S3",
  "difficulty": "medium",
  "explanation": "Explanation of why Option B is correct."
}
```

For multi-select questions, set `multiSelect: true`, add `selectCount`, and include multiple answers:

```json
{
  "id": 22,
  "question": "Choose 2 answers...",
  "options": ["A", "B", "C", "D"],
  "answer": ["A", "C"],
  "multiSelect": true,
  "selectCount": 2,
  "topic": "Security",
  "difficulty": "hard",
  "explanation": "A and C are correct because..."
}
```

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Enter` | Submit answer / Next / Finish |
| `→` | Next question (after answering) |
| `←` | Previous question |
| `1`–`5` | Select option by number |
| `F` | Flag question for review |
| `T` | Toggle dark/light theme |

---

## Technologies

- **HTML5** — Semantic markup with ARIA accessibility
- **CSS3** — Custom properties, Grid, Flexbox, transitions, `@media` queries
- **Vanilla JavaScript** — ES Modules, `fetch` API, `localStorage`, Service Worker
- **GitHub Actions** — Automated deployment to GitHub Pages

---

## License

MIT

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-questions`)
3. Add your changes
4. Push and open a Pull Request
