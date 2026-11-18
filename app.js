(() => {
  'use strict';
  const D = window.KATA_DATA;
  const $app = document.getElementById('app');
  const $tabs = document.getElementById('tabs');
  const KEY = 'kata-coach-wado-v1';

  const DIRS = { N: 0, NE: 45, E: 90, SE: 135, S: 180, SW: 225, W: 270, NW: 315 };
  const DIR_LABEL = { N: 'Front', NE: 'Front-right', E: 'Right', SE: 'Back-right', S: 'Back', SW: 'Back-left', W: 'Left', NW: 'Front-left' };
  const STATUS = [['new', 'Not started'], ['learning', 'Learning'], ['known', 'Know the moves'], ['ready', 'Grading ready']];
  const STATUS_LABEL = Object.fromEntries(STATUS);
  const defaults = { grade: '9', date: '', kata: {}, custom: {}, voice: true, count: 'ja', tempo: 3 };

  /* ---------- state ---------- */
  let S = load();
  function load() {
    const base = JSON.parse(JSON.stringify(defaults));
    try { return Object.assign(base, JSON.parse(localStorage.getItem(KEY) || 'null') || {}); }
    catch (e) { return base; }
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* storage unavailable */ } }

  /* ---------- helpers ---------- */
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const kata = (id) => D.kata.find((k) => k.id === id);
  const grade = (id) => D.grades.find((g) => g.id === id) || D.grades[0];
  const stepsOf = (id) => S.custom[id] || kata(id)?.steps || null;
  const ks = (id) => (S.kata[id] ||= { status: 'new', practices: 0, last: null, best: null });
  const today = () => new Date().toISOString().slice(0, 10);
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const kiaiOf = (steps) => steps ? steps.map((s, i) => (s.k ? i + 1 : 0)).filter(Boolean) : [];

  const JA_U = ['', 'ichi', 'ni', 'san', 'shi', 'go', 'roku', 'shichi', 'hachi', 'ku'];
  const KANA_U = ['', 'いち', 'に', 'さん', 'し', 'ご', 'ろく', 'しち', 'はち', 'く'];
  function count(n, kana) {
    const U = kana ? KANA_U : JA_U, ten = kana ? 'じゅう' : 'ju', sep = kana ? '' : '-';
    if (n < 10) return U[n];
    const t = Math.floor(n / 10), u = n % 10;
    return [t > 1 ? U[t] : '', ten, u ? U[u] : ''].filter(Boolean).join(sep);
  }

  function daysUntil(iso) {
    if (!iso) return null;
    const [y, mo, d] = iso.split('-').map(Number);
    const t = new Date(); t.setHours(0, 0, 0, 0);
    return Math.round((new Date(y, mo - 1, d) - t) / 864e5);
  }
  function fmtDate(iso) {
    if (!iso) return '';
    const [y, mo, d] = iso.split('-').map(Number);
    return new Date(y, mo - 1, d).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
  }

  const ICON = {
    gear: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/></svg>',
    back: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>',
    close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    prev: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>',
    next: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>',
    play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path class="fill" d="M8 5v14l11-7z"/></svg>',
    pause: '<svg viewBox="0 0 24 24" aria-hidden="true"><path class="fill" d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg>',
  };

  function belt(g, big) {
    const stripes = Array.from({ length: g.stripes || 0 }, () => '<i></i>').join('');
    return `<span class="belt${big ? ' big' : ''}" style="--belt:${esc(g.belt)}" aria-hidden="true">${stripes}</span>`;
  }

  function kataRow(id) {
    const k = kata(id), st = ks(id), steps = stepsOf(id);
    const meta = [steps ? `${steps.length} moves` : 'Steps not added', st.practices ? `practised ${st.practices}×` : null].filter(Boolean).join(' · ');
    return `<li><a class="krow" href="#k-${id}">
      <span class="kanji" lang="ja">${esc(k.kanji)}</span>
      <span class="kmeta"><b>${esc(k.name)}</b><small>${esc(meta)}</small></span>
      <span class="pill s-${st.status}">${STATUS_LABEL[st.status]}</span></a></li>`;
  }

  /* ---------- views ---------- */
  function viewHome() {
    const g = grade(S.grade);
    const gi = D.grades.indexOf(g);
    const req = g.kata || [];
    const choice = g.choice || [];
    const earlier = [...new Set(D.grades.slice(0, gi).flatMap((x) => x.kata || []))].filter((id) => !req.includes(id) && !choice.includes(id));
    const days = daysUntil(S.date);
    const targets = req.length ? req : choice;
    const readyN = req.length ? req.filter((id) => ks(id).status === 'ready').length : (choice.some((id) => ks(id).status === 'ready') ? 1 : 0);
    const total = req.length || (choice.length ? 1 : 0);
    const pct = total ? Math.round((readyN / total) * 100) : 0;

    let when;
    if (days == null) when = `<a class="link" href="#settings">Set your grading date</a>`;
    else if (days > 1) when = `<span class="big-num">${days}</span><span>days to go<br><small>${esc(fmtDate(S.date))}</small></span>`;
    else if (days === 1) when = `<span class="big-num">1</span><span>day to go<br><small>Tomorrow</small></span>`;
    else if (days === 0) when = `<span class="today">Grading day. Good luck.</span>`;
    else when = `<span class="today">Grading done? <a class="link" href="#settings">Set your next one</a></span>`;

    const focus = targets.find((id) => stepsOf(id) && ks(id).status !== 'ready');

    return `
      <header class="top">
        <div class="brand"><span class="mark" lang="ja">和</span><div><h1>Kata Coach</h1><p class="sub">${esc(D.style)} grading practice</p></div></div>
        <a class="icon-btn" href="#settings" aria-label="Settings">${ICON.gear}</a>
      </header>

      <section class="grading">
        <div class="g-row">
          <div><span class="eyebrow">Next grading</span><h2>${belt(g, true)}${esc(g.name)}</h2></div>
          <div class="when">${when}</div>
        </div>
        <div class="meter" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><span style="width:${pct}%"></span></div>
        <p class="meter-label">${readyN} of ${total} grading kata marked ready</p>
        ${focus ? `<a class="btn primary wide" href="#p-${focus}">Practise ${esc(kata(focus).name)}</a>` : ''}
      </section>

      ${req.length ? `<h3 class="sec">Kata for this grading</h3><ul class="klist">${req.map(kataRow).join('')}</ul>` : ''}
      ${choice.length ? `<h3 class="sec">Choose one to present</h3><ul class="klist">${choice.map(kataRow).join('')}</ul>` : ''}
      ${earlier.length ? `<h3 class="sec">Keep revising</h3><p class="hint">Examiners can ask for any kata from earlier grades.</p><ul class="klist">${earlier.map(kataRow).join('')}</ul>` : ''}
    `;
  }

  function viewKataList() {
    const seen = new Set();
    const groups = D.grades.map((g) => {
      const ids = [...(g.kata || []), ...(g.choice || [])].filter((id) => !seen.has(id));
      ids.forEach((id) => seen.add(id));
      if (!ids.length) return '';
      return `<h3 class="sec grade-head">${belt(g)}${esc(g.name)}</h3><ul class="klist">${ids.map(kataRow).join('')}</ul>`;
    }).join('');
    return `<header class="top"><h1 class="page-title">All kata</h1></header>
      <p class="hint">${esc(D.note)}</p>${groups}`;
  }

  function viewKata(id) {
    const k = kata(id);
    if (!k) return viewHome();
    const st = ks(id), steps = stepsOf(id), kiai = kiaiOf(steps), custom = !!S.custom[id];
    const g = D.grades.find((x) => (x.kata || []).includes(id) || (x.choice || []).includes(id));
    const source = custom ? 'Your version' : steps ? (k.draft ? 'Built-in draft' : 'Built-in') : 'Not added';

    const stepsHtml = steps ? `<ol class="steps">${steps.map((s, i) => `
        <li class="${s.k ? 'is-kiai' : ''}">
          <span class="n">${i + 1}</span>
          <span class="dir" title="Facing ${DIR_LABEL[s.d]}">${arrow(s.d)}</span>
          <span class="body"><b>${esc(s.te || s.t)}</b><small>${esc(s.se || s.s)}${s.k ? ' · <em>Kiai</em>' : ''}</small></span>
        </li>`).join('')}</ol>`
      : `<div class="empty"><p><b>No step-by-step yet.</b> Wado associations teach this kata with small differences, so add the version your club uses. You can type it in move by move.</p><a class="btn" href="#e-${id}">Add steps</a></div>`;

    return `
      <header class="top"><a class="icon-btn" href="#kata" aria-label="All kata">${ICON.back}</a><span></span></header>
      <section class="khero">
        <span class="kanji-xl" lang="ja">${esc(k.kanji)}</span>
        <h1>${esc(k.name)}</h1>
        <p class="meaning">${esc(k.meaning)}</p>
        <dl class="stats">
          <div><dt>Moves</dt><dd>${steps ? steps.length : '–'}</dd></div>
          <div><dt>Kiai</dt><dd>${kiai.length ? kiai.join(' & ') : '–'}</dd></div>
          <div><dt>Embusen</dt><dd>${esc(k.embusen)}</dd></div>
          <div><dt>Graded at</dt><dd>${g ? esc(g.name) : '–'}</dd></div>
        </dl>
      </section>

      <div class="actions">
        <a class="btn primary ${steps ? '' : 'disabled'}" ${steps ? `href="#p-${id}"` : 'aria-disabled="true"'}>Practise</a>
        <a class="btn ${steps && steps.length > 3 ? '' : 'disabled'}" ${steps && steps.length > 3 ? `href="#q-${id}"` : 'aria-disabled="true"'}>Quiz${st.best != null ? ` <small>best ${st.best}%</small>` : ''}</a>
      </div>

      <h3 class="sec">How well do you know it?</h3>
      <div class="seg" role="radiogroup" aria-label="Progress">
        ${STATUS.map(([v, l]) => `<button type="button" role="radio" aria-checked="${st.status === v}" data-action="status" data-id="${id}" data-v="${v}" class="s-${v}">${l}</button>`).join('')}
      </div>
      <p class="hint">${st.practices ? `Practised ${st.practices} time${st.practices > 1 ? 's' : ''}${st.last ? `, last on ${esc(fmtDate(st.last))}` : ''}.` : 'Not practised yet.'}</p>

      <h3 class="sec">Key points</h3>
      <ul class="points">${k.points.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>

      <div class="sec-row"><h3 class="sec">Moves</h3><span class="source">${source}</span>${steps ? `<a class="link" href="#e-${id}">Edit steps</a>` : ''}</div>
      ${k.draft && !custom && steps ? `<p class="hint warn">This sequence is a starting point. Wado groups differ in details, so check it with your instructor and edit anything that doesn't match.</p>` : ''}
      ${stepsHtml}
    `;
  }

  function arrow(d) {
    return `<svg viewBox="-12 -12 24 24" aria-hidden="true"><g transform="rotate(${DIRS[d] ?? 0})"><path d="M0 -9 L6 0 L2 0 L2 9 L-2 9 L-2 0 L-6 0 Z"/></g></svg>`;
  }

  function compass() {
    const ticks = [0, 45, 90, 135, 180, 225, 270, 315].map((t) => `<line x1="0" y1="-50" x2="0" y2="${t % 90 ? -45 : -41}" transform="rotate(${t})"/>`).join('');
    return `<svg class="compass" viewBox="-64 -72 128 136" role="img" aria-label="Facing direction">
      <text class="c-front" x="0" y="-58" text-anchor="middle">FRONT</text>
      <circle class="c-ring" r="50"/><g class="c-ticks">${ticks}</g>
      <g class="c-arrow" id="c-arrow"><path d="M0 -38 L12 -10 L4 -12 L4 22 L-4 22 L-4 -12 L-12 -10 Z"/></g>
      <circle class="c-hub" r="4"/></svg>`;
  }

  /* ---------- practice ---------- */
  let P = null;
  let wakeLock = null;

  function viewPractice(id) {
    const steps = stepsOf(id);
    if (!steps) return viewKata(id);
    P = { id, steps, i: 0, playing: false, timer: null, angle: 0, logged: false };
    return `
      <div class="practice">
        <header class="p-top">
          <a class="icon-btn" href="#k-${id}" aria-label="Close practice">${ICON.close}</a>
          <div class="p-title"><b>${esc(kata(id).name)}</b><small id="p-pos"></small></div>
          <span class="icon-btn ghost"></span>
        </header>
        <div class="p-progress"><span id="p-bar"></span></div>
        <div class="pcard" id="pcard" tabindex="0" aria-live="polite">
          <div class="p-compass">${compass()}<p class="p-dir" id="p-dir"></p></div>
          <div id="p-body"></div>
        </div>
        <div class="p-controls">
          <button type="button" class="round" data-action="prev" aria-label="Previous move">${ICON.prev}</button>
          <button type="button" class="round play" data-action="play" id="p-play" aria-label="Play">${ICON.play}</button>
          <button type="button" class="round" data-action="next" aria-label="Next move">${ICON.next}</button>
        </div>
        <div class="p-settings">
          <label for="tempo">Pace <output id="tempo-out">${S.tempo}s</output></label>
          <input type="range" id="tempo" min="1.5" max="8" step="0.5" value="${S.tempo}">
          <label class="toggle" for="voice"><input type="checkbox" id="voice" ${S.voice ? 'checked' : ''}> Call the count</label>
          <select id="count" aria-label="Count language">
            <option value="ja" ${S.count === 'ja' ? 'selected' : ''}>Japanese count</option>
            <option value="en" ${S.count === 'en' ? 'selected' : ''}>English + move</option>
          </select>
        </div>
        <p class="hint center">Tap the card or swipe to move through the kata.</p>
      </div>`;
  }

  function drawPractice() {
    if (!P) return;
    const n = P.steps.length, i = P.i;
    const s = i >= 1 && i <= n ? P.steps[i - 1] : null;
    const d = s ? s.d : 'N';
    const target = DIRS[d] ?? 0;
    const cur = ((P.angle % 360) + 360) % 360;
    P.angle += ((target - cur + 540) % 360) - 180;
    const arrowEl = document.getElementById('c-arrow');
    if (arrowEl) arrowEl.style.transform = `rotate(${P.angle}deg)`;
    document.getElementById('p-dir').textContent = `Facing ${DIR_LABEL[d].toLowerCase()}`;
    document.getElementById('p-pos').textContent = i === 0 ? 'Ready' : i > n ? 'Finished' : `Move ${i} of ${n}`;
    document.getElementById('p-bar').style.width = `${(Math.min(i, n) / n) * 100}%`;
    const card = document.getElementById('pcard');
    card.classList.toggle('is-kiai', !!(s && s.k));

    let html;
    if (i === 0) {
      html = `<div class="p-num"><span lang="ja">用意</span></div><h2 class="p-tech">Yoi</h2><p class="p-te">Ready position, facing the front</p><p class="p-note">Bow, announce the kata, then step into yoi. Press play or tap the card to start.</p>`;
    } else if (i > n) {
      const st = ks(P.id);
      html = `<div class="p-num"><span lang="ja">止め</span></div><h2 class="p-tech">Yame</h2><p class="p-te">Return to yoi. Hold zanshin, then bow.</p>
        <p class="p-done">Kata complete. Practice ${st.practices} logged.</p>
        <div class="p-done-actions"><button type="button" class="btn" data-action="restart">Go again</button><a class="btn" href="#q-${P.id}">Take the quiz</a></div>`;
    } else {
      html = `<div class="p-num"><b>${i}</b><span>${count(i)}</span>${s.k ? '<span class="seal" lang="ja">気合<small>Kiai</small></span>' : ''}</div>
        <h2 class="p-tech">${esc(s.t)}</h2>${s.te ? `<p class="p-te">${esc(s.te)}</p>` : ''}
        <p class="p-stance"><b>${esc(s.s)}</b>${s.se ? `<span>${esc(s.se)}</span>` : ''}</p>
        ${s.n ? `<p class="p-note">${esc(s.n)}</p>` : ''}`;
    }
    document.getElementById('p-body').innerHTML = html;
    document.getElementById('p-play').innerHTML = P.playing ? ICON.pause : ICON.play;
    document.getElementById('p-play').setAttribute('aria-label', P.playing ? 'Pause' : 'Play');
  }

  function go(delta) {
    if (!P) return;
    const n = P.steps.length;
    P.i = Math.max(0, Math.min(n + 1, P.i + delta));
    if (P.i === n + 1 && !P.logged) {
      const st = ks(P.id);
      st.practices += 1; st.last = today();
      if (st.status === 'new') st.status = 'learning';
      P.logged = true; save();
    }
    drawPractice();
    announce();
    if (P.i === n + 1) stopPlay();
  }

  function announce() {
    if (!P || !S.voice || !('speechSynthesis' in window)) return;
    const n = P.steps.length, i = P.i, s = P.steps[i - 1];
    let text, ja = false;
    if (i === 0) { text = S.count === 'ja' ? 'よーい' : 'Yoi'; ja = S.count === 'ja'; }
    else if (i > n) { text = S.count === 'ja' ? 'やめ' : 'Yame'; ja = S.count === 'ja'; }
    else if (S.count === 'ja') { text = count(i, true); ja = true; }
    else text = `${i}. ${s.te || s.t}${s.k ? '. Kiai!' : ''}`;
    speak(text, ja);
  }

  let jaVoice = null;
  function pickVoice() { try { jaVoice = speechSynthesis.getVoices().find((v) => /^ja/i.test(v.lang)) || null; } catch (e) { jaVoice = null; } }
  if ('speechSynthesis' in window) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }
  function speak(text, ja) {
    try {
      speechSynthesis.cancel();
      let u;
      if (ja && jaVoice) { u = new SpeechSynthesisUtterance(text); u.voice = jaVoice; u.lang = jaVoice.lang; }
      else if (ja) {
        // No Japanese voice installed: read the romaji instead.
        const i = P ? P.i : 0, n = P ? P.steps.length : 0;
        u = new SpeechSynthesisUtterance(i === 0 ? 'yoy' : i > n ? 'yah meh' : count(i).replace(/-/g, ' '));
      } else u = new SpeechSynthesisUtterance(text);
      speechSynthesis.speak(u);
    } catch (e) { /* speech unavailable */ }
  }

  function togglePlay() { P.playing ? stopPlay() : startPlay(); }
  function startPlay() {
    if (!P) return;
    if (P.i > P.steps.length) { P.i = 0; P.logged = false; }
    P.playing = true; drawPractice(); announce();
    const tick = () => { if (!P || !P.playing) return; go(1); if (P.playing) P.timer = setTimeout(tick, S.tempo * 1000); };
    P.timer = setTimeout(tick, S.tempo * 1000);
  }
  function stopPlay() {
    if (!P) return;
    P.playing = false; clearTimeout(P.timer); drawPractice();
  }

  async function lockScreen() {
    try { if ('wakeLock' in navigator) wakeLock = await navigator.wakeLock.request('screen'); } catch (e) { wakeLock = null; }
  }
  function releaseScreen() { try { wakeLock && wakeLock.release(); } catch (e) { /* ignore */ } wakeLock = null; }

  /* ---------- quiz ---------- */
  let Q = null;
  const label = (s) => `${s.te || s.t}, facing ${DIR_LABEL[s.d].toLowerCase()}`;

  function buildQuiz(steps) {
    const n = steps.length, qs = [];
    const labels = steps.map(label);
    shuffle([...Array(n - 1).keys()]).slice(0, 6).forEach((i) => {
      const correct = labels[i + 1];
      const wrong = shuffle([...new Set(labels.filter((l) => l !== correct))]).slice(0, 3);
      qs.push({ q: `After move ${i + 1} (${labels[i]}), what comes next?`, opts: shuffle([correct, ...wrong]), a: correct, why: `Move ${i + 2}: ${correct}.` });
    });
    shuffle([...Array(n).keys()]).slice(0, 2).forEach((i) => {
      const correct = DIR_LABEL[steps[i].d];
      const wrong = shuffle(Object.values(DIR_LABEL).filter((l) => l !== correct)).slice(0, 3);
      qs.push({ q: `Which way do you face for move ${i + 1} (${steps[i].te || steps[i].t})?`, opts: shuffle([correct, ...wrong]), a: correct, why: `Move ${i + 1} faces ${correct.toLowerCase()}.` });
    });
    const kiai = kiaiOf(steps);
    if (kiai.length) {
      const correct = String(kiai[0]);
      const wrong = shuffle([...Array(n).keys()].map((x) => String(x + 1)).filter((x) => !kiai.includes(Number(x)))).slice(0, 3);
      qs.push({ q: 'On which move is the first kiai?', opts: shuffle([correct, ...wrong]), a: correct, why: `Kiai on move${kiai.length > 1 ? 's' : ''} ${kiai.join(' and ')}.` });
    }
    return shuffle(qs).slice(0, 8);
  }

  function viewQuiz(id) {
    const steps = stepsOf(id);
    if (!steps || steps.length < 4) return viewKata(id);
    Q = { id, qs: buildQuiz(steps), idx: 0, score: 0, picked: null };
    return `<div class="quiz"><header class="p-top">
        <a class="icon-btn" href="#k-${id}" aria-label="Close quiz">${ICON.close}</a>
        <div class="p-title"><b>${esc(kata(id).name)} quiz</b><small id="q-pos"></small></div><span class="icon-btn ghost"></span>
      </header><div class="p-progress"><span id="q-bar"></span></div><div id="q-body"></div></div>`;
  }

  function drawQuiz() {
    const body = document.getElementById('q-body');
    if (!Q || !body) return;
    const total = Q.qs.length;
    document.getElementById('q-bar').style.width = `${(Q.idx / total) * 100}%`;
    if (Q.idx >= total) {
      const pct = Math.round((Q.score / total) * 100);
      const st = ks(Q.id);
      if (st.best == null || pct > st.best) { st.best = pct; save(); }
      document.getElementById('q-pos').textContent = 'Done';
      body.innerHTML = `<div class="q-result"><span class="big-num">${Q.score}<small>/${total}</small></span>
        <p>${pct >= 90 ? 'Excellent. You know the sequence.' : pct >= 60 ? 'Good. Run the practice again for the moves you missed.' : 'Keep going. Step through the practice slowly a few times, then try again.'}</p>
        <div class="actions"><button type="button" class="btn primary" data-action="quiz-again">Try again</button><a class="btn" href="#p-${Q.id}">Practise</a></div></div>`;
      return;
    }
    const q = Q.qs[Q.idx];
    document.getElementById('q-pos').textContent = `Question ${Q.idx + 1} of ${total}`;
    const answered = Q.picked != null;
    body.innerHTML = `<h2 class="q-q">${esc(q.q)}</h2>
      <div class="q-opts">${q.opts.map((o, i) => {
        let cls = '';
        if (answered) cls = o === q.a ? 'right' : (i === Q.picked ? 'wrong' : 'dim');
        return `<button type="button" class="q-opt ${cls}" data-action="answer" data-i="${i}" ${answered ? 'disabled' : ''}>${esc(o)}</button>`;
      }).join('')}</div>
      ${answered ? `<p class="q-why">${esc(q.why)}</p><button type="button" class="btn primary wide" data-action="q-next">${Q.idx + 1 < total ? 'Next question' : 'See result'}</button>` : ''}`;
  }

  /* ---------- editor ---------- */
  function serialize(steps) {
    return (steps || []).map((s) => `${s.k ? '*' : ''}${s.d} | ${s.s} | ${s.t}${s.n ? ` | ${s.n}` : ''}`).join('\n');
  }
  function parse(text) {
    const out = [], errors = [];
    text.split('\n').forEach((raw, li) => {
      let line = raw.trim();
      if (!line) return;
      let k = false;
      if (line.startsWith('*')) { k = true; line = line.slice(1).trim(); }
      const [d, s, t, ...rest] = line.split('|').map((x) => x.trim());
      const dir = (d || '').toUpperCase();
      if (!(dir in DIRS)) { errors.push(`Line ${li + 1}: "${d || ''}" isn't a direction. Use N, NE, E, SE, S, SW, W or NW.`); return; }
      if (!s || !t) { errors.push(`Line ${li + 1}: add a stance and a technique, separated by |.`); return; }
      out.push({ d: dir, s, t, n: rest.join(' | '), k });
    });
    return { steps: out, errors };
  }

  function viewEdit(id) {
    const k = kata(id);
    if (!k) return viewHome();
    const has = !!S.custom[id];
    return `<header class="top"><a class="icon-btn" href="#k-${id}" aria-label="Back">${ICON.back}</a><h1 class="page-title">Edit ${esc(k.name)}</h1></header>
      <p class="hint">One move per line: <code>direction | stance | technique | note</code>. The note is optional. Start a line with <code>*</code> for a kiai move. Directions: N is the front you face at yoi, E your right, S behind, W your left, plus NE, SE, SW, NW.</p>
      <pre class="example">W | Hidari junzuki-dachi | Gedan-barai | Turn left
W | Migi junzuki-dachi | Junzuki chudan
*N | Migi junzuki-dachi | Jodan-uke</pre>
      <label class="sr" for="steps-text">Steps</label>
      <textarea id="steps-text" rows="16" spellcheck="false" autocapitalize="off">${esc(serialize(stepsOf(id)))}</textarea>
      <p class="error" id="edit-error" hidden></p>
      <div class="actions">
        <button type="button" class="btn primary" data-action="save-steps" data-id="${id}">Save steps</button>
        ${has && k.steps ? `<button type="button" class="btn" data-action="reset-steps" data-id="${id}">Use built-in version</button>` : ''}
        ${has && !k.steps ? `<button type="button" class="btn" data-action="reset-steps" data-id="${id}">Delete steps</button>` : ''}
      </div>
      <p class="hint">Saved on this phone only.</p>`;
  }

  /* ---------- settings & glossary ---------- */
  function viewSettings() {
    return `<header class="top"><a class="icon-btn" href="#home" aria-label="Home">${ICON.back}</a><h1 class="page-title">Settings</h1></header>
      <form class="form" id="settings-form">
        <label for="grade">Grading for</label>
        <select id="grade">${D.grades.map((g) => `<option value="${g.id}" ${g.id === S.grade ? 'selected' : ''}>${esc(g.name)}</option>`).join('')}</select>
        <label for="date">Grading date</label>
        <input type="date" id="date" value="${esc(S.date)}">
        <button type="submit" class="btn primary">Save</button>
        <p class="ok" id="saved" hidden>Saved.</p>
      </form>
      <h3 class="sec">About the content</h3>
      <p class="hint">${esc(D.note)}</p>
      <h3 class="sec">Reset</h3>
      <p class="hint">Clears progress, quiz scores and any steps you entered.</p>
      <button type="button" class="btn danger" data-action="reset-all" id="reset-all">Erase all progress</button>`;
  }

  function viewGlossary() {
    return `<header class="top"><h1 class="page-title">Terms</h1></header>
      ${D.glossary.map(([group, items]) => `<h3 class="sec">${esc(group)}</h3>
        <dl class="gloss">${items.map(([t, d]) => `<div><dt>${esc(t)}</dt><dd>${esc(d)}</dd></div>`).join('')}</dl>`).join('')}`;
  }

  /* ---------- router ---------- */
  function route() {
    const h = (location.hash || '#home').slice(1);
    if (P) { stopPlay(); P = null; releaseScreen(); try { speechSynthesis.cancel(); } catch (e) { /* ignore */ } }
    Q = null;
    let html, tab = null, full = false;
    if (h.startsWith('k-')) { html = viewKata(h.slice(2)); tab = 'kata'; }
    else if (h.startsWith('p-')) { html = viewPractice(h.slice(2)); full = true; }
    else if (h.startsWith('q-')) { html = viewQuiz(h.slice(2)); full = true; }
    else if (h.startsWith('e-')) { html = viewEdit(h.slice(2)); tab = 'kata'; }
    else if (h === 'kata') { html = viewKataList(); tab = 'kata'; }
    else if (h === 'glossary') { html = viewGlossary(); tab = 'glossary'; }
    else if (h === 'settings') { html = viewSettings(); tab = 'home'; }
    else { html = viewHome(); tab = 'home'; }
    $app.innerHTML = html;
    $app.classList.toggle('full', full);
    $tabs.hidden = full;
    $tabs.querySelectorAll('a').forEach((a) => a.setAttribute('aria-current', a.dataset.tab === tab ? 'page' : 'false'));
    window.scrollTo(0, 0);
    if (P) { drawPractice(); lockScreen(); }
    if (Q) drawQuiz();
  }

  /* ---------- events ---------- */
  $app.addEventListener('click', (e) => {
    const card = e.target.closest('#pcard');
    const el = e.target.closest('[data-action]');
    if (!el && card && P && !e.target.closest('a,button')) { go(1); return; }
    if (!el) return;
    const a = el.dataset.action;
    if (a === 'next') go(1);
    else if (a === 'prev') go(-1);
    else if (a === 'play') togglePlay();
    else if (a === 'restart') { P.i = 0; P.logged = false; drawPractice(); announce(); }
    else if (a === 'status') { ks(el.dataset.id).status = el.dataset.v; save(); route(); }
    else if (a === 'answer') { Q.picked = Number(el.dataset.i); if (Q.qs[Q.idx].opts[Q.picked] === Q.qs[Q.idx].a) Q.score++; drawQuiz(); }
    else if (a === 'q-next') { Q.idx++; Q.picked = null; drawQuiz(); }
    else if (a === 'quiz-again') route();
    else if (a === 'save-steps') {
      const { steps, errors } = parse(document.getElementById('steps-text').value);
      const err = document.getElementById('edit-error');
      if (errors.length || !steps.length) { err.textContent = errors.length ? errors.slice(0, 3).join(' ') : 'Add at least one move.'; err.hidden = false; return; }
      S.custom[el.dataset.id] = steps; save(); location.hash = `k-${el.dataset.id}`;
    } else if (a === 'reset-steps') { delete S.custom[el.dataset.id]; save(); location.hash = `k-${el.dataset.id}`; }
    else if (a === 'reset-all') {
      if (el.dataset.armed) { S = JSON.parse(JSON.stringify(defaults)); save(); location.hash = 'home'; route(); }
      else { el.dataset.armed = '1'; el.textContent = 'Tap again to erase everything'; }
    }
  });

  $app.addEventListener('submit', (e) => {
    if (e.target.id !== 'settings-form') return;
    e.preventDefault();
    S.grade = document.getElementById('grade').value;
    S.date = document.getElementById('date').value;
    save();
    document.getElementById('saved').hidden = false;
  });

  $app.addEventListener('input', (e) => {
    if (e.target.id === 'tempo') { S.tempo = Number(e.target.value); document.getElementById('tempo-out').textContent = `${S.tempo}s`; save(); }
  });
  $app.addEventListener('change', (e) => {
    if (e.target.id === 'voice') { S.voice = e.target.checked; save(); if (!S.voice) try { speechSynthesis.cancel(); } catch (x) { /* ignore */ } }
    if (e.target.id === 'count') { S.count = e.target.value; save(); }
  });

  let tx = null, ty = null;
  $app.addEventListener('touchstart', (e) => { if (!P || !e.target.closest('#pcard')) return; tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
  $app.addEventListener('touchend', (e) => {
    if (!P || tx == null) return;
    const dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty;
    tx = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) { e.preventDefault(); go(dx < 0 ? 1 : -1); }
  });

  document.addEventListener('keydown', (e) => {
    if (!P || e.target.matches('input,select,textarea')) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
    else if (e.key === ' ') { e.preventDefault(); togglePlay(); }
  });
  document.addEventListener('visibilitychange', () => { if (P && document.visibilityState === 'visible') lockScreen(); });

  window.addEventListener('hashchange', route);
  route();

  if ('serviceWorker' in navigator && /^(https:|http:\/\/localhost|http:\/\/127\.)/.test(location.href)) {
    navigator.serviceWorker.register('sw.js').catch(() => { /* offline support unavailable */ });
  }
})();
