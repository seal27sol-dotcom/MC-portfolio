// © 2026 Christopher Musamali. All rights reserved.

// ── THEME (Light/Dark) ─────────────────────────────────────
(function() {
  var saved = localStorage.getItem('cm-theme');
  if (saved === 'light') document.documentElement.classList.add('light-pending');
})();

function initTheme() {
  var saved = localStorage.getItem('cm-theme');
  if (saved === 'light') document.body.classList.add('light-mode');
}

function toggleTheme() {
  var isLight = document.body.classList.toggle('light-mode');
  localStorage.setItem('cm-theme', isLight ? 'light' : 'dark');
  drawAnalogClock();
}

// ── PAGE TRANSITIONS ─────────────────────────────────────────
(function() {
  function buildOverlay() {
    if (document.getElementById('pt-overlay')) return;
    var div = document.createElement('div');
    div.id = 'pt-overlay';
    div.className = 'page-transition-overlay';
    div.innerHTML = '<div class="pt-bar"></div><div class="pt-logo">CM<span style="color:var(--accent,#14b8a6)">.</span></div>';
    document.body.appendChild(div);
  }

  function playEnter(cb) {
    var ov = document.getElementById('pt-overlay');
    if (!ov) return cb && cb();
    ov.classList.remove('leaving');
    ov.classList.add('entering');
    ov.style.pointerEvents = 'all';
    setTimeout(function() { if (cb) cb(); }, 420);
  }

  function playLeave() {
    var ov = document.getElementById('pt-overlay');
    if (!ov) return;
    ov.classList.remove('entering');
    ov.classList.add('leaving');
    ov.style.pointerEvents = 'none';
  }

  document.addEventListener('DOMContentLoaded', function() {
    buildOverlay();
    // Reveal: slide out on load
    var ov = document.getElementById('pt-overlay');
    if (ov) {
      ov.classList.add('entering');
      ov.style.pointerEvents = 'none';
      requestAnimationFrame(function() {
        setTimeout(function() {
          ov.classList.remove('entering');
          ov.classList.add('leaving');
        }, 60);
      });
    }

    // Intercept local nav clicks
    document.addEventListener('click', function(e) {
      var a = e.target.closest('a');
      if (!a) return;
      var href = a.getAttribute('href');
      if (!href) return;
      // Skip: external, hash-only, javascript:, download links
      if (a.hasAttribute('download')) return;
      if (href.startsWith('http') || href.startsWith('mailto') || href.startsWith('tel')) return;
      if (href.startsWith('#')) return;
      if (href.startsWith('javascript')) return;
      // It's a local page link — animate
      e.preventDefault();
      playEnter(function() {
        window.location.href = href;
      });
    });
  });

  // On page show (back-forward cache), reset overlay
  window.addEventListener('pageshow', function(e) {
    if (e.persisted) playLeave();
  });
})();

// ── CLOCK ──────────────────────────────────────────────────
var clockMode = localStorage.getItem('cm-clock') || 'digital'; // 'digital' | 'analog'

function updateDigitalClock() {
  var el = document.getElementById('clock-digital-text');
  if (!el) return;
  var now = new Date();
  var timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  var tzShort = now.toLocaleTimeString([], { timeZoneName: 'short' }).split(' ').pop();
  el.innerHTML = '<i class="fa-regular fa-clock"></i>\u2009' + timeStr + '\u00A0<span class="clock-tz">' + tzShort + '</span>';
}

