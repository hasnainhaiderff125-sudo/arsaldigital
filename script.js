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

// ===== Packages page: tier + duration pricing (PKR only) =====
const PLANS = {
  basic:{
    label:'Basic', color:'var(--sky)',
    features:['8,000+ Live Channels','40,000+ Movies','2,000+ Series','M3U + Xtream Codes','24/7 WhatsApp Support'],
    durations:[
      {label:'1 Month', pkr:450},
      {label:'3 Months', pkr:1100},
      {label:'6 Months', pkr:2000},
      {label:'1 Year', pkr:3500},
    ]
  },
  standard:{
    label:'Standard', color:'var(--accent)',
    features:['12,000+ Live Channels','50,000+ Movies','8,000+ Series','M3U + Xtream Codes','Priority WhatsApp Support'],
    durations:[
      {label:'1 Month', pkr:650},
      {label:'3 Months', pkr:1700},
      {label:'6 Months', pkr:3000},
      {label:'1 Year', pkr:5500},
    ]
  },
  premium:{
    label:'Premium', color:'var(--amber)',
    features:['14,000+ Live Channels','100,000+ Movies','12,000+ Series','M3U + Xtream Codes','Dedicated VIP Support'],
    durations:[
      {label:'1 Month', pkr:900},
      {label:'3 Months', pkr:2300},
      {label:'6 Months', pkr:4000},
      {label:'1 Year', pkr:7000},
    ]
  }
};
const WA_NUMBER = '923195981362';

function renderPricingGrid(planKey, gridId){
  const plan = PLANS[planKey];
  const grid = document.getElementById(gridId);
  if(!grid || !plan) return;
  const featured = 3; // 1-year highlighted (Best Value)
  grid.innerHTML = plan.durations.map((d,i)=>`
    <div class="plan-card ${i===featured?'feat':''} reveal">
      ${i===featured?'<div class="plan-badge">Best Value</div>':''}
      <div class="plan-name" style="color:${plan.color}">${plan.label} Plan</div>
      <div class="plan-name" style="font-size:14px;opacity:.65;margin-top:2px;font-weight:600">${d.label}</div>
      <div class="plan-price">
        <span class="plan-cur">PKR</span><span class="plan-amt">${d.pkr.toLocaleString('en-US')}</span>
      </div>
      <div class="plan-div" style="margin:14px 0 10px"></div>
      <ul class="plan-feats">
        ${plan.features.map(f=>`<li><span class="chk">&#10003;</span>${f}</li>`).join('')}
      </ul>
      <a href="https://wa.me/${WA_NUMBER}?text=${encodeURIComponent('Hi, I want the '+plan.label+' Plan – '+d.label+' (PKR '+d.pkr.toLocaleString('en-US')+')')}" class="btn-plan ${i===featured?'fil':'out'}" target="_blank">Order on WhatsApp</a>
    </div>
  `).join('');
  document.querySelectorAll('.tier-btn').forEach(btn=>{
    const k = btn.getAttribute('data-tier');
    if(!k) return;
    if(k===planKey){ btn.classList.add('active'); btn.style.background = plan.color; btn.style.borderColor='transparent'; }
    else{ btn.classList.remove('active'); btn.style.background='var(--card)'; btn.style.borderColor='var(--border2)'; }
  });
  initReveal();
}

function initPricing(defaultTier, gridId){
  renderPricingGrid(defaultTier, gridId);
  document.querySelectorAll('.tier-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const k = btn.getAttribute('data-tier');
      if(k) renderPricingGrid(k, gridId);
    });
  });
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
