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
    features:['12,000+ Live Channels','35,000+ Movies (4K)','6,500+ Series','M3U + Xtream Codes','24/7 WhatsApp Support'],
    durations:[
      {label:'1 Month', pkr:350},
      {label:'3 Months', pkr:950},
      {label:'6 Months', pkr:1750},
      {label:'1 Year', pkr:3000},
    ]
  },
  standard:{
    label:'Standard', color:'var(--accent)',
    features:['14,000+ Live Channels','50,000+ Movies (4K)','12,000+ Series','M3U + Xtream Codes','Priority WhatsApp Support'],
    durations:[
      {label:'1 Month', pkr:550},
      {label:'3 Months', pkr:1450},
      {label:'6 Months', pkr:2650},
      {label:'1 Year', pkr:5000},
    ]
  },
  premium:{
    label:'Premium', color:'var(--amber)',
    features:['16,000+ Live Channels','100,000+ Movies (4K)','20,000+ Series','M3U + Xtream Codes','Dedicated VIP Support'],
    durations:[
      {label:'1 Month', pkr:750},
      {label:'3 Months', pkr:1850},
      {label:'6 Months', pkr:3450},
      {label:'1 Year', pkr:6450},
    ]
  }
};
const WA_NUMBER = '923195981362';

function renderPricingGrid(planKey, gridId){
  const plan = PLANS[planKey];
  const grid = document.getElementById(gridId);
  if(!grid || !plan) return;
  const featured = 2; // 6-month highlighted
  grid.innerHTML = plan.durations.map((d,i)=>`
    <div class="plan-card ${i===featured?'feat':''} reveal">
      ${i===featured?'<div class="plan-badge">Best Value</div>':''}
      <div class="plan-name" style="color:${plan.color}">${plan.label} Plan</div>
      <div class="plan-name" style="font-size:14px;opacity:.65;margin-top:2px;font-weight:600">${d.label}</div>
      <div class="plan-price">
        <span class="plan-cur">PKR</span><span class="plan-amt">${d.pkr.toLocaleString()}</span>
      </div>
      <div class="plan-div" style="margin:14px 0 10px"></div>
      <ul class="plan-feats">
        ${plan.features.map(f=>`<li><span class="chk">&#10003;</span>${f}</li>`).join('')}
      </ul>
      <a href="https://wa.me/${WA_NUMBER}?text=${encodeURIComponent('Hi, I want the '+plan.label+' Plan – '+d.label+' (PKR '+d.pkr.toLocaleString()+')')}" class="btn-plan ${i===featured?'fil':'out'}" target="_blank">Order on WhatsApp</a>
    </div>
  `).join('');
  document.querySelectorAll('.tier-btn').forEach(btn=>{
    const k = btn.getAttribute('data-tier');
    if(!k) return;
    if(k===planKey){ btn.classList.add('active'); btn.style.background = plan.color; btn.style.borderColor='transparent'; }
    else{ btn.classList.remove('active'); btn.style.background='#fff'; btn.style.borderColor='var(--border2)'; }
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