function drawAnalogClock() {
  var canvas = document.getElementById('clock-analog-canvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var size = canvas.width;
  var cx = size / 2, cy = size / 2, r = size / 2 - 2;
  var now = new Date();
  var isLight = document.body.classList.contains('light-mode');

  var bgColor     = isLight ? '#e8edf4' : '#152038';
  var faceColor   = isLight ? '#ffffff' : '#0e1729';
  var tickColor   = isLight ? '#94a3b8' : '#4a5a74';
  var accentColor = isLight ? '#0d9488' : '#14b8a6';
  var handColor   = isLight ? '#0f172a' : '#e2e8f0';
  var secColor    = '#ef4444';

  ctx.clearRect(0, 0, size, size);
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = faceColor; ctx.fill();
  ctx.strokeStyle = accentColor; ctx.lineWidth = 1.5; ctx.stroke();

  for (var i = 0; i < 12; i++) {
    var angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle) * (r - 3), cy + Math.sin(angle) * (r - 3));
    ctx.lineTo(cx + Math.cos(angle) * (r - 7), cy + Math.sin(angle) * (r - 7));
    ctx.strokeStyle = tickColor; ctx.lineWidth = 1.5; ctx.stroke();
  }

  var h = now.getHours() % 12, m = now.getMinutes(), s = now.getSeconds();
  var hAngle = ((h + m/60) / 12) * Math.PI * 2 - Math.PI / 2;
  var mAngle = ((m + s/60) / 60) * Math.PI * 2 - Math.PI / 2;
  var sAngle = (s / 60) * Math.PI * 2 - Math.PI / 2;

  function drawHand(a, l, w, c) {
    ctx.beginPath(); ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(a) * l, cy + Math.sin(a) * l);
    ctx.strokeStyle = c; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.stroke();
  }
  drawHand(hAngle, r * 0.45, 2.5, handColor);
  drawHand(mAngle, r * 0.62, 1.8, handColor);
  drawHand(sAngle, r * 0.68, 1,   secColor);
  ctx.beginPath(); ctx.arc(cx, cy, 2.5, 0, Math.PI * 2);
  ctx.fillStyle = accentColor; ctx.fill();
}

function applyClockMode() {
  var widget = document.getElementById('clock-widget');
  if (!widget) return;
  if (clockMode === 'analog') widget.classList.add('analog-mode');
  else widget.classList.remove('analog-mode');
}

function toggleClock() {
  clockMode = (clockMode === 'digital') ? 'analog' : 'digital';
  localStorage.setItem('cm-clock', clockMode);
  applyClockMode();
  var btn = document.getElementById('clock-toggle-btn');
  if (btn) btn.title = clockMode === 'digital' ? 'Switch to Analog' : 'Switch to Digital';
}

function tickClock() {
  updateDigitalClock();
  if (clockMode === 'analog') drawAnalogClock();
}

// ── ACTIVE NAV ───────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  initTheme();
  applyClockMode();
  updateDigitalClock();
  if (clockMode === 'analog') drawAnalogClock();
  setInterval(tickClock, 1000);

  var cur = window.location.pathname.replace(/\/$/, '').split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(function(a) {
    var href = a.getAttribute('href').replace(/\/$/, '').split('/').pop() || 'index.html';
    if (href === cur) a.classList.add('active');
  });

  var toggle = document.getElementById('navToggle');
  var links  = document.getElementById('navLinks');
  if (toggle && links) {
    function closeNav() { links.classList.remove('open'); toggle.classList.remove('open'); toggle.setAttribute('aria-expanded','false'); }
    toggle.addEventListener('click', function(e) { e.stopPropagation(); var open = links.classList.toggle('open'); toggle.classList.toggle('open', open); toggle.setAttribute('aria-expanded', open); });
    links.querySelectorAll('a').forEach(function(a){ a.addEventListener('click', closeNav); });
    document.addEventListener('click', function(e){ if (links.classList.contains('open') && !links.contains(e.target) && !toggle.contains(e.target)) closeNav(); });
  }

  // ── ARTICLE DOWNLOAD: 1-per-article limit ──────────────────
  initArticleDownload();
});

// ── ARTICLE DOWNLOAD SYSTEM ──────────────────────────────────
function getArticleKey() {
  // Use the current page filename as the unique article id
  return 'cm-dl-' + (window.location.pathname.split('/').pop() || 'index.html');
}

function initArticleDownload() {
  var btn = document.getElementById('article-download-btn');
  if (!btn) return;
  var key = getArticleKey();
  if (localStorage.getItem(key) === '1') {
    markButtonUsed(btn);
  }
}

function markButtonUsed(btn) {
  btn.classList.add('btn-pdf--used');
  btn.classList.remove('btn-pdf--loading');
  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-check"></i> Already Downloaded';
  // Update sub-label if present
  var sub = document.getElementById('article-download-sub');
  if (sub) sub.textContent = 'You have already downloaded this article.';
}

