/* ==========================================================================
   Kron Automobiltechnik – Interaktion & Scroll-Choreografie
   - Lenis: weiches Scrollen (nur ohne prefers-reduced-motion)
   - GSAP + ScrollTrigger: Reveals, dezente Parallaxe, Timeline-Fortschritt
   - Header, mobiles Menü, Hero-Video, Terminformular
   Animiert wird ausschließlich transform und opacity.
   ========================================================================== */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  var lenis = null;

  // Ohne GSAP keine versteckten Startzustände – Inhalte sofort sichtbar
  if (!hasGsap) root.classList.add('motion-fallback');

  /* ------------------------------------------------------------------
     Smooth Scroll mit Lenis, an den GSAP-Ticker gekoppelt
     ------------------------------------------------------------------ */
  if (!reduceMotion && hasGsap && typeof window.Lenis !== 'undefined') {
    lenis = new window.Lenis({ lerp: 0.095, wheelMultiplier: 0.95, smoothWheel: true });
    lenis.on('scroll', window.ScrollTrigger.update);
    window.gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    window.gsap.ticker.lagSmoothing(0);
  }

  /** Scrollt zu einem Ziel – mit Lenis weich, sonst nativ */
  function scrollToTarget(target) {
    var header = document.querySelector('[data-header]');
    var offset = header ? header.offsetHeight : 0;
    if (lenis) {
      lenis.scrollTo(target, { offset: -offset, duration: 1.2, easing: function (t) { return 1 - Math.pow(1 - t, 4); } });
    } else {
      var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top: top, behavior: reduceMotion ? 'auto' : 'smooth' });
    }
  }

  /* ------------------------------------------------------------------
     Header: wird weiß nach dem Hero, verschwindet beim Runterscrollen
     ------------------------------------------------------------------ */
  var header = document.querySelector('[data-header]');
  var hero = document.querySelector('.hero');
  var lastY = window.pageYOffset;
  var ticking = false;

  function updateHeader() {
    var y = window.pageYOffset;
    var heroEnd = hero ? hero.offsetHeight - 80 : 200;
    header.classList.toggle('is-solid', y > heroEnd);
    // Nur nach dem Hero und bei deutlicher Abwärtsbewegung ausblenden
    if (y > heroEnd + 200 && y > lastY + 4) header.classList.add('is-hidden');
    else if (y < lastY - 4 || y <= heroEnd) header.classList.remove('is-hidden');
    lastY = y;
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { window.requestAnimationFrame(updateHeader); ticking = true; }
  }, { passive: true });
  updateHeader();

  // Fokus im Header (Tastatur) blendet ihn wieder ein
  header.addEventListener('focusin', function () { header.classList.remove('is-hidden'); });

  /* ------------------------------------------------------------------
     Aktiver Navigationspunkt
     ------------------------------------------------------------------ */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-list a'));
  if ('IntersectionObserver' in window) {
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (a) {
          a.setAttribute('aria-current', a.getAttribute('href') === '#' + entry.target.id ? 'true' : 'false');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['leistungen', 'geschichte', 'werkstatt', 'stimmen', 'termin'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) sectionObserver.observe(el);
    });
  }

  /* ------------------------------------------------------------------
     Mobiles Menü mit Fokusfalle, Esc und Scroll-Sperre
     ------------------------------------------------------------------ */
  var toggle = document.querySelector('[data-menu-toggle]');
  var menu = document.querySelector('[data-menu]');

  function focusables() {
    return [toggle].concat(Array.prototype.slice.call(menu.querySelectorAll('a')));
  }
  function openMenu() {
    menu.hidden = false;
    root.classList.add('menu-open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Menü schließen');
    if (lenis) lenis.stop(); else document.body.style.overflow = 'hidden';
    window.requestAnimationFrame(function () { menu.classList.add('is-open'); });
    document.addEventListener('keydown', onMenuKey);
  }
  function closeMenu(returnFocus) {
    menu.classList.remove('is-open');
    root.classList.remove('menu-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Menü öffnen');
    if (lenis) lenis.start(); else document.body.style.overflow = '';
    document.removeEventListener('keydown', onMenuKey);
    window.setTimeout(function () { if (!menu.classList.contains('is-open')) menu.hidden = true; }, reduceMotion ? 0 : 300);
    if (returnFocus) toggle.focus();
  }
  function onMenuKey(e) {
    if (e.key === 'Escape') { closeMenu(true); return; }
    if (e.key !== 'Tab') return;
    var items = focusables();
    var first = items[0];
    var last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
  toggle.addEventListener('click', function () {
    if (toggle.getAttribute('aria-expanded') === 'true') closeMenu(false); else openMenu();
  });
  // Bei Wechsel auf Desktop-Breite Menü schließen
  window.matchMedia('(min-width: 1024px)').addEventListener('change', function (e) {
    if (e.matches && toggle.getAttribute('aria-expanded') === 'true') closeMenu(false);
  });

  /* ------------------------------------------------------------------
     Ankerlinks: weiches Scrollen, Menü schließen, Leistung vorauswählen
     ------------------------------------------------------------------ */
  document.addEventListener('click', function (e) {
    var link = e.target.closest('a[href^="#"]');
    if (!link) return;
    var id = link.getAttribute('href');
    var target = id === '#top' ? document.body : document.querySelector(id);
    if (!target) return;
    e.preventDefault();

    var service = link.getAttribute('data-service');
    if (service) preselectService(service);

    if (menu.classList.contains('is-open')) closeMenu(false);
    if (id === '#top') {
      if (lenis) lenis.scrollTo(0, { duration: 1.2 }); else window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    } else {
      scrollToTarget(target);
    }
    // Fokus für Tastatur- und Screenreader-Nutzer an das Ziel übergeben
    if (id !== '#top') {
      var heading = target.querySelector('h2') || target;
      heading.setAttribute('tabindex', '-1');
      heading.focus({ preventScroll: true });
    }
    if (window.history && window.history.replaceState) window.history.replaceState(null, '', id === '#top' ? '#' : id);
  });

  /* ------------------------------------------------------------------
     Hero-Video: Pausieren-Schalter, Pause bei reduzierter Bewegung,
     Pause außerhalb des Sichtbereichs (spart Akku)
     ------------------------------------------------------------------ */
  var video = document.querySelector('[data-hero-video]');
  var videoToggle = document.querySelector('[data-video-toggle]');
  var videoLabel = document.querySelector('[data-video-label]');
  var userPaused = false;

  function setVideoState(paused) {
    videoToggle.setAttribute('aria-pressed', paused ? 'true' : 'false');
    videoLabel.textContent = paused ? 'Video abspielen' : 'Video pausieren';
  }
  if (video) {
    if (reduceMotion) {
      video.removeAttribute('autoplay');
      video.pause();
      userPaused = true;
      setVideoState(true);
    }
    videoToggle.addEventListener('click', function () {
      if (video.paused) { userPaused = false; video.play().catch(function () {}); setVideoState(false); }
      else { userPaused = true; video.pause(); setVideoState(true); }
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (userPaused) return;
          if (entry.isIntersecting) video.play().catch(function () {}); else video.pause();
        });
      }).observe(video);
    }
  }

  /* ------------------------------------------------------------------
     GSAP-Choreografie
     ------------------------------------------------------------------ */
  if (hasGsap) {
    var gsap = window.gsap;
    var ST = window.ScrollTrigger;
    gsap.registerPlugin(ST);

    if (reduceMotion) {
      // Bewegung reduziert: nur Timeline-Zustand ohne Animation steuern
      initStoryState(true);
    } else {
      gsap.defaults({ ease: 'power3.out' });

      /* Hero-Auftritt: Headline (Lead) zuerst, dann Text & CTA überlappend */
      var heroTl = gsap.timeline({ delay: 0.15 });
      heroTl
        .fromTo('[data-hero-media]', { scale: 1.06 }, { scale: 1, duration: 2.2, ease: 'power2.out' }, 0)
        .to('[data-hero-line]', { y: 0, duration: 1.1, stagger: 0.09, ease: 'power4.out' }, 0.1)
        .to('[data-hero-item]', { opacity: 1, y: 0, duration: 0.9, stagger: 0.07 }, 0.45);

      /* Hero beim Herausscrollen: Video wandert langsamer (Parallaxe), Inhalt blendet aus */
      gsap.to('.hero__video', {
        yPercent: 14, ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
      });
      gsap.to('[data-hero-content]', {
        y: -60, opacity: 0.15, ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom 25%', scrub: true }
      });

      /* Reveals: pro Gruppe gesammelt, Abstand nach Reihenfolge leicht abnehmend */
      ST.batch('[data-reveal]', {
        start: 'top 88%',
        once: true,
        onEnter: function (batch) {
          gsap.to(batch, {
            opacity: 1, y: 0, duration: 1, overwrite: true,
            stagger: function (i) { return Math.min(i * 0.07 - i * i * 0.004, 0.32); }
          });
        }
      });

      /* Dezente Bild-Parallaxe innerhalb der Rahmen */
      gsap.utils.toArray('[data-parallax]').forEach(function (img) {
        gsap.fromTo(img, { yPercent: -5 }, {
          yPercent: 5, ease: 'none',
          scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true }
        });
      });

      initStoryState(false);
    }

    /* Geschichte: Fortschrittslinie, aktives Kapitel, passendes Bild */
    function initStoryState(instant) {
      var chapters = gsap.utils.toArray('[data-chapter]');
      var images = gsap.utils.toArray('[data-story-img]');
      var yearEl = document.querySelector('[data-story-year]');
      var fill = document.querySelector('[data-story-progress]');

      function activate(index) {
        chapters.forEach(function (c, i) { c.classList.toggle('is-active', i === index); });
        images.forEach(function (img, i) { img.classList.toggle('is-active', i === index); });
        if (yearEl) yearEl.textContent = chapters[index].getAttribute('data-year');
      }
      activate(0);

      chapters.forEach(function (chapter, i) {
        ST.create({
          trigger: chapter, start: 'top 55%', end: 'bottom 55%',
          onToggle: function (self) { if (self.isActive) activate(i); }
        });
      });

      if (fill) {
        if (instant) {
          gsap.set(fill, { scaleY: 1 });
        } else {
          gsap.to(fill, {
            scaleY: 1, ease: 'none',
            scrollTrigger: { trigger: '[data-story]', start: 'top 60%', end: 'bottom 60%', scrub: 0.6 }
          });
        }
      }
    }

    // Nach dem Laden der Schriften Positionen neu berechnen
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ST.refresh(); });
  }

  /* ------------------------------------------------------------------
     Terminformular: Validierung, Fehler am Feld, Fokus auf ersten Fehler,
     danach vorbereitete E-Mail (kein Backend)
     ------------------------------------------------------------------ */
  var form = document.querySelector('[data-booking]');
  var done = document.querySelector('[data-booking-done]');
  var dirty = false;
  var dateFmt = new Intl.DateTimeFormat('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  function preselectService(value) {
    var radio = form.querySelector('input[name="service"][value="' + value.replace(/"/g, '\\"') + '"]');
    if (radio) { radio.checked = true; clearError('service'); }
  }

  // Frühestes Datum: morgen (lokale Zeit)
  var dateInput = form.querySelector('#f-date');
  var tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  dateInput.min = toISODate(tomorrow);

  function toISODate(d) {
    var m = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    return d.getFullYear() + '-' + m + '-' + day;
  }
  function parseISODate(value) {
    var p = value.split('-');
    return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
  }

  function setError(name, message) {
    var el = form.querySelector('[data-error="' + name + '"]');
    if (el) el.textContent = message;
    var inputs = form.querySelectorAll('[name="' + name + '"]');
    inputs.forEach(function (input) { input.setAttribute('aria-invalid', 'true'); });
  }
  function clearError(name) {
    var el = form.querySelector('[data-error="' + name + '"]');
    if (el) el.textContent = '';
    form.querySelectorAll('[name="' + name + '"]').forEach(function (input) { input.removeAttribute('aria-invalid'); });
  }

  function validate() {
    var data = new FormData(form);
    var errors = [];
    var name = (data.get('name') || '').trim();
    var phone = (data.get('phone') || '').trim();
    var email = (data.get('email') || '').trim();
    var car = (data.get('car') || '').trim();
    var date = data.get('date') || '';

    if (!data.get('service')) errors.push(['service', 'Bitte wählen Sie eine Leistung aus.']);
    if (name.length < 2) errors.push(['name', 'Bitte geben Sie Ihren Namen ein.']);
    if (phone.replace(/[^0-9]/g, '').length < 6) errors.push(['phone', 'Bitte geben Sie eine Telefonnummer mit mindestens 6 Ziffern ein, damit wir Sie zurückrufen können.']);
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) errors.push(['email', 'Bitte prüfen Sie die E-Mail-Adresse, z. B. name@beispiel.de.']);
    if (car.length < 2) errors.push(['car', 'Bitte nennen Sie Marke und Modell, z. B. VW Golf 2018.']);
    if (!date) {
      errors.push(['date', 'Bitte wählen Sie einen Wunschtermin.']);
    } else {
      var d = parseISODate(date);
      if (d < parseISODate(dateInput.min)) errors.push(['date', 'Bitte wählen Sie ein Datum ab morgen.']);
      else if (d.getDay() === 0) errors.push(['date', 'Sonntags ist geschlossen. Bitte wählen Sie Montag bis Samstag.']);
    }
    if (!form.querySelector('[name="privacy"]').checked) errors.push(['privacy', 'Bitte bestätigen Sie die Einwilligung, damit wir Ihre Anfrage bearbeiten dürfen.']);
    return { errors: errors, data: { name: name, phone: phone, email: email, car: car, date: date, service: data.get('service'), slot: data.get('slot'), message: (data.get('message') || '').trim() } };
  }

  form.addEventListener('input', function (e) { dirty = true; if (e.target.name) clearError(e.target.name); });
  form.addEventListener('change', function (e) { dirty = true; if (e.target.name) clearError(e.target.name); });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    ['service', 'name', 'phone', 'email', 'car', 'date', 'privacy'].forEach(clearError);
    var result = validate();
    if (result.errors.length) {
      result.errors.forEach(function (err) { setError(err[0], err[1]); });
      var first = form.querySelector('[name="' + result.errors[0][0] + '"]');
      if (first) {
        scrollToTarget(first.closest('.field, .field-group'));
        first.focus({ preventScroll: true });
      }
      return;
    }

    var v = result.data;
    var dateText = dateFmt.format(parseISODate(v.date));
    var body = [
      'Terminanfrage über die Website',
      '',
      'Leistung: ' + v.service,
      'Wunschtermin: ' + dateText + ' (' + v.slot + ')',
      'Fahrzeug: ' + v.car,
      'Name: ' + v.name,
      'Telefon: ' + v.phone,
      v.email ? 'E-Mail: ' + v.email : '',
      v.message ? '\nBeschreibung:\n' + v.message : ''
    ].filter(function (line) { return line !== ''; }).join('\n');

    var mailto = done.querySelector('[data-mailto]');
    mailto.href = 'mailto:termin@kron-automobiltechnik.de?subject=' +
      encodeURIComponent('Terminanfrage: ' + v.service + ' – ' + v.car) + '&body=' + encodeURIComponent(body);

    done.querySelector('[data-done-title]').textContent = 'Danke, ' + v.name.split(' ')[0] + '.';
    done.querySelector('[data-done-summary]').textContent =
      v.service + ' für Ihren ' + v.car + ', Wunschtermin ' + dateText + ', ' + (v.slot === 'Egal' ? 'Uhrzeit flexibel' : v.slot) + '.';

    form.hidden = true;
    done.hidden = false;
    dirty = false;
    done.focus();
  });

  done.querySelector('[data-booking-reset]').addEventListener('click', function () {
    done.hidden = true;
    form.hidden = false;
    form.querySelector('#f-name').focus();
  });

  // Warnung bei ungesendeten Eingaben
  window.addEventListener('beforeunload', function (e) {
    if (!dirty) return;
    e.preventDefault();
    e.returnValue = '';
  });

  // Jahr im Footer
  var yearEl = document.querySelector('[data-current-year]');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
