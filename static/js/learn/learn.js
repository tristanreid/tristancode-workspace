/* Learn / puzzle-path client.
 *
 * Phase A: progress is stored in localStorage (per device).
 * Phase B: swap getProgress() / setComplete() to call /api/progress with the
 *          resolved token — nothing else here needs to change.
 */
(function () {
  var LEARN = window.LEARN || {};
  var lessons = (LEARN.lessons || []).slice().sort(function (a, b) { return a.n - b.n; });
  var maxN = lessons.length ? lessons[lessons.length - 1].n : 0;

  // --- token resolution (built now so the Phase B backend is a drop-in) ---
  function resolveToken() {
    var t = null;
    try {
      var params = new URLSearchParams(window.location.search);
      var fromUrl = params.get('u');
      if (fromUrl) {
        localStorage.setItem('learn-token', fromUrl);
        params.delete('u');
        var qs = params.toString();
        history.replaceState(null, '', window.location.pathname + (qs ? '?' + qs : '') + window.location.hash);
        return fromUrl;
      }
      t = localStorage.getItem('learn-token');
      if (!t) { t = 'local'; localStorage.setItem('learn-token', t); }
    } catch (e) { t = 'local'; }
    return t;
  }
  var TOKEN = resolveToken();

  // --- progress backend ---
  // A real token (from a ?u=<token> link) syncs via the API for cross-device
  // resume. Without one ('local'), or if the network fails, we fall back to a
  // localStorage cache so the path still works on a single device / offline.
  var API = '/api/progress';
  var useApi = TOKEN && TOKEN !== 'local';

  function progressKey() { return 'learn-progress:' + TOKEN; }

  function readLocal() {
    try { return parseInt(localStorage.getItem(progressKey()) || '0', 10) || 0; } catch (e) { return 0; }
  }
  function writeLocal(n) {
    try { localStorage.setItem(progressKey(), String(n)); } catch (e) {}
    return n;
  }

  function getProgress() {
    var cached = readLocal();
    if (!useApi) return Promise.resolve(cached);
    return fetch(API + '?token=' + encodeURIComponent(TOKEN), { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        if (d && typeof d.lastCompleted === 'number') {
          // Never lose progress made offline on this device.
          return writeLocal(Math.max(d.lastCompleted, cached));
        }
        return cached;
      })
      .catch(function () { return cached; });
  }

  function setComplete(n) {
    var next = writeLocal(Math.max(readLocal(), n)); // optimistic, instant on this device
    if (!useApi) return Promise.resolve(next);
    return fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: TOKEN, completed: n })
    })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) { return (d && typeof d.lastCompleted === 'number') ? writeLocal(d.lastCompleted) : next; })
      .catch(function () { return next; });
  }

  function lessonByN(n) {
    for (var i = 0; i < lessons.length; i++) { if (lessons[i].n === n) return lessons[i]; }
    return null;
  }

  function learnHomeUrl() {
    if (lessons.length) { return lessons[0].url.replace(/[^\/]*\/?$/, ''); }
    return '/learn/';
  }

  // --- landing page: resume button + archive markers ---
  var resumeLink = document.getElementById('learn-resume-link');
  if (resumeLink) {
    getProgress().then(function (done) {
      var note = document.getElementById('learn-resume-note');
      var current = lessonByN(done + 1);
      if (current) {
        resumeLink.textContent = (done === 0 ? 'Start — Lesson ' : 'Resume — Lesson ') + current.n + ': ' + current.title + ' →';
        resumeLink.href = current.url;
        if (note) {
          note.textContent = done === 0
            ? 'You haven’t started yet. This is where you pick up on any device.'
            : 'You’ve completed ' + done + ' lesson' + (done === 1 ? '' : 's') + '.';
        }
      } else {
        var last = lessonByN(maxN);
        resumeLink.textContent = maxN ? ('You’re all caught up — review Lesson ' + maxN + ' →') : 'No lessons yet';
        resumeLink.href = last ? last.url : '#';
        if (note) note.textContent = 'New lessons are added automatically. Check back soon.';
      }
      var items = document.querySelectorAll('.learn-archive-list li');
      for (var i = 0; i < items.length; i++) {
        var n = parseInt(items[i].getAttribute('data-lesson'), 10);
        if (n <= done) items[i].classList.add('done');
        else if (n === done + 1) items[i].classList.add('current');
      }
    });
  }

  // --- puzzle page: multiple-choice interaction ---
  var answerSection = document.querySelector('.learn-answer');
  var mcq = document.querySelector('.learn-mcq');
  if (mcq && answerSection) {
    var correct = parseInt(mcq.getAttribute('data-correct'), 10);
    var feedback = mcq.querySelector('.learn-mcq-feedback');
    var revealBtn = answerSection.querySelector('.learn-reveal');
    var opts = mcq.querySelectorAll('.learn-mcq-opt');
    for (var k = 0; k < opts.length; k++) {
      opts[k].addEventListener('click', function () {
        var idx = parseInt(this.getAttribute('data-index'), 10);
        for (var j = 0; j < opts.length; j++) { opts[j].classList.remove('selected'); }
        this.classList.add('selected');
        if (idx === correct) {
          this.classList.add('correct');
          if (feedback) { feedback.textContent = 'Correct. Read the full explanation on the solution page.'; feedback.hidden = false; }
          if (revealBtn) revealBtn.classList.add('show');
        } else {
          this.classList.remove('correct');
          this.classList.add('incorrect');
          if (feedback) { feedback.textContent = 'Not quite — reason it through and try another option.'; feedback.hidden = false; }
        }
      });
    }
  }

  // --- solution page: mark complete and advance ---
  var markBtn = document.querySelector('.learn-mark-complete');
  if (markBtn) {
    markBtn.addEventListener('click', function () {
      var n = parseInt(markBtn.getAttribute('data-lesson'), 10);
      markBtn.disabled = true;
      markBtn.textContent = 'Saved ✓';
      setComplete(n).then(function () {
        var next = lessonByN(n + 1);
        window.location.href = next ? next.url : learnHomeUrl();
      });
    });
  }
})();
