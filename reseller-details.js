/* Reseller brand details dialog. Cards stay normal links (works without JS); with JS they open an animated panel. */
(function () {
  var dlg = document.getElementById('brandDialog');
  var dataEl = document.getElementById('brand-data');
  if (!dlg || !dataEl || typeof dlg.showModal !== 'function') return;
  var DATA = JSON.parse(dataEl.textContent);
  var panel = dlg.querySelector('.rb-panel');
  var logoBox = dlg.querySelector('.rb-mlogo');
  var title = dlg.querySelector('#rbTitle');
  var body = dlg.querySelector('.rb-body');
  var wa = dlg.querySelector('.rb-wa');
  var full = dlg.querySelector('.rb-full');
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var lastCard = null, closing = false, timer = null;

  function offsetTo(card) {
    var r = card.getBoundingClientRect(), p = panel.getBoundingClientRect();
    var inView = r.bottom > 0 && r.top < window.innerHeight;
    if (!inView) return null;
    var dx = (r.left + r.width / 2) - (p.left + p.width / 2);
    var dy = (r.top + r.height / 2) - (p.top + p.height / 2);
    return 'translate(' + dx + 'px,' + dy + 'px) scale(' + Math.min(r.width / p.width, 1) + ')';
  }

  function open(slug, card) {
    var d = DATA[slug], tpl = document.getElementById('rb-tpl-' + slug);
    if (!d || !tpl) return false;
    clearTimeout(timer); closing = false;
    lastCard = card || null;
    title.textContent = d.name;
    var src = card && card.querySelector('.rb-logo');
    logoBox.className = src ? src.className : 'rb-logo';
    logoBox.innerHTML = src ? src.innerHTML : '';
    body.innerHTML = '';
    body.appendChild(tpl.content.cloneNode(true));
    Array.prototype.forEach.call(body.querySelectorAll('.rb-details > *'), function (el, i) {
      el.classList.add('rb-anim'); el.style.setProperty('--d', (0.14 + i * 0.07) + 's');
    });
    wa.href = d.wa; full.href = d.page;
    full.textContent = 'View full ' + d.name + ' page';
    if (!dlg.open) dlg.showModal();
    root.classList.add('rb-lock');
    panel.scrollTop = 0;
    if (!reduce && card) {
      var t = offsetTo(card);
      if (t) { panel.style.transition = 'none'; panel.style.transform = t; void panel.offsetWidth; panel.style.transition = ''; }
    }
    requestAnimationFrame(function () { dlg.classList.add('is-in'); });
    return true;
  }

  function close() {
    if (closing || !dlg.open) return;
    closing = true;
    if (!reduce && lastCard) { var t = offsetTo(lastCard); if (t) panel.style.transform = t; }
    dlg.classList.remove('is-in');
    timer = setTimeout(function () { dlg.close(); }, reduce ? 160 : 400);
  }

  dlg.addEventListener('close', function () {
    closing = false; panel.style.transform = ''; root.classList.remove('rb-lock');
    if (lastCard) lastCard.focus({ preventScroll: true });
  });
  dlg.addEventListener('cancel', function (e) { e.preventDefault(); close(); });
  dlg.addEventListener('click', function (e) { if (e.target === dlg) close(); });
  dlg.querySelector('.rb-close').addEventListener('click', close);

  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a.rb-card[data-brand]');
    if (!a || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (open(a.getAttribute('data-brand'), a)) e.preventDefault();
  });

  // Legacy #brand links open that brand once, then the fragment is removed. The popup itself never changes the URL.
  window.addEventListener('load', function () {
    var slug = decodeURIComponent((location.hash || '').slice(1));
    if (!slug || !DATA[slug]) return;
    try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {}
    var card = document.querySelector('a.rb-card[data-brand="' + slug + '"]');
    if (card) open(slug, card);
  });
})();
