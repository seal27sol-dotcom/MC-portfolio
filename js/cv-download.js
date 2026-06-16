/**
 * cv-download.js — Christopher Musamali Portfolio
 */
(function () {
  'use strict';

  function cfg(k){ return (window.ENV && window.ENV[k]) || ''; }
  var FORMSPREE = cfg('FORMSPREE_ENDPOINT') || 'https://formspree.io/f/xnjyrjlq';
  var _name=null, _email=null, _code=null, _expiry=null;

  function el(id)        { return document.getElementById(id); }
  function val(id)       { var e=el(id); return e?e.value.trim():''; }
  function show(id)      { var e=el(id); if(e) e.style.display=''; }
  function hide(id)      { var e=el(id); if(e) e.style.display='none'; }
  function setText(id,t) { var e=el(id); if(e) e.textContent=t; }
  function showErr(id,m) { var e=el(id); if(e){e.textContent=m;e.style.display='block';} }
  function hideErr(id)   { var e=el(id); if(e) e.style.display='none'; }
  function generateCode(){ return String(Math.floor(100000+Math.random()*900000)); }
  function kTime(){
    return new Date().toLocaleString('en-UG',{
      timeZone:'Africa/Kampala',weekday:'long',year:'numeric',
      month:'long',day:'numeric',hour:'2-digit',minute:'2-digit'
    })+' EAT';
  }

  /**
   * getCVPath()
   * ─────────────────────────────────────────────────────────────
   * Finds the CV PDF relative to the CURRENT page's location.
   * Works on XAMPP (subfolder), live hosting, any depth.
   *
   * Strategy: walk from the current page's directory UP to the
   * folder that contains "assets/", then append the CV path.
   *
   * The site root always has: assets/, css/, js/, pages/, index.html
   * We detect it by counting path segments above the current file.
   */
  function getCVPath(){
    var pathname = window.location.pathname;  // e.g. /christopher%20potfolio/pages/about.html

    // Split on "/" and remove empty segments
    var segments = pathname.split('/').filter(function(s){ return s.length > 0; });

    // The last segment is the current filename (index.html, about.html, etc.)
    // Count how many directory levels we are BELOW the site root.
    // The site root = the folder containing index.html, assets/, pages/, js/, css/
    //
    // Structure:
    //   /christopher potfolio/index.html          → 1 folder deep in server, file at depth 0 in site
    //   /christopher potfolio/pages/about.html    → file is 1 level below site root
    //   /christopher potfolio/pages/blog/x.html  → file is 2 levels below site root

    var filename = segments[segments.length - 1] || '';
    var hasExtension = filename.indexOf('.') > -1;
    // Directory segments (without the filename)
    var dirSegments = hasExtension ? segments.slice(0, -1) : segments;

    // Find which segment is "pages" or "blog" — these are known sub-dirs of site root
    // Everything above "pages" is the server path to the site root (e.g. "christopher potfolio")
    var knownSubdirs = ['pages', 'blog'];
    var siteRootDepth = 0; // how many levels BELOW site root the current file is

    for (var i = dirSegments.length - 1; i >= 0; i--) {
      var seg = decodeURIComponent(dirSegments[i]).toLowerCase();
      if (knownSubdirs.indexOf(seg) > -1) {
        siteRootDepth++;
      } else {
        break;
      }
    }

    // Build the relative path back to the site root, then to the CV
    var prefix = '';
    for (var j = 0; j < siteRootDepth; j++) prefix += '../';
    return prefix + 'assets/docs/Musamali_Christopher_CV.pdf';
  }

  /* ── Trigger download ── */
  function triggerDownload(){
    var cvPath = getCVPath();
    console.log('[CV] Downloading from path:', cvPath, '| Full URL:', window.location.origin + window.location.pathname.replace(/[^/]*$/, '') + cvPath);

    var a = document.createElement('a');
    a.href     = cvPath;
    a.download = 'Musamali_Christopher_CV.pdf';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Fallback: show a direct clickable link after 1.5s in case browser blocked auto-download
    setTimeout(function(){
      var step3 = el('cvStep3');
      if(!step3) return;
      if(document.getElementById('cvDirectLink')) return;
      var p = document.createElement('p');
      p.style.cssText = 'margin-top:14px;font-size:.84rem;text-align:center;';
      p.innerHTML = '<a id="cvDirectLink" href="'+cvPath+'" download="Musamali_Christopher_CV.pdf" '+
        'style="color:var(--accent,#14b8a6);font-weight:700;text-decoration:underline;">' +
        '<i class="fa-solid fa-download"></i> Click here if download didn\'t start automatically</a>';
      step3.appendChild(p);
    }, 1500);
  }

  /* ── EmailJS ── */
  function loadEmailJSSDK(cb){
    if(window.emailjs){ cb(null); return; }
    var s=document.createElement('script');
    s.src='https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
    s.onload=function(){ cb(null); };
    s.onerror=function(){ cb(new Error('SDK load failed')); };
    document.head.appendChild(s);
  }

  function sendOTPEmail(name,email,code,onDone){
    var service=cfg('EMAILJS_SERVICE'), template=cfg('EMAILJS_TEMPLATE'), key=cfg('EMAILJS_KEY');
    if(!service||!template||!key){ onDone({sent:false,reason:'missing_config'}); return; }
    loadEmailJSSDK(function(err){
      if(err){ onDone({sent:false,reason:'sdk_load'}); return; }
      try{ window.emailjs.init({publicKey:key}); }catch(e){}
      window.emailjs.send(service,template,{
        to_name:name, to_email:email, otp_code:code, expiry:'10 minutes',
        site_name:'Christopher Musamali Portfolio',
        reply_to:cfg('CONTACT_EMAIL')||'christophermusamali27@gmail.com',
      })
      .then(function(r){ console.log('[OTP] Sent:',r.status); onDone({sent:true}); })
      .catch(function(e){ console.error('[OTP] Failed:',e); onDone({sent:false,reason:String(e.text||e)}); });
    });
  }

  function logToChristopher(subject,extra){
    fetch(FORMSPREE,{
      method:'POST',
      headers:{'Accept':'application/json','Content-Type':'application/json'},
      body:JSON.stringify(Object.assign({_subject:subject,'🕐 Time':kTime(),'🌐 Page':window.location.href},extra)),
    }).catch(function(){});
  }

  /* ══════ STEP 1 ══════ */
  window.cvStep1Submit = function(){
    hideErr('cvStep1Err');
    var name=val('cvInputName'), email=val('cvInputEmail');
    if(!name||name.length<2){ showErr('cvStep1Err','Please enter your full name.'); return; }
    if(!email||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){ showErr('cvStep1Err','Please enter a valid email address.'); return; }

    var code=generateCode();
    _name=name; _email=email; _code=code; _expiry=Date.now()+10*60*1000;

    var btn=el('cvStep1Btn');
    if(btn){btn.disabled=true;btn.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i> Sending…';}

    logToChristopher('🔑 CV Requested — '+name+' ('+email+')',{
      '👤 Name':name,'📧 Email':email,'🔑 OTP':code,
      'Message':name+' wants your CV. OTP: '+code,
    });

    sendOTPEmail(name,email,code,function(result){
      if(btn){btn.disabled=false;btn.innerHTML='<i class="fa-solid fa-paper-plane"></i> Send Verification Code';}
      hide('cvStep1'); show('cvStep2');
      setText('cvStep2EmailShown',email);
      if(!result.sent){ show('cvCodeHint'); setText('cvCodeHintVal',code); }
      else             { hide('cvCodeHint'); }
      setTimeout(function(){var c=el('cvCodeInput');if(c)c.focus();},60);
    });
  };

  /* ══════ STEP 2 ══════ */
  window.cvStep2Verify = function(){
    hideErr('cvStep2Err');
    var entered=val('cvCodeInput');
    if(!entered){ showErr('cvStep2Err','Please enter the 6-digit code.'); return; }
    if(Date.now()>_expiry){ showErr('cvStep2Err','Code expired. Click Resend for a new one.'); return; }
    if(entered!==_code){
      logToChristopher('⚠️ Wrong OTP — '+_name,{'👤':_name,'📧':_email,'❌ Entered':entered,'✅ Correct':_code});
      showErr('cvStep2Err','Incorrect code. Please try again.'); return;
    }
    logToChristopher('✅ CV Downloaded — '+_name+' ('+_email+')',{
      '👤 Name':_name,'📧 Email':_email,'📂 Path':getCVPath(),
    });
    hide('cvStep2'); show('cvStep3');
    setTimeout(triggerDownload, 600);
    setTimeout(closeCvModal, 8000);
  };

  window.cvResend=function(){
    var code=generateCode(); _code=code; _expiry=Date.now()+10*60*1000;
    logToChristopher('🔄 OTP Resent — '+_name,{'👤':_name,'📧':_email,'🔑':code});
    sendOTPEmail(_name,_email,code,function(r){
      if(!r.sent){show('cvCodeHint');setText('cvCodeHintVal',code);}
      var btn=el('cvResendBtn');
      if(btn){var o=btn.textContent;btn.textContent='✓ Sent!';btn.disabled=true;
        setTimeout(function(){btn.textContent=o;btn.disabled=false;},3000);}
    });
    if(el('cvCodeInput'))el('cvCodeInput').value='';
    hideErr('cvStep2Err');
  };

  window.openCvModal=function(e){
    if(e)e.preventDefault();
    var ov=el('cvModalOverlay'); if(!ov)return;
    ov.style.display='flex'; resetCvModal();
    setTimeout(function(){var n=el('cvInputName');if(n)n.focus();},80);
    logToChristopher('👁️ CV Modal Opened',{Message:'CV modal opened.'});
  };

  window.closeCvModal=function(){
    var ov=el('cvModalOverlay'); if(ov)ov.style.display='none'; resetCvModal();
  };

  function resetCvModal(){
    show('cvStep1');hide('cvStep2');hide('cvStep3');
    hideErr('cvStep1Err');hideErr('cvStep2Err');hide('cvCodeHint');
    ['cvInputName','cvInputEmail','cvCodeInput'].forEach(function(id){if(el(id))el(id).value='';});
    var btn=el('cvStep1Btn');
    if(btn){btn.disabled=false;btn.innerHTML='<i class="fa-solid fa-paper-plane"></i> Send Verification Code';}
    var dl=document.getElementById('cvDirectLink');
    if(dl&&dl.parentNode)dl.parentNode.removeChild(dl);
    _name=null;_email=null;_code=null;
  }

  document.addEventListener('DOMContentLoaded',function(){
    document.querySelectorAll('.cv-download-btn,[data-cv-download]').forEach(function(b){
      b.addEventListener('click',window.openCvModal);
    });
    var ov=el('cvModalOverlay');
    if(ov)ov.addEventListener('click',function(e){if(e.target===this)closeCvModal();});
    document.addEventListener('keydown',function(e){
      if(e.key==='Escape'&&el('cvModalOverlay')&&el('cvModalOverlay').style.display!=='none')closeCvModal();
    });
    if(el('cvCodeInput')) el('cvCodeInput').addEventListener('keydown', function(e){if(e.key==='Enter')cvStep2Verify();});
    if(el('cvInputEmail'))el('cvInputEmail').addEventListener('keydown',function(e){if(e.key==='Enter')cvStep1Submit();});
    if(el('cvInputName')) el('cvInputName').addEventListener('keydown', function(e){if(e.key==='Enter'){var ei=el('cvInputEmail');if(ei)ei.focus();}});
  });

})();
