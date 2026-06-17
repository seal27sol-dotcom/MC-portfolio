/**
 * session-tracker.js — Christopher Musamali Portfolio
 * ─────────────────────────────────────────────────────────────────
 * Tracks visitor session data and exposes it site-wide.
 * Powers the session panel on support.html.
 * Sends session summary to Christopher via Formspree on exit.
 * ─────────────────────────────────────────────────────────────────
 */

(function () {
  'use strict';

  var FORMSPREE    = (window.ENV && window.ENV.FORMSPREE_ENDPOINT) || 'https://formspree.io/f/mgobbwoe';
  var SESSION_KEY  = 'cm_visitor_v1';
  var NAV_KEY      = 'cm_nav_log';
  var ENTRY_KEY    = 'cm_entry_ts';
  var PAGES_KEY    = 'cm_pages_visited';

  /* ── Collect browser / device info ── */
  function getBrowserInfo() {
    var ua   = navigator.userAgent;
    var name = 'Unknown Browser';
    var ver  = '';

    if      (/Edg\//.test(ua))    { name='Microsoft Edge';  ver=ua.match(/Edg\/([\d.]+)/)[1]; }
    else if (/OPR\//.test(ua))    { name='Opera';           ver=ua.match(/OPR\/([\d.]+)/)[1]; }
    else if (/Chrome\//.test(ua)) { name='Google Chrome';   ver=ua.match(/Chrome\/([\d.]+)/)[1]; }
    else if (/Firefox\//.test(ua)){ name='Mozilla Firefox'; ver=ua.match(/Firefox\/([\d.]+)/)[1]; }
    else if (/Safari\//.test(ua)) { name='Apple Safari';    ver=ua.match(/Version\/([\d.]+)/)?.[1]||''; }

    var os = 'Unknown OS';
    if      (/Windows NT 10/.test(ua)) os='Windows 10/11';
    else if (/Windows NT 6/.test(ua))  os='Windows 7/8';
    else if (/Mac OS X/.test(ua))      os='macOS';
    else if (/Android/.test(ua))       os='Android';
    else if (/iPhone|iPad/.test(ua))   os='iOS';
    else if (/Linux/.test(ua))         os='Linux';

    var device = /Mobi|Android|iPhone|iPad/.test(ua) ? 'Mobile / Tablet' : 'Desktop';

    return { browser: name + (ver?' '+ver.split('.')[0]:''), os: os, device: device, raw: ua.substring(0,120) };
  }

  function getScreenInfo() {
    return window.screen.width + '×' + window.screen.height +
           ' (viewport: ' + window.innerWidth + '×' + window.innerHeight + ')';
  }

  function getTimezone() {
    try { return Intl.DateTimeFormat().resolvedOptions().timeZone; } catch(e){ return 'Unknown'; }
  }

  function getReferrer() {
    return document.referrer || 'Direct / Bookmark';
  }

  function kTime(date) {
    return (date||new Date()).toLocaleString('en-UG', {
      timeZone: 'Africa/Kampala',
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    }) + ' EAT';
  }

  function elapsed(ms) {
    var s = Math.round(ms/1000);
    var m = Math.floor(s/60); s = s%60;
    var h = Math.floor(m/60); m = m%60;
    if (h>0) return h+'h '+m+'m '+s+'s';
    if (m>0) return m+'m '+s+'s';
    return s+'s';
  }

  /* ── Session object ── */
  var SESSION = {
    startTime:   Date.now(),
    browser:     getBrowserInfo(),
    screen:      getScreenInfo(),
    timezone:    getTimezone(),
    referrer:    getReferrer(),
    language:    navigator.language || 'Unknown',
    pagesVisited: [],
    cookiesEnabled: navigator.cookieEnabled,
    doNotTrack:  navigator.doNotTrack === '1',
  };

  /* Load existing nav log from sessionStorage */
  try {
    var existing = JSON.parse(sessionStorage.getItem(PAGES_KEY) || '[]');
    SESSION.pagesVisited = existing;
  } catch(e) {}

  /* Log current page */
  var currentPage = window.location.pathname.split('/').pop() || 'index.html';
  var pageEntry   = { page: currentPage, time: new Date().toISOString() };
  SESSION.pagesVisited.push(pageEntry);
  try { sessionStorage.setItem(PAGES_KEY, JSON.stringify(SESSION.pagesVisited)); } catch(e){}

  /* Persist entry timestamp for first load */
  if (!sessionStorage.getItem(ENTRY_KEY)) {
    sessionStorage.setItem(ENTRY_KEY, new Date().toISOString());
  }

  /* ── Expose globally ── */
  window.CM_SESSION = SESSION;

  window.getSessionDuration = function() {
    return elapsed(Date.now() - SESSION.startTime);
  };

  window.getTotalSessionDuration = function() {
    var start = sessionStorage.getItem(ENTRY_KEY);
    if (!start) return elapsed(Date.now() - SESSION.startTime);
    return elapsed(Date.now() - new Date(start).getTime());
  };

  /* ── Send session exit report to Christopher ── */
  var exitSent = false;
  function sendExitReport() {
    if (exitSent) return;
    exitSent = true;

    var visitor = null;
    try { visitor = JSON.parse(sessionStorage.getItem(SESSION_KEY)); } catch(e) {}
    var name  = (visitor && visitor.name)  || 'Anonymous';
    var email = (visitor && visitor.email) || '(not provided)';

    var startRaw = sessionStorage.getItem(ENTRY_KEY);
    var startTime = startRaw ? new Date(startRaw) : new Date(SESSION.startTime);
    var duration  = elapsed(Date.now() - startTime.getTime());

    var pages = SESSION.pagesVisited.map(function(p){ return p.page; }).join(' → ');

    var body = {
      _subject:          '🔴 Session Ended — ' + name + ' (' + duration + ')',
      '📌 Event':         'SESSION_EXIT',
      '👤 Visitor':       name,
      '📧 Email':         email,
      '🕐 Session Start': kTime(startTime),
      '🚪 Session End':   kTime(new Date()),
      '⏱️ Duration':      duration,
      '📄 Pages Visited': pages,
      '🌐 Browser':       SESSION.browser.browser,
      '💻 OS':            SESSION.browser.os,
      '📱 Device':        SESSION.browser.device,
      '🌍 Timezone':      SESSION.timezone,
      '🔗 Referrer':      SESSION.referrer,
      '📐 Screen':        SESSION.screen,
    };

    navigator.sendBeacon(FORMSPREE, new Blob([JSON.stringify(body)], { type: 'application/json' }));
  }

  window.addEventListener('pagehide',     sendExitReport);
  window.addEventListener('beforeunload', sendExitReport);

})();
