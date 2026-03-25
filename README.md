# ☁️ CloudQuiz — Certification Practice

A modern, accessible, and feature-rich practice quiz web application for professional certification exams.

### Supported Exams
- **☁️ AWS Solutions Architect Associate (SAA-C03)** — 120 questions · 65 min · 72% passing
- **🌐 Cisco CCNA (200-301)** — 120 questions · 120 min · 80% passing
- **🤖 Salesforce AI Specialist** — 120 questions · 90 min · 73% passing

**[Live Demo →](https://yashchaudhary05.github.io/aws_csa_c03-practice-quiz-website/)**

---

## Features

### Quiz Modes
- **📝 Exam Mode** — Timed, results shown at the end, simulates real exam conditions
- **📖 Practice Mode** — Untimed, instant feedback with explanations after each answer
- **🔍 Review Mode** — Browse all questions with correct answers and explanations

### Core Functionality
- **Multi-exam architecture** — Choose from 3 certification exams with dedicated question banks
- **120 questions per exam** — Extensive coverage of each exam's domains
- **Configurable quiz length** — Pick 15, 30, 65, or all 120 questions per session
- **Spaced repetition** — Tracks weak areas across sessions and prioritizes missed questions
- **Multi-select support** — Questions requiring multiple answers use checkboxes with validation
- **Question randomization** — Shuffled questions and options on every attempt
- **Topic filtering** — Select specific service/domain areas to focus on
- **Question navigator** — Visual grid showing answered, unanswered, and flagged questions
- **Flag/bookmark** — Mark questions for later review during the quiz
- **Timer with warnings** — MM:SS display with color changes at 5min and 1min remaining
- **Progress persistence** — Quiz state saved to localStorage; resume after refresh
- **CSV export** — Download quiz results as a CSV file

### User Experience
- **Dark/Light theme** — Toggle with button or `T` key; preference persisted
- **Keyboard shortcuts** — `Enter` submit, `←`/`→` navigate, `F` flag, `1-5` select options
- **Toast notifications** — Non-blocking feedback messages for errors and warnings
- **Confetti animation** — Celebration animation when you pass the exam
- **Glassmorphism UI** — Premium glass-effect design with gradient accents
- **Skeleton loading** — Shimmer placeholders while content loads
- **Exam card tilt** — 3D hover micro-interactions on exam cards
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
- **ARIA attributes** — `role`, `aria-label`, `aria-live`, `aria-current`, `aria-valuenow`
- **Focus management** — Automatic focus on screen transitions for accessibility
- **XSS prevention** — All user-facing content rendered via `textContent`, not `innerHTML`
- **ES Modules** — Clean separation into state, quiz logic, timer, UI, and utilities
- **PWA support** — Web app manifest and service worker for offline capability
- **Reduced motion** — Respects `prefers-reduced-motion` media query
- **CI/CD** — GitHub Actions with JSON validation and duplicate question ID detection
- **Print styles** — Clean printable output hiding navigation controls

---

## Project Structure

```
├── index.html                    # Semantic HTML with ARIA attributes
├── styles.css                    # Glassmorphism design system, dark/light themes
├── exams.json                    # Exam manifest (titles, config, question file paths)
├── questions.json                # AWS SAA-C03 question bank (120 questions)
├── questions/
│   ├── ccna-200-301.json         # Cisco CCNA question bank (120 questions)
│   └── salesforce-ai-specialist.json  # Salesforce AI question bank (120 questions)
├── js/
│   ├── app.js                    # Main entry point, initialization, event binding
│   ├── state.js                  # Centralized state management with localStorage
│   ├── quiz.js                   # Quiz logic, scoring, analytics
│   ├── timer.js                  # Countdown timer with visual warnings
│   ├── ui.js                     # All DOM rendering and screen management
│   ├── utils.js                  # Shuffle, formatting, CSV export, helpers
│   ├── toast.js                  # Toast notification system
│   ├── confetti.js               # Confetti celebration animation
│   └── spaced-repetition.js      # Weak area tracking and prioritization
├── sw.js                         # Service worker for offline caching
├── manifest.json                 # PWA manifest
├── .github/
│   └── workflows/
│       └── deploy.yml            # CI/CD with JSON validation & dedup checks
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
