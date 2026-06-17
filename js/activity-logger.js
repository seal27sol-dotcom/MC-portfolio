/**
 * activity-logger.js — Christopher Musamali Portfolio
 * ═══════════════════════════════════════════════════════════════
 * Logs EVERY visitor activity to Christopher's email via Formspree.
 * Loaded on every page. Tracks:
 *   - Page views (which page, referrer, time)
 *   - Link clicks (internal navigation)
 *   - Time spent on each page
 *   - Session start / end
 *   - CV download attempts
 *   - Contact form submissions
 * ═══════════════════════════════════════════════════════════════
 */
(function () {
  'use strict';

  var FORMSPREE = (window.ENV && window.ENV.FORMSPREE_ENDPOINT)
                 || 'https://formspree.io/f/mgobbwoe';

  /* ── Helpers ── */
  function kTime(d) {
    return (d||new Date()).toLocaleString('en-UG', {
      timeZone:'Africa/Kampala', weekday:'short', month:'short',
      day:'numeric', year:'numeric', hour:'2-digit', minute:'2-digit', second:'2-digit'
    }) + ' EAT';
  }

  function getVisitor() {
    try { return JSON.parse(sessionStorage.getItem('cm_visitor_v1')) || {}; }
    catch(e) { return {}; }
  }

  function browserName() {
    var ua = navigator.userAgent;
    if (/Edg\//.test(ua))   return 'Edge '   + (ua.match(/Edg\/([\d]+)/)||['','?'])[1];
    if (/OPR\//.test(ua))   return 'Opera '  + (ua.match(/OPR\/([\d]+)/)||['','?'])[1];
    if (/Firefox\//.test(ua)) return 'Firefox '+(ua.match(/Firefox\/([\d]+)/)||['','?'])[1];
    if (/Chrome\//.test(ua)) return 'Chrome '+(ua.match(/Chrome\/([\d]+)/)||['','?'])[1];
    if (/Safari\//.test(ua)) return 'Safari '+(ua.match(/Version\/([\d]+)/)||['','?'])[1];
    return 'Unknown';
  }

  function deviceType() {
    return /Mobi|Android|iPhone|iPad/.test(navigator.userAgent) ? 'Mobile' : 'Desktop';
  }

  function pageName() {
    var p = window.location.pathname.split('/').pop() || 'index.html';
    return p.replace('.html','').replace(/-/g,' ') || 'Home';
  }

  /* ── Send event to Formspree ── */
  function logEvent(subject, fields) {
    var visitor = getVisitor();
    var base = {
      _subject:       subject,
      '📌 Event':      subject,
      '👤 Visitor':    visitor.name  || 'Anonymous',
      '📧 Email':      visitor.email || '(not provided)',
      '📄 Page':       pageName() + ' (' + window.location.pathname + ')',
      '🕐 Time':       kTime(),
      '🌐 Browser':    browserName(),
      '📱 Device':     deviceType(),
      '🔗 Referrer':   document.referrer || 'Direct',
    };
    Object.assign(base, fields);

    fetch(FORMSPREE, {
      method:  'POST',
      headers: { 'Accept':'application/json', 'Content-Type':'application/json' },
      body:    JSON.stringify(base),
    }).catch(function(){});
  }

  /* ── 1. PAGE VIEW ── */
  var pageEnterTime = Date.now();

  window.addEventListener('DOMContentLoaded', function() {
    logEvent('👁️ Page View — ' + pageName(), {
      '🔢 Session Pages': (function(){
        try { return JSON.parse(sessionStorage.getItem('cm_pages_visited')||'[]').length; }
        catch(e){ return 1; }
      })(),
    });
  });

  /* ── 2. TIME ON PAGE + EXIT ── */
  var exitLogged = false;
  function logExit() {
    if (exitLogged) return;
    exitLogged = true;
    var secs = Math.round((Date.now() - pageEnterTime) / 1000);
    var dur  = secs < 60 ? secs+'s' : Math.floor(secs/60)+'m '+secs%60+'s';
    var visitor = getVisitor();

    var body = JSON.stringify({
      _subject:    '🚪 Left Page — ' + pageName() + ' (' + dur + ')',
      '📌 Event':   'PAGE_EXIT',
      '👤 Visitor': visitor.name  || 'Anonymous',
      '📧 Email':   visitor.email || '(not provided)',
      '📄 Page':    pageName() + ' (' + window.location.pathname + ')',
      '⏱️ Time Spent': dur,
      '🕐 Left At': kTime(),
      '🌐 Browser': browserName(),
      '📱 Device':  deviceType(),
    });
    navigator.sendBeacon(FORMSPREE, new Blob([body], { type:'application/json' }));
  }

  window.addEventListener('pagehide',     logExit);
  window.addEventListener('beforeunload', logExit);

  /* ── 3. NAV LINK CLICKS ── */
  document.addEventListener('click', function(e) {
    var a = e.target.closest('a');
    if (!a) return;
    var href = a.getAttribute('href') || '';
    if (!href || href.startsWith('#') || href.startsWith('javascript')) return;
    if (href.startsWith('mailto:')) {
      logEvent('📧 Email Clicked — ' + href.replace('mailto:',''), {
        '📧 Email Href': href,
      });
      return;
    }
    if (!href.startsWith('http') && !a.hasAttribute('download')) {
      var dest = a.textContent.trim().substring(0,40) || href;
      logEvent('🔗 Nav Click — ' + dest, {
        '🎯 Destination': href,
        '📝 Link Text':   dest,
      });
    }
  });

  /* ── 4. CONTACT FORM SUBMISSION ── */
  document.addEventListener('submit', function(e) {
    var form = e.target;
    if (!form || form.id !== 'contactForm') return;
    var nameEl  = document.getElementById('contactName') || document.querySelector('[name="name"]');
    var emailEl = document.getElementById('contactEmail')|| document.querySelector('[name="email"]');
    logEvent('📬 Contact Form Submitted', {
      '_subject':    '📬 Contact Form — ' + (nameEl&&nameEl.value||'?'),
      '👤 Sender':   nameEl  && nameEl.value  || '?',
      '📧 Sender Email': emailEl && emailEl.value || '?',
    });
  });

  /* ── 5. EXPOSE for cv-download.js to piggyback ── */
  window.CM_LOG = logEvent;

})();
