/* Casa Colección — comportamiento del sitio */
(function () {
  'use strict';
  var C = {};                       // contenido (data/contenido.json)
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function el(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text) n.textContent = text; return n; }
  function get(o, path) { return path.split('.').reduce(function (a, k) { return a == null ? undefined : a[k]; }, o); }

  /* ---------- Navegación ---------- */
  var header = $('#top');
  function onScroll() { var f = ['bg-museo/95', 'backdrop-blur', 'shadow-lg']; f.forEach(function (c) { header.classList.toggle(c, window.scrollY > 40); }); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  var menuBtn = $('#menuBtn'), menu = $('#mobileMenu');
  menuBtn.addEventListener('click', function () { var open = menu.classList.toggle('hidden') === false; menuBtn.setAttribute('aria-expanded', open); });
  $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { menu.classList.add('hidden'); menuBtn.setAttribute('aria-expanded', false); }); });
  if ($('#year')) $('#year').textContent = new Date().getFullYear();

  /* Texto con **negritas** y saltos de línea (sin HTML: seguro) */
  function rich(n, text) {
    n.textContent = '';
    text.split('\n').forEach(function (line, li) {
      if (li) n.appendChild(document.createElement('br'));
      line.split('**').forEach(function (part, i) {
        if (!part) return;
        if (i % 2) { var b = document.createElement('strong'); b.className = 'font-medium'; b.textContent = part; n.appendChild(b); }
        else n.appendChild(document.createTextNode(part));
      });
    });
  }
  /* Listas editables de la página de valuaciones */
  function renderList(box) {
    var arr = get(C, box.getAttribute('data-list')), type = box.getAttribute('data-list-type');
    if (!Array.isArray(arr) || !arr.length) return;
    box.innerHTML = '';
    arr.forEach(function (it, i) {
      var t = it.titulo || '', d = it.descripcion || '', li;
      if (type === 'faq') {
        li = el('details', 'py-6'); var s = el('summary', 'flex items-center justify-between gap-6');
        s.appendChild(el('h3', 'font-display text-xl sm:text-2xl', t)); s.appendChild(el('span', 'plus text-3xl font-light text-bronce', '+'));
        li.appendChild(s); li.appendChild(el('p', 'mt-4 leading-relaxed text-grafito/80', d));
      } else if (type === 'steps') {
        li = el('li', 'border-t border-bronce/40 pt-5'); li.appendChild(el('span', 'font-display text-4xl text-bronce', String(i + 1)));
        li.appendChild(el('h3', 'mt-2 font-display text-2xl text-museo', t)); li.appendChild(el('p', 'mt-2 text-sm leading-relaxed text-grafito/75', d));
      } else {
        var dark = type === 'dark';
        li = el('li', 'border-t pt-5 ' + (dark ? 'border-oro/30' : 'border-bronce/40'));
        li.appendChild(el('h3', 'font-display text-2xl ' + (dark ? 'text-marfil' : 'text-museo'), t));
        li.appendChild(el('p', 'mt-2 text-sm leading-relaxed ' + (dark ? 'text-marfil/65' : 'text-grafito/75'), d));
      }
      box.appendChild(li);
    });
  }

  /* ---------- Textos editables (data/contenido.json) ---------- */
  function applyContent() {
    $$('[data-txt]').forEach(function (n) {
      var v = get(C, n.getAttribute('data-txt'));
      if (typeof v === 'string' && v.trim() !== '') { if (n.hasAttribute('data-rich')) rich(n, v); else n.textContent = v; }
    });
    ['instagram', 'facebook'].forEach(function (k) {
      var u = String(get(C, 'contacto.' + k) || '').trim();
      if (/^https?:\/\//.test(u)) $$('[data-social=' + k + ']').forEach(function (a) { a.href = u; });
    });
    $$('[data-list]').forEach(renderList);
    var digits = String(get(C, 'contacto.telefono') || '').replace(/\D/g, '');
    if (digits.length === 10) {
      $$('[data-tel]').forEach(function (a) { a.href = 'tel:+52' + digits; });
      $$('[data-wa]').forEach(function (a) { var tx = a.getAttribute('data-wa-text'); a.href = 'https://wa.me/52' + digits + (tx ? '?text=' + encodeURIComponent(tx) : ''); });
    }
    var q = get(C, 'faq.preguntas');
    if (Array.isArray(q) && q.length && $('#faqList')) {
      var box = $('#faqList'); box.innerHTML = '';
      q.forEach(function (it) {
        var d = el('details', 'py-6');
        var s = el('summary', 'flex items-center justify-between gap-6');
        s.appendChild(el('span', 'font-display text-xl sm:text-2xl', it.pregunta || ''));
        s.appendChild(el('span', 'plus text-3xl font-light text-oro', '+'));
        d.appendChild(s); d.appendChild(el('p', 'mt-4 leading-relaxed text-marfil/75', it.respuesta || ''));
        box.appendChild(d);
      });
    }
  }

  /* ---------- Ventana emergente ---------- */
  var modal = $('#modal');
  function openModal(title, text, extraNode) {
    $('#modalTitle').textContent = title; $('#modalText').textContent = text;
    var ex = $('#modalExtra'); ex.innerHTML = ''; if (extraNode) ex.appendChild(extraNode);
    if (typeof modal.showModal === 'function') { if (!modal.open) modal.showModal(); } else { modal.setAttribute('open', ''); }
  }
  function closeModal() { if (typeof modal.close === 'function') modal.close(); else modal.removeAttribute('open'); }
  $('#modalClose').addEventListener('click', closeModal);
  modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });

  /* ---------- Pestañas de solicitudes ---------- */
  function showTab(name, scroll) {
    $$('.tabbtn').forEach(function (b) { b.setAttribute('aria-selected', b.getAttribute('data-tab') === name ? 'true' : 'false'); });
    $$('[role=tabpanel]').forEach(function (p) { p.classList.toggle('hidden', p.id !== 'panel-' + name); });
    if (scroll && $('#solicitudes')) $('#solicitudes').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  $$('[data-tab]').forEach(function (b) { b.addEventListener('click', function () { showTab(b.getAttribute('data-tab'), true); }); });

  /* ---------- Campos de archivo (vista previa + validación) ---------- */
  var MAX_DOC = 3 * 1024 * 1024;
  $$('.slot').forEach(function (slot) {
    var input = $('input', slot), name = $('.sn', slot), kind = slot.getAttribute('data-kind');
    input.addEventListener('change', function () {
      var f = input.files[0], old = $('img', slot); if (old) old.remove();
      slot.classList.remove('has-file');
      var err = $('[data-err]', slot.closest('form')); if (err) err.textContent = '';
      if (!f) { name.textContent = 'Toca para elegir'; return; }
      var isImg = /^image\//.test(f.type), isPdf = f.type === 'application/pdf';
      if (!(isImg || (kind === 'doc' && isPdf))) { input.value = ''; name.textContent = 'Formato no válido'; if (err) err.textContent = 'Usa imágenes JPG/PNG' + (kind === 'doc' ? ' o PDF.' : '.'); return; }
      if (!isImg && f.size > MAX_DOC) { input.value = ''; name.textContent = 'Archivo muy pesado'; if (err) err.textContent = 'Los PDF deben pesar menos de 3 MB.'; return; }
      name.textContent = f.name; slot.classList.add('has-file');
      if (isImg) { var im = document.createElement('img'); im.alt = ''; im.src = URL.createObjectURL(f); slot.insertBefore(im, slot.firstChild); }
    });
  });
  function resetSlots(form) { $$('.slot', form).forEach(function (s) { var i = $('img', s); if (i) i.remove(); s.classList.remove('has-file'); $('.sn', s).textContent = 'Toca para elegir'; }); }

  /* ---------- Compresión de fotos antes de enviar (límite de Netlify: 8 MB por envío) ---------- */
  function compress(file, max, q) {
    if (!/^image\//.test(file.type) || !window.createImageBitmap) return Promise.resolve(file);
    return createImageBitmap(file, { imageOrientation: 'from-image' }).then(function (bmp) {
      var s = Math.min(1, max / Math.max(bmp.width, bmp.height));
      var c = document.createElement('canvas'); c.width = Math.round(bmp.width * s); c.height = Math.round(bmp.height * s);
      c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
      return new Promise(function (res) { c.toBlob(res, 'image/jpeg', q); }).then(function (blob) {
        if (blob && blob.size < file.size) return new File([blob], file.name.replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' });
        return file;
      });
    }).catch(function () { return file; });
  }
  function buildData(form, max, q) {
    var fd = new FormData(form), jobs = [];
    $$('input[type=file]', form).forEach(function (inp) {
      var f = inp.files[0]; fd.delete(inp.name);
      if (f) jobs.push(compress(f, max, q).then(function (nf) { fd.set(inp.name, nf, nf.name); return nf.size; }));
    });
    return Promise.all(jobs).then(function (sizes) { return { fd: fd, total: sizes.reduce(function (a, b) { return a + b; }, 0) }; });
  }

  /* ---------- Pago con Mercado Pago ---------- */
  function startPayment(errNode) {
    var link = String(get(C, 'valuacion.link_pago') || '').trim();
    if (link) { window.location.href = link; return; }
    var em = $('#valuaciones-email'); var email = em ? em.value : '';
    fetch('/.netlify/functions/crear-pago', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: email }) })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
      .then(function (d) { if (d && d.url) { window.location.href = d.url; } else { return Promise.reject(); } })
      .catch(function () { if (errNode) errNode.textContent = 'El pago en línea estará disponible muy pronto. Escríbenos por WhatsApp y te enviamos el enlace de pago.'; });
  }
  var payBtn = $('#payBtn'); if (payBtn) payBtn.addEventListener('click', function () { startPayment($('#payErr')); });

  /* ---------- Envío de formularios (Netlify Forms) ---------- */
  function onSuccess(kind) {
    if (kind === 'valuaciones') {
      var b = el('button', 'btn-gold px-7 py-3.5 text-[11px] font-medium uppercase tracking-[.25em]', 'Pagar con Mercado Pago · ' + (get(C, 'valuacion.precio') || '$1,200 MXN'));
      b.type = 'button'; var e2 = el('p', 'mt-3 text-sm text-red-300');
      b.addEventListener('click', function () { startPayment(e2); });
      var w = el('div'); w.appendChild(b); w.appendChild(e2);
      openModal('Gracias por enviar tu información', 'Recibimos tu solicitud de avalúo virtual. Para iniciarlo, realiza el pago de ' + (get(C, 'valuacion.precio') || '$1,200 MXN') + '. Nos comunicaremos contigo a la brevedad.', w);
    } else if (kind === 'newsletter') {
      openModal('Gracias por suscribirte', 'Pronto recibirás nuestras novedades y nuevas piezas.');
    } else {
      openModal('Gracias por contactarnos', 'Nos comunicaremos contigo a la brevedad.');
    }
  }
  $$('form[data-form]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var err = $('[data-err]', form), btn = $('button[type=submit]', form), label = btn.textContent;
      err.textContent = ''; btn.disabled = true; btn.textContent = 'Enviando…';
      var LIMIT = 7.2 * 1024 * 1024;
      buildData(form, 1600, 0.8).then(function (r) {
        if (r.total > LIMIT) return buildData(form, 1100, 0.65);
        return r;
      }).then(function (r) {
        if (r.total > LIMIT) throw new Error('size');
        return fetch('/', { method: 'POST', body: r.fd });
      }).then(function (resp) {
        if (!resp.ok) throw new Error('http');
        var kind = form.getAttribute('data-form');
        form.reset(); resetSlots(form); onSuccess(kind);
      }).catch(function (ex) {
        err.textContent = ex && ex.message === 'size'
          ? 'Tus archivos pesan demasiado. Intenta con menos papelería o fotos más ligeras.'
          : 'No pudimos enviar tu solicitud. Inténtalo de nuevo o escríbenos por WhatsApp.';
      }).then(function () { btn.disabled = false; btn.textContent = label; });
    });
  });

  /* ---------- Regreso desde Mercado Pago ---------- */
  (function () {
    var p = new URLSearchParams(location.search);
    var st = p.get('pago') || ((p.get('status') || p.get('collection_status')) === 'approved' ? 'exitoso' : '');
    if (!st) return;
    if (st === 'exitoso') openModal('Gracias por tu pago', 'Nos comunicaremos contigo a la brevedad.');
    else if (st === 'pendiente' || p.get('status') === 'pending') openModal('Tu pago está pendiente', 'En cuanto se acredite, nos comunicaremos contigo.');
    else openModal('No se completó tu pago', 'Puedes intentarlo de nuevo desde la sección de Servicios o escribirnos por WhatsApp.');
    try { history.replaceState(null, '', location.pathname + '#servicios'); } catch (e) {}
  })();

  /* ---------- Productos (data/productos.json) ---------- */
  function imgSrc(p) {
    if (/^https?:$/.test(location.protocol) && !/^(localhost|127\.)/.test(location.hostname)) return '/.netlify/images?w=1100&fit=cover&url=' + encodeURIComponent(p);
    return p;
  }
  function buildSlide(p) {
    var art = el('article', 'slide grid-cols-1 items-stretch overflow-hidden bg-museo text-marfil md:grid-cols-2');
    var imgBox = el('div', 'h-[420px] bg-museo2 md:h-[560px]');
    var img = document.createElement('img');
    img.src = imgSrc(p.imagen || ''); img.alt = p.titulo || 'Pieza de Casa Colección'; img.loading = 'lazy';
    img.className = 'h-full w-full object-cover ' + (p.enfoque === 'arriba' ? 'object-top' : 'object-center');
    img.onerror = function () { if (img.src.indexOf('/.netlify/images') !== -1) { img.onerror = null; img.src = p.imagen; } };
    imgBox.appendChild(img);
    var box = el('div', 'flex flex-col justify-center p-8 sm:p-12');
    box.appendChild(el('p', 'text-[11px] uppercase tracking-[.35em] text-oro', p.etiqueta || ''));
    box.appendChild(el('h3', 'mt-4 font-display text-3xl sm:text-4xl', p.titulo || ''));
    if (p.subtitulo) box.appendChild(el('p', 'mt-2 font-serif2 italic text-champagne', p.subtitulo));
    if (p.descripcion) box.appendChild(el('p', 'mt-6 leading-relaxed text-marfil/75', p.descripcion));
    var a = el('a', 'ask btn-gold mt-8 self-start px-7 py-3.5 text-[11px] font-medium uppercase tracking-[.25em]', 'Consultar pieza');
    a.href = '#solicitudes'; a.setAttribute('data-pieza', p.titulo || '');
    box.appendChild(a); art.appendChild(imgBox); art.appendChild(box); return art;
  }
  function loadProducts() {
    if (!$('#slides')) return Promise.resolve(false);
    return fetch('/data/productos.json', { cache: 'no-cache' }).then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(function (d) {
      var list = (d.productos || []).filter(function (p) { return p.publicado !== false; });
      var box = $('#slides'); box.innerHTML = '';
      if (!list.length) { box.appendChild(el('p', 'py-20 text-center font-serif2 text-xl text-grafito/70', 'Próximamente nuevas piezas.')); return false; }
      list.forEach(function (p) { box.appendChild(buildSlide(p)); }); return true;
    }).catch(function () { var m = $('#slidesMsg'); if (m) m.textContent = 'No se pudieron cargar las piezas.'; return false; });
  }
  function initSlider() {
    var slides = $$('#slides .slide'), thumbsBox = $('#thumbs'), dotsBox = $('#dots'), current = 0, timer = null;
    slides.forEach(function (s, i) {
      var t = el('button', 'thumb h-16 w-16 shrink-0 overflow-hidden'); t.setAttribute('aria-label', 'Ver pieza ' + (i + 1));
      var ti = document.createElement('img'); ti.src = $('img', s).src; ti.alt = ''; ti.className = 'h-full w-full object-cover'; t.appendChild(ti);
      t.addEventListener('click', function () { go(i, true); }); thumbsBox.appendChild(t);
      var d = el('button', 'h-2 w-2 rounded-full bg-bronce/30 transition-all'); d.setAttribute('aria-label', 'Ir a la pieza ' + (i + 1));
      d.addEventListener('click', function () { go(i, true); }); dotsBox.appendChild(d);
    });
    function go(n, user) {
      current = (n + slides.length) % slides.length;
      slides.forEach(function (s, i) { s.classList.toggle('active', i === current); });
      Array.prototype.forEach.call(thumbsBox.children, function (t, i) { t.classList.toggle('active', i === current); });
      Array.prototype.forEach.call(dotsBox.children, function (d, i) { d.classList.toggle('bg-oro', i === current); d.classList.toggle('w-6', i === current); d.classList.toggle('bg-bronce/30', i !== current); });
      if (user) start();
    }
    function start() { stop(); timer = setInterval(function () { go(current + 1); }, 6000); }
    function stop() { if (timer) clearInterval(timer); timer = null; }
    $('#next').addEventListener('click', function () { go(current + 1, true); });
    $('#prev').addEventListener('click', function () { go(current - 1, true); });
    var slider = $('#slider'); slider.addEventListener('mouseenter', stop); slider.addEventListener('mouseleave', start); slider.addEventListener('focusin', stop);
    document.addEventListener('keydown', function (e) {
      var r = slider.getBoundingClientRect();
      if (r.top < innerHeight && r.bottom > 0 && !/INPUT|TEXTAREA|SELECT/.test((document.activeElement || {}).tagName || '')) { if (e.key === 'ArrowRight') go(current + 1, true); if (e.key === 'ArrowLeft') go(current - 1, true); }
    });
    var x0 = null;
    slider.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    slider.addEventListener('touchend', function (e) { if (x0 === null) return; var dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 50) go(current + (dx < 0 ? 1 : -1), true); x0 = null; });
    $$('.ask').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault(); showTab('ventas', true);
        var t = $('#ventas-descripcion'); if (t) t.value = 'Me interesa la pieza: ' + a.getAttribute('data-pieza') + '. ¿Podrían darme más información?';
      });
    });
    go(0); if (!matchMedia('(prefers-reduced-motion: reduce)').matches) start();
  }

  /* ---------- Animación de aparición ---------- */
  var items = $$('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }); }, { threshold: 0.08 });
    items.forEach(function (n) { io.observe(n); });
  } else { items.forEach(function (n) { n.classList.add('in'); }); }

  /* ---------- Arranque ---------- */
  fetch('/data/contenido.json', { cache: 'no-cache' }).then(function (r) { return r.ok ? r.json() : {}; }).catch(function () { return {}; })
    .then(function (d) { C = d || {}; applyContent(); return loadProducts(); })
    .then(function (ok) { if (ok) initSlider(); });
})();
