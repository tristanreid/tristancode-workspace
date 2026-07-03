// Synced from daily-learning-puzzles — edit there, then run scripts/sync-web.sh.
/* Learn / puzzle-path client.
 *
 * Multi-track: every lesson belongs to a track (fp, bayes, …). Progress —
 * both the localStorage cache and the /api/progress record — is kept per
 * track. Older single-track localStorage keys are read as the fp track.
 */
(function () {
  var LEARN = window.LEARN || {};
  var DEFAULT_TRACK = 'fp';

  // lessons: [{n, title, url, track, solution}] — group per track, sorted by n.
  var byTrack = {};
  (LEARN.lessons || []).forEach(function (l) {
    var t = l.track || DEFAULT_TRACK;
    (byTrack[t] = byTrack[t] || []).push(l);
  });
  Object.keys(byTrack).forEach(function (t) {
    byTrack[t].sort(function (a, b) { return a.n - b.n; });
  });

  function trackLessons(track) { return byTrack[track] || []; }
  function maxN(track) {
    var ls = trackLessons(track);
    return ls.length ? ls[ls.length - 1].n : 0;
  }
  function lessonByN(track, n) {
    var ls = trackLessons(track);
    for (var i = 0; i < ls.length; i++) { if (ls[i].n === n) return ls[i]; }
    return null;
  }

  // --- token resolution ---
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

  function progressKey(track) { return 'learn-progress:' + TOKEN + ':' + track; }
  // Pre-multi-track key — progress stored before tracks existed belongs to fp.
  function legacyKey() { return 'learn-progress:' + TOKEN; }

  function readLocal(track) {
    try {
      var v = localStorage.getItem(progressKey(track));
      if (v === null && track === DEFAULT_TRACK) v = localStorage.getItem(legacyKey());
      return parseInt(v || '0', 10) || 0;
    } catch (e) { return 0; }
  }
  function writeLocal(track, n) {
    try { localStorage.setItem(progressKey(track), String(n)); } catch (e) {}
    return n;
  }

  function getProgress(track) {
    var cached = readLocal(track);
    if (!useApi) return Promise.resolve(cached);
    return fetch(API + '?token=' + encodeURIComponent(TOKEN) + '&track=' + encodeURIComponent(track), { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        if (d && typeof d.lastCompleted === 'number') {
          // Never lose progress made offline on this device.
          return writeLocal(track, Math.max(d.lastCompleted, cached));
        }
        return cached;
      })
      .catch(function () { return cached; });
  }

  function setComplete(track, n) {
    var next = writeLocal(track, Math.max(readLocal(track), n)); // optimistic, instant on this device
    if (!useApi) return Promise.resolve(next);
    return fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: TOKEN, track: track, completed: n })
    })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) { return (d && typeof d.lastCompleted === 'number') ? writeLocal(track, d.lastCompleted) : next; })
      .catch(function () { return next; });
  }

  // Explicit override (the "Start from this lesson" button): set the pointer
  // to exactly `n` — may move it down, unlike setComplete's high-water advance.
  function setPosition(track, n) {
    var v = writeLocal(track, Math.max(0, n));
    if (!useApi) return Promise.resolve(v);
    return fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: TOKEN, track: track, set: v })
    })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) { return (d && typeof d.lastCompleted === 'number') ? writeLocal(track, d.lastCompleted) : v; })
      .catch(function () { return v; });
  }

  // --- outcome logging -----------------------------------------------------
  // Fire-and-forget: each answer interaction posts a small event record that
  // the weekly generator reads to adapt difficulty (see PROPOSAL.md Part 4).
  // Without a sync token there is no server record to append to, so we skip.
  function logEvent(track, evt) {
    if (!useApi) return;
    try {
      fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: TOKEN, track: track, event: evt })
      }).catch(function () {});
    } catch (e) {}
  }

  function pageArticle() {
    return document.querySelector('article.learn-puzzle, article.learn-solution');
  }
  function pageLesson() {
    var el = pageArticle();
    return el ? parseInt(el.getAttribute('data-lesson'), 10) : 0;
  }
  function pageTrack() {
    var el = pageArticle();
    return (el && el.getAttribute('data-track')) || DEFAULT_TRACK;
  }

  function learnHomeUrl() {
    return LEARN.home || '/learn/';
  }

  // --- landing page: per-track resume cards, archive markers, sync bookmark ---
  var trackCards = document.querySelectorAll('[data-learn-track]');
  var syncEl = document.getElementById('learn-sync');

  function renderCard(card) {
    var track = card.getAttribute('data-learn-track');
    var link = card.querySelector('.learn-resume-link');
    var note = card.querySelector('.learn-resume-note');
    if (!link) return;
    getProgress(track).then(function (done) {
      var current = lessonByN(track, done + 1);
      var total = trackLessons(track).length;
      if (current) {
        link.textContent = (done === 0 ? 'Start — Lesson ' : 'Resume — Lesson ') + current.n + ': ' + current.title + ' →';
        link.href = current.url;
        if (note) {
          note.textContent = done === 0
            ? 'You haven’t started this track yet.'
            : 'You’ve completed ' + done + ' of ' + total + ' lessons.';
        }
      } else {
        var last = lessonByN(track, maxN(track));
        link.textContent = last ? ('You’re all caught up — review Lesson ' + last.n + ' →') : 'No lessons yet';
        link.href = last ? last.url : '#';
        if (note) note.textContent = 'New lessons are added automatically. Check back soon.';
      }
      var items = document.querySelectorAll('.learn-archive-list li[data-track="' + track + '"]');
      for (var i = 0; i < items.length; i++) {
        var n = parseInt(items[i].getAttribute('data-lesson'), 10);
        items[i].classList.remove('done', 'current');
        if (n <= done) items[i].classList.add('done');
        else if (n === done + 1) items[i].classList.add('current');
      }
    });
  }

  function renderResume() {
    for (var i = 0; i < trackCards.length; i++) renderCard(trackCards[i]);
  }

  // --- sync bookmark: a login-free way to carry progress across devices ---
  function originLearnBase() { return window.location.origin + learnHomeUrl(); }

  function genToken() {
    var bytes = new Uint8Array(16);
    if (window.crypto && window.crypto.getRandomValues) {
      window.crypto.getRandomValues(bytes);
    } else {
      for (var i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
    }
    var s = '';
    for (var j = 0; j < bytes.length; j++) s += String.fromCharCode(bytes[j]);
    return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  function renderSync() {
    if (!syncEl) return;
    syncEl.hidden = false;
    if (useApi) {
      var url = originLearnBase() + '?u=' + encodeURIComponent(TOKEN);
      syncEl.innerHTML =
        '<h2>Your sync bookmark</h2>' +
        '<p>Open this link on your phone, tablet, or any other computer, and bookmark it there. Your place in the path stays in sync across every device that uses it — no account, no login.</p>' +
        '<div class="learn-sync-url"><input type="text" id="learn-sync-input" readonly></div>' +
        '<button type="button" class="learn-btn" id="learn-sync-copy">Copy link</button>' +
        '<p class="learn-sync-note">Treat this like a private bookmark — anyone who has the link can see and change your progress. Misplaced it? Just make a new one; your progress on this device is saved here regardless.</p>';
      var input = document.getElementById('learn-sync-input');
      input.value = url;
      var copyBtn = document.getElementById('learn-sync-copy');
      copyBtn.addEventListener('click', function () {
        input.focus();
        input.select();
        var done = function () { copyBtn.textContent = 'Copied!'; setTimeout(function () { copyBtn.textContent = 'Copy link'; }, 2000); };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(input.value).then(done, function () { try { document.execCommand('copy'); done(); } catch (e) {} });
        } else { try { document.execCommand('copy'); done(); } catch (e) {} }
      });
    } else {
      syncEl.innerHTML =
        '<h2>Sync across your devices</h2>' +
        '<p>Right now your progress lives only in this browser. Create a private bookmark link and your place will follow you to your phone, tablet, and other computers — no account or login needed.</p>' +
        '<button type="button" class="learn-btn" id="learn-sync-create">Create a sync bookmark</button>';
      document.getElementById('learn-sync-create').addEventListener('click', createSyncBookmark);
    }
  }

  function createSyncBookmark() {
    // Progress made so far under the current (anonymous) token, per track.
    var carried = {};
    Object.keys(byTrack).forEach(function (t) { carried[t] = readLocal(t); });
    var newToken = genToken();
    try { localStorage.setItem('learn-token', newToken); } catch (e) {}
    TOKEN = newToken;
    useApi = true;
    Object.keys(carried).forEach(function (t) {
      writeLocal(t, carried[t]);                    // copy under the new token's key
      if (carried[t] > 0) setComplete(t, carried[t]); // seed the server so other devices see it
    });
    renderSync();
    renderResume();
  }

  if (trackCards.length || syncEl) {
    renderResume();
    renderSync();
  }

  // --- "Start from this lesson": move the resume pointer here (up or down) ---
  var setCurrentBtn = document.querySelector('.learn-set-current');
  if (setCurrentBtn) {
    setCurrentBtn.addEventListener('click', function () {
      var n = parseInt(setCurrentBtn.getAttribute('data-lesson'), 10);
      var track = setCurrentBtn.getAttribute('data-track') || DEFAULT_TRACK;
      setCurrentBtn.disabled = true;
      setPosition(track, n - 1).then(function () { // n-1 completed → lesson n becomes current
        setCurrentBtn.textContent = '✓ This is now your current lesson';
      });
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
    var mcqAttempts = 0;
    var mcqLogged = false;
    for (var k = 0; k < opts.length; k++) {
      opts[k].addEventListener('click', function () {
        var idx = parseInt(this.getAttribute('data-index'), 10);
        for (var j = 0; j < opts.length; j++) { opts[j].classList.remove('selected'); }
        this.classList.add('selected');
        if (!mcqLogged) mcqAttempts++;
        if (idx === correct) {
          this.classList.add('correct');
          if (feedback) { feedback.textContent = 'Correct. Read the full explanation on the solution page.'; feedback.hidden = false; }
          if (revealBtn) revealBtn.classList.add('show');
          if (!mcqLogged) {
            mcqLogged = true;
            logEvent(pageTrack(), { n: pageLesson(), kind: 'mcq', attempts: mcqAttempts, firstTry: mcqAttempts === 1 });
          }
        } else {
          this.classList.remove('correct');
          this.classList.add('incorrect');
          if (feedback) { feedback.textContent = 'Not quite — reason it through and try another option.'; feedback.hidden = false; }
        }
      });
    }
  }

  // --- puzzle page: numeric answer (tolerance-checked) ---
  var numeric = document.querySelector('.learn-numeric');
  if (numeric && answerSection) {
    var nAnswer = parseFloat(numeric.getAttribute('data-answer'));
    var nTol = parseFloat(numeric.getAttribute('data-tolerance')) || 0;
    var nInput = numeric.querySelector('.learn-numeric-input');
    var nCheck = numeric.querySelector('.learn-numeric-check');
    var nFeedback = numeric.querySelector('.learn-numeric-feedback');
    var nReveal = answerSection.querySelector('.learn-reveal');
    var nAttempts = 0;
    var nDone = false;
    var nUnlocked = false;

    function numericFeedback(msg, cls) {
      if (!nFeedback) return;
      nFeedback.textContent = msg;
      nFeedback.classList.remove('correct', 'incorrect');
      if (cls) nFeedback.classList.add(cls);
      nFeedback.hidden = false;
    }

    function checkNumeric() {
      if (nDone) return;
      var v = parseFloat(nInput.value.replace(/,/g, '').trim());
      if (isNaN(v)) { numericFeedback('Enter a number first.', null); return; }
      nAttempts++;
      if (Math.abs(v - nAnswer) <= nTol) {
        nDone = true;
        numeric.classList.add('done');
        numericFeedback('Correct. Read the full explanation on the solution page.', 'correct');
        if (nReveal) nReveal.classList.add('show');
        logEvent(pageTrack(), { n: pageLesson(), kind: 'numeric', attempts: nAttempts, correct: true });
      } else if (nAttempts >= 3 && !nUnlocked) {
        // Numeric answers can't be brute-forced like mcq — after three honest
        // misses, unlock the solution rather than leaving the reader stuck.
        nUnlocked = true;
        numericFeedback('Not quite. The solution is unlocked below — or keep trying.', 'incorrect');
        if (nReveal) nReveal.classList.add('show');
        logEvent(pageTrack(), { n: pageLesson(), kind: 'numeric', attempts: nAttempts, correct: false });
      } else {
        numericFeedback('Not quite — check your reasoning and try again.', 'incorrect');
      }
    }

    if (nCheck) nCheck.addEventListener('click', checkNumeric);
    if (nInput) nInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); checkNumeric(); }
    });
  }

  // --- puzzle page: estimate (calibration) answer ---
  var est = document.querySelector('.learn-estimate');
  if (est && answerSection) {
    var truth = parseFloat(est.getAttribute('data-answer'));
    var eLow = est.querySelector('.learn-est-low');
    var ePoint = est.querySelector('.learn-est-point');
    var eHigh = est.querySelector('.learn-est-high');
    var eLock = est.querySelector('.learn-estimate-lock');
    var eFeedback = est.querySelector('.learn-estimate-feedback');
    var eReveal = answerSection.querySelector('.learn-reveal');

    function estFeedback(msg, cls) {
      if (!eFeedback) return;
      eFeedback.textContent = msg;
      eFeedback.classList.remove('hit', 'miss');
      if (cls) eFeedback.classList.add(cls);
      eFeedback.hidden = false;
    }

    if (eLock) eLock.addEventListener('click', function () {
      var low = parseFloat(eLow.value.replace(/,/g, '').trim());
      var point = parseFloat(ePoint.value.replace(/,/g, '').trim());
      var high = parseFloat(eHigh.value.replace(/,/g, '').trim());
      if (isNaN(low) || isNaN(point) || isNaN(high)) { estFeedback('Fill in all three numbers first.', null); return; }
      if (!(low <= point && point <= high)) { estFeedback('Your interval should satisfy low ≤ best guess ≤ high.', null); return; }
      var hit = truth >= low && truth <= high;
      est.classList.add('done');
      eLock.disabled = true;
      eLow.disabled = true; ePoint.disabled = true; eHigh.disabled = true;
      estFeedback(
        'True value: ' + truth + '. Your 90% interval [' + low + ', ' + high + '] ' +
        (hit ? 'caught it ✓' : 'missed it — worth noticing whether your intervals run too narrow') +
        '. The solution explains how to get there.',
        hit ? 'hit' : 'miss'
      );
      if (eReveal) eReveal.classList.add('show');
      logEvent(pageTrack(), { n: pageLesson(), kind: 'estimate', point: point, low: low, high: high, truth: truth, hit: hit });
    });
  }

  // --- solution page: rate difficulty, mark complete, advance ---
  // Any rating marks the lesson complete; the rating itself steers the weekly
  // generator (spaced review for "hard"/"fail", faster pacing for "easy").
  var rateGroup = document.querySelector('.learn-rate-group');
  if (rateGroup) {
    var rateBtns = rateGroup.querySelectorAll('.learn-rate');
    var rateNote = document.querySelector('.learn-complete-note');
    for (var r = 0; r < rateBtns.length; r++) {
      rateBtns[r].addEventListener('click', function () {
        var n = parseInt(this.getAttribute('data-lesson'), 10);
        var track = this.getAttribute('data-track') || DEFAULT_TRACK;
        var rating = this.getAttribute('data-rating');
        for (var q = 0; q < rateBtns.length; q++) { rateBtns[q].disabled = true; }
        this.classList.add('chosen');
        if (rateNote) { rateNote.textContent = 'Saved ✓ — on to the next lesson…'; rateNote.hidden = false; }
        logEvent(track, { n: n, kind: 'rating', rating: rating });
        setComplete(track, n).then(function () {
          var next = lessonByN(track, n + 1);
          window.location.href = next ? next.url : learnHomeUrl();
        });
      });
    }
  }
})();
