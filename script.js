// ===== Mobile menu =====
function toggleMenu(){
  const m = document.getElementById('mobileMenu');
  if(!m) return;
  const open = m.classList.toggle('open');
  const b = document.querySelector('.hamburger');
  if(b){ b.setAttribute('aria-expanded', open ? 'true' : 'false'); b.setAttribute('aria-controls','mobileMenu'); }
}
// Menu: Escape closes it, and it closes after choosing a link
document.addEventListener('keydown', e=>{ if(e.key==='Escape'){ const m=document.getElementById('mobileMenu'); if(m && m.classList.contains('open')){ toggleMenu(); const b=document.querySelector('.hamburger'); if(b) b.focus(); } } });

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
  const qs = document.querySelectorAll('.faq-q');
  qs.forEach((q,i)=>{
    // Questions are plain <div>s in the markup; give them button semantics so keyboard and screen-reader users can open them
    const item = q.closest('.faq-item'); const ans = item && item.querySelector('.faq-ans');
    q.setAttribute('role','button'); q.setAttribute('tabindex','0'); q.setAttribute('aria-expanded','false');
    if(ans){ if(!ans.id) ans.id = 'faq-a-' + i; q.setAttribute('aria-controls', ans.id); }
    const toggle = ()=>{
      const wasOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(x=>{ x.classList.remove('open'); const qq=x.querySelector('.faq-q'); if(qq) qq.setAttribute('aria-expanded','false'); });
      if(!wasOpen){ item.classList.add('open'); q.setAttribute('aria-expanded','true'); }
    };
    q.addEventListener('click', toggle);
    q.addEventListener('keydown', e=>{ if(e.key==='Enter' || e.key===' '){ e.preventDefault(); toggle(); } });
  });
}

// ===== Packages page: plan + duration picker =====
// Pure UI state. It NEVER writes to the URL (no hash, no pushState/replaceState writes of a fragment).
// Prices, features and the WhatsApp message all come from one data block (#plan-data), so they cannot disagree.
function initPlanPicker(){
  const root = document.getElementById('plan-picker');
  const dataEl = document.getElementById('plan-data');
  if(!root || !dataEl) return;
  let D; try{ D = JSON.parse(dataEl.textContent); }catch(e){ return; }
  const TIERS = ['basic','standard','premium'];
  const tabs = Array.from(root.querySelectorAll('.tier-btn[data-tier]'));
  const radios = Array.from(root.querySelectorAll('.dur-btn[data-dur]'));
  const panel = document.getElementById('plan-result');
  const card = panel.querySelector('.sel-card');
  const $ = k => panel.querySelector('[data-bind="'+k+'"]');
  const fmt = n => n.toLocaleString('en-US');
  let state = { plan:'standard', dur:0 };

  function render(animate){
    const P = D.plans[state.plan], i = state.dur, price = P.prices[i], months = D.dur[i].months, label = D.dur[i].label;
    root.setAttribute('data-plan', state.plan);
    tabs.forEach(t=>{ const on = t.dataset.tier===state.plan; t.setAttribute('aria-selected', on?'true':'false'); t.tabIndex = on?0:-1; if(on) panel.setAttribute('aria-labelledby', t.id); });
    radios.forEach(r=>{ const k = +r.dataset.dur, on = k===i; r.setAttribute('aria-checked', on?'true':'false'); r.tabIndex = on?0:-1;
      const sm = r.querySelector('[data-dur-price]'); if(sm) sm.textContent = 'PKR ' + fmt(P.prices[k]); });
    $('kicker').hidden = !P.popular;
    $('title').textContent = P.name + ' Plan';
    $('best').textContent = P.best;
    const ul = $('feats'); ul.innerHTML = '';
    P.feats.forEach(f=>{ const li = document.createElement('li'); const c = document.createElement('span'); c.className='chk'; c.setAttribute('aria-hidden','true'); c.innerHTML='&#10003;'; li.appendChild(c); li.appendChild(document.createTextNode(f)); ul.appendChild(li); });
    $('dur').textContent = label;
    $('amt').textContent = fmt(price);
    if(months===1){ $('per').textContent = 'PKR ' + fmt(price) + ' per month'; $('save').hidden = true; }
    else{
      $('per').textContent = 'About PKR ' + fmt(Math.round(price/months)) + ' per month';
      const saved = P.prices[0]*months - price;
      if(saved>0){ $('save').textContent = 'Save PKR ' + fmt(saved) + ' compared with paying monthly'; $('save').hidden = false; } else { $('save').hidden = true; }
    }
    $('ctatext').textContent = 'Get ' + P.name + ' \u2013 ' + label;
    $('cta').href = D.wa + encodeURIComponent('Hi, I want the ' + P.name + ' Plan \u2013 ' + label + ' (PKR ' + fmt(price) + ')');
    $('cta').setAttribute('aria-label', 'Order the ' + P.name + ' Plan, ' + label + ', PKR ' + fmt(price) + ', on WhatsApp');
    if(animate && !window.matchMedia('(prefers-reduced-motion: reduce)').matches){ card.classList.remove('is-in'); void card.offsetWidth; card.classList.add('is-in'); }
  }
  function setPlan(k, focus){ if(!TIERS.includes(k)) return; state.plan = k; render(true); if(focus){ const t = tabs.find(x=>x.dataset.tier===k); if(t) t.focus(); } }
  function setDur(i, focus){ if(i<0 || i>=D.dur.length) return; state.dur = i; render(true); if(focus){ const r = radios[i]; if(r) r.focus(); } }

  tabs.forEach((t,idx)=>{
    t.addEventListener('click', ()=>setPlan(t.dataset.tier));
    t.addEventListener('keydown', e=>{
      let j = null;
      if(e.key==='ArrowRight'||e.key==='ArrowDown') j=(idx+1)%tabs.length;
      else if(e.key==='ArrowLeft'||e.key==='ArrowUp') j=(idx-1+tabs.length)%tabs.length;
      else if(e.key==='Home') j=0; else if(e.key==='End') j=tabs.length-1;
      if(j!==null){ e.preventDefault(); setPlan(tabs[j].dataset.tier, true); }
    });
  });
  radios.forEach((r,idx)=>{
    r.addEventListener('click', ()=>setDur(idx));
    r.addEventListener('keydown', e=>{
      let j = null;
      if(e.key==='ArrowRight'||e.key==='ArrowDown') j=(idx+1)%radios.length;
      else if(e.key==='ArrowLeft'||e.key==='ArrowUp') j=(idx-1+radios.length)%radios.length;
      else if(e.key==='Home') j=0; else if(e.key==='End') j=radios.length-1;
      if(j!==null){ e.preventDefault(); setDur(j, true); }
    });
  });
  // "See Basic/Standard/Premium prices" buttons in the decision helper
  document.querySelectorAll('[data-pick-plan]').forEach(b=>b.addEventListener('click', ()=>{
    setPlan(b.getAttribute('data-pick-plan'));
    const target = document.getElementById('plans'); if(target) target.scrollIntoView({behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block:'start'});
  }));

  // Starting plan: a choice made on another page (sessionStorage), or an old link such as packages.html#premium.
  // Either way the address bar is cleaned to plain packages.html (no reload, no history entry).
  let start = null;
  try{ start = sessionStorage.getItem('arsal-plan'); sessionStorage.removeItem('arsal-plan'); }catch(e){}
  const legacy = (location.hash||'').replace('#','');
  if(TIERS.includes(legacy)) start = legacy;
  if(location.hash){ try{ history.replaceState(null,'',location.pathname+location.search); }catch(e){} }
  if(TIERS.includes(start)) state.plan = start;
  render(false);
}