function downloadArticleAsPDF(btn) {
  var key = getArticleKey();

  // Guard: already downloaded
  if (localStorage.getItem(key) === '1') {
    markButtonUsed(btn);
    return;
  }

  // Loading state
  btn.disabled = true;
  btn.classList.add('btn-pdf--loading');
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Generating\u2026';

  function loadScript(src) {
    return new Promise(function(res, rej) {
      if (document.querySelector('script[src="' + src + '"]')) return res();
      var s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = rej;
      document.head.appendChild(s);
    });
  }

  loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js').then(function() {
    var jsPDF = window.jspdf.jsPDF;
    var doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
    var pageW = doc.internal.pageSize.getWidth();
    var pageH = doc.internal.pageSize.getHeight();
    var margin = 50; var contentW = pageW - margin * 2;
    var title  = (document.querySelector('.blog-article-header h1') || {}).innerText || document.title;
    var byline = (document.querySelector('.byline-name') || {}).innerText || 'Musamali Christopher';
    var date   = (document.querySelector('.blog-date') || {}).innerText || '';
    var article = document.querySelector('.blog-article-body');

    doc.setFillColor(14,116,144); doc.rect(0,0,pageW,10,'F');
    doc.setFont('helvetica','bold'); doc.setFontSize(17); doc.setTextColor(10,20,40);
    var titleLines = doc.splitTextToSize(title, contentW);
    doc.text(titleLines, margin, 40);
    var y = 40 + titleLines.length * 21;
    doc.setFont('helvetica','italic'); doc.setFontSize(9.5); doc.setTextColor(80,105,135);
    doc.text('By ' + byline + '   \u2022   ' + date, margin, y + 10); y += 28;
    doc.setDrawColor(20,184,166); doc.setLineWidth(1.4); doc.line(margin, y, pageW-margin, y); y += 18;
    doc.setFont('helvetica','normal'); doc.setFontSize(10.5); doc.setTextColor(28,42,58);

    function addFooter() {
      doc.setFillColor(14,116,144); doc.rect(0,pageH-8,pageW,8,'F');
      doc.setFont('helvetica','normal'); doc.setFontSize(7.5); doc.setTextColor(110,130,155);
      doc.text('\u00A9 2026 Christopher Musamali  \u2022  christophermusamali27@gmail.com  \u2022  lakers-tech.wuaze.com', margin, pageH-13);
    }

    var clone = article.cloneNode(true);
    // Remove the download section from PDF content
    clone.querySelectorAll('.article-download-end, .article-downloadable-tag').forEach(function(el){ el.remove(); });
    clone.querySelectorAll('h2').forEach(function(h){ h.replaceWith(document.createTextNode('\n\n\u2015 ' + h.innerText.toUpperCase() + '\n')); });
    clone.querySelectorAll('h3').forEach(function(h){ h.replaceWith(document.createTextNode('\n' + h.innerText + '\n')); });
    clone.querySelectorAll('li').forEach(function(li){ li.replaceWith(document.createTextNode('  \u2022 ' + li.innerText + '\n')); });
    var rawText = clone.innerText.replace(/\n{3,}/g,'\n\n').trim();
    var lines = doc.splitTextToSize(rawText, contentW);

    lines.forEach(function(line) {
      if (y > pageH - 70) { addFooter(); doc.addPage(); doc.setFillColor(14,116,144); doc.rect(0,0,pageW,10,'F'); y=40; doc.setFont('helvetica','normal'); doc.setFontSize(10.5); doc.setTextColor(28,42,58); }
      var isHd = line.startsWith('\u2015 ');
      if(isHd){ doc.setFont('helvetica','bold'); doc.setFontSize(11.5); doc.setTextColor(14,116,144); }
      doc.text(line, margin, y);
      y += isHd ? 20 : 15;
      if(isHd){ doc.setFont('helvetica','normal'); doc.setFontSize(10.5); doc.setTextColor(28,42,58); }
    });
    addFooter();

    var safeTitle = title.replace(/[^a-z0-9]/gi,'_').toLowerCase().slice(0,40);
    doc.save(safeTitle + '__christopher_musamali.pdf');

    // Mark as downloaded — 1 download per article
    localStorage.setItem(key, '1');
    markButtonUsed(btn);

  }).catch(function() {
    btn.disabled = false;
    btn.classList.remove('btn-pdf--loading');
    btn.innerHTML = '<i class="fa-solid fa-file-pdf"></i> Download as PDF';
    alert('PDF generation failed. Please try again.');
  });
}
