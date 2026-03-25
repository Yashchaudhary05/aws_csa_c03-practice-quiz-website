const CACHE_NAME = 'cloudquiz-v3';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './js/app.js',
  './js/state.js',
  './js/quiz.js',
  './js/timer.js',
  './js/ui.js',
  './js/utils.js',
  './exams.json',
  './questions.json',
  './questions/ccna-200-301.json',
  './questions/salesforce-ai-specialist.json',
  './manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetched = fetch(event.request).then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => cached);
      return cached || fetched;
    })
  );
});
