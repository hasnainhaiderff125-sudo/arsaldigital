// ===== Mobile menu =====
function toggleMenu(){
  const m = document.getElementById('mobileMenu');
  if(m) m.classList.toggle('open');
}

// ===== Scroll reveal =====
function initReveal(){
  const els = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('visible'); io.unobserve(e.target); } });
  },{threshold:0.12});
  els.forEach(el=>io.observe(el));
}

// ===== FAQ accordion =====
function initFAQ(){
  document.querySelectorAll('.faq-q').forEach(q=>{
    q.addEventListener('click', ()=>{
      const item = q.closest('.faq-item');
      const wasOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(i=>i.classList.remove('open'));
      if(!wasOpen) item.classList.add('open');
    });
  });
}

// ===== Packages page: tier toggle (pricing is static HTML; this only shows/hides panels) =====
const TIER_COLORS = { basic:'var(--sky)', standard:'var(--accent)', premium:'var(--amber)' };

function showTier(tierKey){
  document.querySelectorAll('[data-tier-panel]').forEach(panel=>{
    panel.style.display = (panel.getAttribute('data-tier-panel')===tierKey) ? '' : 'none';
  });
  document.querySelectorAll('.tier-btn').forEach(btn=>{
    const k = btn.getAttribute('data-tier');
    if(!k) return;
    if(k===tierKey){ btn.classList.add('active'); btn.style.background = TIER_COLORS[k]; btn.style.borderColor='transparent'; }
    else{ btn.classList.remove('active'); btn.style.background='var(--card)'; btn.style.borderColor='var(--border2)'; }
  });
}

function initTierToggle(){
  document.querySelectorAll('.tier-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const k = btn.getAttribute('data-tier');
      if(k) showTier(k);
    });
  });
  // If the page was opened at #basic / #standard / #premium, show that tier
  const hash = (location.hash || '').replace('#','');
  if(['basic','standard','premium'].includes(hash)) showTier(hash);
}

document.addEventListener('DOMContentLoaded', ()=>{
  initReveal();
  initFAQ();
});


// ===== Theme switch (light / dark) =====
(function(){
  var KEY='arsal-theme', root=document.documentElement, busy=false;
  var reduce=window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function saved(){ try{ return localStorage.getItem(KEY); }catch(e){ return null; } }
  function current(){ return root.getAttribute('data-theme')==='dark' ? 'dark' : 'light'; }
  function sync(t){
    var b=document.querySelector('.theme-toggle');
    if(b){
      b.setAttribute('aria-pressed', t==='dark' ? 'true' : 'false');
      var label = t==='dark' ? 'Switch to light mode' : 'Switch to dark mode';
      b.setAttribute('aria-label', label); b.setAttribute('title', label);
    }
    var m=document.querySelector('meta[name="theme-color"]');
    if(m){ if(!m.getAttribute('data-light')) m.setAttribute('data-light', m.getAttribute('content')); m.setAttribute('content', t==='dark' ? '#0A120E' : m.getAttribute('data-light')); }
  }
  function apply(t){ if(t==='dark') root.setAttribute('data-theme','dark'); else root.setAttribute('data-theme','light'); sync(t); }
  function set(t, x, y){
    if(t===current() || busy) return;
    try{ localStorage.setItem(KEY,t); }catch(e){}
    if(reduce){ apply(t); return; }
    busy=true; var done=function(){ busy=false; root.classList.remove('theme-anim'); };
    if(document.startViewTransition){
      var r=Math.hypot(Math.max(x,innerWidth-x), Math.max(y,innerHeight-y));
      var vt=document.startViewTransition(function(){ apply(t); });
      vt.ready.then(function(){
        root.animate({clipPath:['circle(0px at '+x+'px '+y+'px)','circle('+r+'px at '+x+'px '+y+'px)']},
          {duration:750,easing:'cubic-bezier(.4,0,.2,1)',pseudoElement:'::view-transition-new(root)'});
      }).catch(function(){});
      vt.finished.then(done,done);
    }else{
      root.classList.add('theme-anim'); apply(t); setTimeout(done,650);
    }
  }
  function init(){
    sync(current());
    var b=document.querySelector('.theme-toggle');
    if(!b) return;
    b.addEventListener('click', function(){
      var rc=b.getBoundingClientRect();
      set(current()==='dark' ? 'light' : 'dark', rc.left+rc.width/2, rc.top+rc.height/2);
    });
  }
  window.addEventListener('storage', function(e){ if(e.key===KEY && e.newValue && e.newValue!==current()) apply(e.newValue); });
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