// Links on other pages that should open packages.html with a plan pre-selected, without a #fragment in the URL
function initPlanLinks(){
  document.addEventListener('click', e=>{
    const a = e.target.closest && e.target.closest('a[data-plan]');
    if(!a || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    try{ sessionStorage.setItem('arsal-plan', a.getAttribute('data-plan')); }catch(err){}
  });
}

document.addEventListener('DOMContentLoaded', ()=>{
  initReveal();
  initFAQ();
  initPlanPicker();
  initPlanLinks();
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


// ===== Floating WhatsApp buttons: step aside only while they would cover a pricing/order button =====
(function(){
  var floats = Array.prototype.slice.call(document.querySelectorAll('.wa-float,.wa-channel'));
  if(!floats.length) return;
  var targets = document.querySelectorAll('.btn-plan,.plan-alt,.dur-btn,.tier-btn,.dev-chip,[data-pick-plan],.btn-primary,.btn-secondary,.btn-whatsapp,.cta-banner a,.hero-actions a,.trial-note a');
  if(!targets.length) return;
  var ticking = false, pad = 8;
  function overlaps(a,b){ return !(a.right+pad < b.left || a.left-pad > b.right || a.bottom+pad < b.top || a.top-pad > b.bottom); }
  function check(){
    ticking = false;
    var rects = [];
    targets.forEach(function(t){
      var r = t.getBoundingClientRect();
      if(r.bottom > 0 && r.top < window.innerHeight && r.width > 0) rects.push(r);
    });
    floats.forEach(function(f){
      var fr = f.getBoundingClientRect(), hit = false;
      for(var i=0;i<rects.length;i++){ if(overlaps(fr,rects[i])){ hit = true; break; } }
      f.classList.toggle('fl-hide', hit);
    });
  }
  function req(){ if(!ticking){ ticking = true; requestAnimationFrame(check); } }
  window.addEventListener('scroll', req, {passive:true});
  window.addEventListener('resize', req);
  window.addEventListener('load', req);
  document.addEventListener('click', function(e){ if(e.target.closest && e.target.closest('.tier-btn,.dur-btn')) setTimeout(req, 80); });
  req();
})();
