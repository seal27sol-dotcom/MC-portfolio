/**
 * CM Portfolio — Visitor Tracker v1.0
 * Splash screen → Visitor modal → Entry & Exit email notifications
 * Formspree endpoint: https://formspree.io/f/maqpropp
 */
(function () {
  'use strict';

  const ENDPOINT      = 'https://formspree.io/f/maqpropp';
  const SESSION_KEY   = 'cm_visitor_v1';
  const ENTRY_TS_KEY  = 'cm_entry_ts';
  const SPLASH_DONE   = 'cm_splash_done';

  /* ─────────────────────────────────────────
     STYLES — injected once into <head>
  ───────────────────────────────────────── */
  function injectStyles() {
    if (document.getElementById('cm-tracker-styles')) return;
    const s = document.createElement('style');
    s.id = 'cm-tracker-styles';
    s.textContent = `
      /* ── SPLASH ── */
      #cm-splash {
        position: fixed; inset: 0; z-index: 999999;
        background: #09101f;
        display: flex; align-items: center; justify-content: center;
        flex-direction: column;
        transition: opacity 0.7s ease, transform 0.7s ease;
      }
      #cm-splash.out {
        opacity: 0; transform: scale(1.04);
        pointer-events: none;
      }

      .cm-sp-wrap { text-align: center; user-select: none; }

      .cm-sp-logo {
        font-family: 'Space Grotesk', sans-serif;
        font-size: clamp(3rem, 8vw, 5.5rem);
        font-weight: 800; letter-spacing: -3px;
        color: #e2e8f0; line-height: 1;
        margin-bottom: 6px;
        animation: cmPulse 2s ease-in-out infinite;
      }
      .cm-sp-logo span { color: #14b8a6; }

      @keyframes cmPulse {
        0%, 100% { text-shadow: 0 0 0px rgba(20,184,166,0); }
        50%       { text-shadow: 0 0 40px rgba(20,184,166,0.35); }
      }

      .cm-sp-tag {
        font-family: 'DM Sans', sans-serif;
        font-size: 0.82rem; letter-spacing: 3px;
        text-transform: uppercase; color: #4a5a74;
        margin-bottom: 52px;
      }

      .cm-sp-track {
        width: min(280px, 72vw); height: 2px;
        background: rgba(255,255,255,0.07);
        border-radius: 99px; margin: 0 auto 14px;
        overflow: hidden; position: relative;
      }
      .cm-sp-fill {
        position: absolute; left: 0; top: 0; bottom: 0;
        width: 0%; border-radius: 99px;
        background: linear-gradient(90deg, #14b8a6 0%, #60a5fa 100%);
        transition: width 3.75s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        box-shadow: 0 0 10px rgba(20,184,166,0.5);
      }
      .cm-sp-status {
        font-family: 'DM Sans', sans-serif;
        font-size: 0.72rem; color: #4a5a74;
        letter-spacing: 2px; text-transform: uppercase;
        min-height: 18px;
        transition: color 0.4s ease;
      }

      /* glowing dots */
      .cm-sp-dots { display: flex; gap: 7px; justify-content: center; margin-top: 44px; }
      .cm-sp-dot {
        width: 5px; height: 5px; border-radius: 50%;
        background: #14b8a6; opacity: 0.3;
        animation: cmDotBlink 1.4s ease-in-out infinite;
      }
      .cm-sp-dot:nth-child(2) { animation-delay: 0.2s; }
      .cm-sp-dot:nth-child(3) { animation-delay: 0.4s; }
      @keyframes cmDotBlink {
        0%, 80%, 100% { opacity: 0.2; transform: scale(1); }
        40% { opacity: 1; transform: scale(1.35); }
      }

      /* ── MODAL OVERLAY ── */
      #cm-modal {
        position: fixed; inset: 0; z-index: 999998;
        background: rgba(9,16,31,0.82);
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
        display: flex; align-items: center; justify-content: center;
        padding: 20px;
        animation: cmFadeIn 0.4s ease forwards;
      }
      #cm-modal.out { animation: cmFadeOut 0.35s ease forwards; }

      @keyframes cmFadeIn  { from { opacity:0; } to { opacity:1; } }
      @keyframes cmFadeOut { from { opacity:1; } to { opacity:0; } }

      /* ── MODAL CARD ── */
      .cm-card {
        background: #0e1729;
        border: 1px solid rgba(20,184,166,0.18);
        border-radius: 22px; padding: 40px 36px 32px;
        max-width: 420px; width: 100%;
        box-shadow: 0 32px 80px rgba(0,0,0,0.65),
                    0 0 0 1px rgba(20,184,166,0.06);
        animation: cmSlideUp 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        text-align: center;
      }
      @keyframes cmSlideUp {
        from { opacity:0; transform: translateY(28px) scale(0.97); }
        to   { opacity:1; transform: translateY(0) scale(1); }
      }

      .cm-card-icon {
        width: 58px; height: 58px; border-radius: 16px;
        background: rgba(20,184,166,0.12);
        border: 1px solid rgba(20,184,166,0.25);
        display: flex; align-items: center; justify-content: center;
        font-size: 1.5rem; color: #14b8a6;
        margin: 0 auto 20px;
      }

      .cm-card h2 {
        font-family: 'Space Grotesk', sans-serif;
        font-size: 1.4rem; font-weight: 700;
        color: #e2e8f0; margin-bottom: 9px;
        line-height: 1.25;
      }
      .cm-card > p {
        font-family: 'DM Sans', sans-serif;
        font-size: 0.875rem; color: #8899b4;
        line-height: 1.65; margin-bottom: 28px;
      }

      .cm-field { text-align: left; margin-bottom: 14px; }
      .cm-field label {
        display: block; font-family: 'DM Sans', sans-serif;
        font-size: 0.72rem; font-weight: 600;
        color: #8899b4; letter-spacing: 1.8px;
        text-transform: uppercase; margin-bottom: 7px;
      }
      .cm-req { color: #14b8a6; }
      .cm-opt { color: #4a5a74; font-weight: 400; text-transform: none; letter-spacing: 0; font-size: 0.78rem; }

      .cm-field input {
        width: 100%; padding: 11px 15px;
        background: #152038;
        border: 1.5px solid rgba(255,255,255,0.07);
        border-radius: 10px; color: #e2e8f0;
        font-family: 'DM Sans', sans-serif; font-size: 0.93rem;
        outline: none; transition: border-color 0.2s ease, box-shadow 0.2s ease;
      }
      .cm-field input:focus {
        border-color: #14b8a6;
        box-shadow: 0 0 0 3px rgba(20,184,166,0.12);
      }
      .cm-field input::placeholder { color: #4a5a74; }

      .cm-err-msg {
        display: none; color: #f87171;
        font-family: 'DM Sans', sans-serif;
        font-size: 0.78rem; margin-top: 5px;
      }
      .cm-err-msg.show { display: block; }

      .cm-actions { display: flex; flex-direction: column; gap: 10px; margin-top: 22px; }

      .cm-btn-primary {
        width: 100%; padding: 13px 20px;
        background: #14b8a6; color: #071018;
        border: none; border-radius: 11px;
        font-family: 'DM Sans', sans-serif;
        font-size: 0.95rem; font-weight: 700;
        cursor: pointer; letter-spacing: 0.2px;
        display: flex; align-items: center; justify-content: center; gap: 9px;
        transition: background 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease;
      }
      .cm-btn-primary:hover {
        background: #0d9488; transform: translateY(-1px);
        box-shadow: 0 6px 20px rgba(20,184,166,0.35);
      }
      .cm-btn-primary:active { transform: translateY(0); }

      .cm-btn-ghost {
        width: 100%; padding: 11px 20px;
        background: transparent;
        color: #8899b4;
        border: 1.5px solid rgba(255,255,255,0.09);
        border-radius: 11px;
        font-family: 'DM Sans', sans-serif;
        font-size: 0.875rem; font-weight: 500;
        cursor: pointer;
        display: flex; align-items: center; justify-content: center; gap: 9px;
        transition: border-color 0.2s ease, color 0.2s ease;
      }
      .cm-btn-ghost:hover { border-color: rgba(255,255,255,0.2); color: #e2e8f0; }

      .cm-divider {
        display: flex; align-items: center; gap: 10px;
        margin: 2px 0;
      }
      .cm-divider-line { flex: 1; height: 1px; background: rgba(255,255,255,0.06); }
      .cm-divider-text {
        font-family: 'DM Sans', sans-serif;
        font-size: 0.72rem; color: #4a5a74;
        letter-spacing: 1px;
      }
    `;
    document.head.appendChild(s);
  }

  /* ─────────────────────────────────────────
     SPLASH SCREEN
  ───────────────────────────────────────── */
  const statusMessages = [
    'Initialising portfolio…',
    'Loading projects…',
    'Preparing experience…',
    'Almost there…',
    'Welcome!'
  ];

  function buildSplash() {
    const el = document.createElement('div');
    el.id = 'cm-splash';
    el.innerHTML = `
      <div class="cm-sp-wrap">
        <div class="cm-sp-logo">CM<span>.</span></div>
        <div class="cm-sp-tag">Christopher Musamali &mdash; Portfolio</div>
        <div class="cm-sp-track"><div class="cm-sp-fill" id="cmFill"></div></div>
        <div class="cm-sp-status" id="cmStatus">Initialising portfolio…</div>
        <div class="cm-sp-dots">
          <div class="cm-sp-dot"></div>
          <div class="cm-sp-dot"></div>
          <div class="cm-sp-dot"></div>
        </div>
      </div>`;
    document.body.appendChild(el);

    /* Animate progress bar */
    requestAnimationFrame(() => {
      document.getElementById('cmFill').style.width = '100%';
    });

    /* Cycle through status messages */
    const interval = 4000 / statusMessages.length;
    statusMessages.forEach((msg, i) => {
      if (i === 0) return;
      setTimeout(() => {
        const s = document.getElementById('cmStatus');
        if (s) s.textContent = msg;
      }, interval * i);
    });

    /* Dismiss after 4 s */
    setTimeout(dismissSplash, 4000);
  }

  function dismissSplash() {
    const el = document.getElementById('cm-splash');
    if (!el) return;
    el.classList.add('out');
    setTimeout(() => {
      el.remove();
      showModal();
    }, 700);
  }

  /* ─────────────────────────────────────────
     VISITOR MODAL
  ───────────────────────────────────────── */
  function showModal() {
    /* Already identified this session? Just start tracking */
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (stored) {
      try {
        const v = JSON.parse(stored);
        setupExitTracking(v.name, v.email);
      } catch(_) {}
      return;
    }

    const modal = document.createElement('div');
    modal.id = 'cm-modal';
    modal.innerHTML = `
      <div class="cm-card">
        <div class="cm-card-icon"><i class="fa-solid fa-hand-wave"></i></div>
        <h2>Welcome to My Portfolio</h2>
        <p>Let me know who's visiting — I'll get a notification on your arrival
           and when you leave, so I can follow up if needed.</p>

        <div class="cm-field">
          <label>Your Name <span class="cm-req">*</span></label>
          <input id="cmName" type="text" placeholder="e.g. Sarah Nakato" autocomplete="name" />
          <div class="cm-err-msg" id="cmNameErr">Please enter your name to continue.</div>
        </div>

        <div class="cm-field">
          <label>Email Address <span class="cm-opt">(optional)</span></label>
          <input id="cmEmail" type="email" placeholder="you@example.com" autocomplete="email" />
          <div class="cm-err-msg" id="cmEmailErr">That email doesn't look right.</div>
        </div>

        <div class="cm-actions">
          <button class="cm-btn-primary" id="cmContinue">
            <i class="fa-solid fa-rocket"></i> Continue
          </button>
          <div class="cm-divider">
            <span class="cm-divider-line"></span>
            <span class="cm-divider-text">or</span>
            <span class="cm-divider-line"></span>
          </div>
          <button class="cm-btn-ghost" id="cmGuest">
            <i class="fa-solid fa-user-secret"></i> Continue as Guest
          </button>
        </div>
      </div>`;
    document.body.appendChild(modal);

    /* Focus name */
    setTimeout(() => {
      const n = document.getElementById('cmName');
      if (n) n.focus();
    }, 80);

    /* Enter key submits */
    modal.addEventListener('keydown', e => {
      if (e.key === 'Enter') handleSubmit(false);
    });

    document.getElementById('cmContinue').addEventListener('click', () => handleSubmit(false));
    document.getElementById('cmGuest').addEventListener('click',    () => handleSubmit(true));
  }

  function handleSubmit(isGuest) {
    const nameEl  = document.getElementById('cmName');
    const emailEl = document.getElementById('cmEmail');
    const nameErr = document.getElementById('cmNameErr');
    const mailErr = document.getElementById('cmEmailErr');

    /* Reset errors */
    nameErr.classList.remove('show');
    mailErr.classList.remove('show');

    if (isGuest) {
      commitVisitor('Guest', '', true);
      return;
    }

    const name  = nameEl.value.trim();
    const email = emailEl.value.trim();

    if (!name) {
      nameErr.classList.add('show');
      nameEl.focus();
      return;
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      mailErr.classList.add('show');
      emailEl.focus();
      return;
    }

    commitVisitor(name, email, false);
  }

  function commitVisitor(name, email, isGuest) {
    const entryTime = new Date();
    const visitor   = { name, email, isGuest, entryTime: entryTime.toISOString() };

    sessionStorage.setItem(SESSION_KEY, JSON.stringify(visitor));
    sessionStorage.setItem(ENTRY_TS_KEY, entryTime.toISOString());

    /* Dismiss modal */
    const modal = document.getElementById('cm-modal');
    if (modal) {
      modal.classList.add('out');
      setTimeout(() => modal.remove(), 380);
    }

    sendEntry(name, email, isGuest, entryTime);
    setupExitTracking(name, email);
  }

  /* ─────────────────────────────────────────
     EMAIL NOTIFICATIONS
  ───────────────────────────────────────── */
  function kampalaTime(date) {
    return date.toLocaleString('en-UG', {
      timeZone: 'Africa/Kampala',
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    }) + ' (EAT)';
  }

  function sendEntry(name, email, isGuest, entryTime) {
    const page = window.location.href;
    const body = {
      _subject:      `👁️ Portfolio Visitor — ${name}`,
      '📌 Event':    '🟢 ARRIVAL',
      '👤 Visitor':  name,
      '📧 Email':    email || '(not provided)',
      '🕐 Arrived':  kampalaTime(entryTime),
      '🔗 Page':     page,
      '🌐 Browser':  navigator.userAgent.substring(0, 120),
      '🎭 Type':     isGuest ? 'Guest' : 'Named Visitor',
    };

    fetch(ENDPOINT, {
      method:  'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    }).catch(() => {/* silent */});
  }

  function setupExitTracking(name, email) {
    window.addEventListener('pagehide', () => sendExit(name, email));
    /* Fallback for browsers that support beforeunload better */
    window.addEventListener('beforeunload', () => sendExit(name, email));
  }

  let exitSent = false;
  function sendExit(name, email) {
    if (exitSent) return;
    exitSent = true;

    const exitTime  = new Date();
    const entryRaw  = sessionStorage.getItem(ENTRY_TS_KEY);
    const entryTime = entryRaw ? new Date(entryRaw) : exitTime;
    const elapsed   = Math.round((exitTime - entryTime) / 1000);
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;
    const duration = mins > 0 ? `${mins} min ${secs} sec` : `${secs} sec`;

    const body = JSON.stringify({
      _subject:       `🔴 Visitor Left — ${name} (${duration})`,
      '📌 Event':     '🔴 DEPARTURE',
      '👤 Visitor':   name,
      '📧 Email':     email || '(not provided)',
      '🕐 Arrived':   entryRaw ? kampalaTime(new Date(entryRaw)) : 'Unknown',
      '🚪 Left':      kampalaTime(exitTime),
      '⏱️ Time Spent': duration,
      '📄 Last Page': window.location.pathname,
    });

    /* sendBeacon is fire-and-forget — survives page close */
    navigator.sendBeacon(ENDPOINT, new Blob([body], { type: 'application/json' }));
  }

  /* ─────────────────────────────────────────
     BOOT
  ───────────────────────────────────────── */
  function boot() {
    injectStyles();

    const splashAlreadyShown = sessionStorage.getItem(SPLASH_DONE);

    if (!splashAlreadyShown) {
      /* First page load this session → full experience */
      sessionStorage.setItem(SPLASH_DONE, '1');
      buildSplash();
      /* Note: showModal() is called inside dismissSplash() */
    } else {
      /* Already shown splash — if visitor identified, just track */
      const stored = sessionStorage.getItem(SESSION_KEY);
      if (stored) {
        try {
          const v = JSON.parse(stored);
          setupExitTracking(v.name, v.email);
        } catch (_) {}
      } else {
        /* Splash shown but modal not completed (edge case) */
        showModal();
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
