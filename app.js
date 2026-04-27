/* =========================
FILE: app.js
Interactivity:
- Theme toggle with localStorage
- Mobile nav toggle
- Staggered reveal (IntersectionObserver)
- Contact form: prefill from URL + mailto composer
- Header elevate on scroll
========================= */

(function(){
  const root = document.documentElement;
  const THEME_KEY = "logicus_theme";

  // Theme init
  const saved = localStorage.getItem(THEME_KEY);
  if(saved === "light" || saved === "dark"){
    root.setAttribute("data-theme", saved);
  } else {
    // default: respect OS, but keep dark as brand baseline if OS unknown
    const prefersLight = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
    root.setAttribute("data-theme", prefersLight ? "light" : "dark");
  }

  // Wire theme toggles (on every page)
  document.querySelectorAll("[data-theme-toggle]").forEach(btn => {
    const current = root.getAttribute("data-theme") || "dark";
    btn.setAttribute("aria-pressed", current === "dark" ? "true" : "false");
    btn.addEventListener("click", () => {
      const now = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", now);
      localStorage.setItem(THEME_KEY, now);
      document.querySelectorAll("[data-theme-toggle]").forEach(b => b.setAttribute("aria-pressed", now === "dark" ? "true" : "false"));
    });
  });

  // Footer year
  const y = document.getElementById("year");
  if(y) y.textContent = new Date().getFullYear();

  // Header elevate on scroll
  const header = document.querySelector("[data-elevate]");
  const setElevate = () => {
    if(!header) return;
    header.classList.toggle("is-elevated", window.scrollY > 8);
  };
  setElevate();
  window.addEventListener("scroll", setElevate, { passive: true });

  // Mobile nav toggle
  const toggle = document.querySelector(".nav-toggle");
  const menu = document.getElementById("navMenu");
  if(toggle && menu){
    toggle.addEventListener("click", () => {
      const open = menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    // Close on link click (mobile)
    menu.querySelectorAll("a.nav-link").forEach(a => {
      a.addEventListener("click", () => {
        if(window.matchMedia("(max-width: 760px)").matches){
          menu.classList.remove("is-open");
          toggle.setAttribute("aria-expanded", "false");
        }
      });
    });

    // Click outside to close
    document.addEventListener("click", (e) => {
      if(!window.matchMedia("(max-width: 760px)").matches) return;
      if(menu.classList.contains("is-open")){
        const within = menu.contains(e.target) || toggle.contains(e.target);
        if(!within){
          menu.classList.remove("is-open");
          toggle.setAttribute("aria-expanded", "false");
        }
      }
    });
  }

  // Reveal on scroll with stagger
  const items = Array.from(document.querySelectorAll(".reveal"));
  items.forEach((el, idx) => el.style.animationDelay = `${Math.min(idx * 70, 420)}ms`);

  const prefersReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if(!prefersReduced && "IntersectionObserver" in window){
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if(entry.isIntersecting){
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14 });
    items.forEach(el => io.observe(el));
  } else {
    items.forEach(el => el.classList.add("is-in"));
  }

  // Contact form: URL prefill, mailto generation
  const form = document.getElementById("contactForm");
  if(form){
    const params = new URLSearchParams(location.search);
    const fach = params.get("fach");
    if(fach){
      const fachSel = document.getElementById("fach");
      if(fachSel){
        const normalized = fach.toLowerCase();
        const option = Array.from(fachSel.options).find(o => o.text.toLowerCase() === normalized);
        if(option) fachSel.value = option.text;
      }
    }

    const err = document.getElementById("formError");

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const data = new FormData(form);
      const name = String(data.get("name") || "").trim();
      const email = String(data.get("email") || "").trim();
      const stufe = String(data.get("stufe") || "").trim();
      const fachV = String(data.get("fach") || "").trim();
      const kurs = String(data.get("kurs") || "").trim();
      const ziel = String(data.get("ziel") || "").trim();
      const gruppe = !!data.get("gruppe");

      const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      const ok = name && validEmail && stufe && fachV && kurs && ziel;

      if(!ok){
        if(err) err.hidden = false;
        return;
      }
      if(err) err.hidden = true;

      const subject = `Anfrage ${fachV} — ${stufe} (${name})`;
      const bodyLines = [
        `Name: ${name}`,
        `E-Mail: ${email}`,
        `Schulstufe: ${stufe}`,
        `Fach: ${fachV}`,
        `Thema/Kurswunsch: ${kurs}`,
        `Ziel/Beschreibung:`,
        ziel,
        ``,
        `Offen für Kleingruppe: ${gruppe ? "Ja" : "Nein"}`,
        ``,
        `—`,
        `Gesendet über logicus.education Website (Template)`
      ];
      const mailto = `mailto:info@logicus.education?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyLines.join("\n"))}`;

      window.location.href = mailto;
    });
  }
})();

// Lightbox für Bilder mit Klasse .zoomable
(() => {
  const lightboxOverlay = document.getElementById('lightboxOverlay');
  const lightboxImage = document.getElementById('lightboxImage');
  const lightboxClose = document.getElementById('lightboxClose');

  if (!lightboxOverlay || !lightboxImage || !lightboxClose) return;

  document.querySelectorAll('.zoomable').forEach(img => {
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', () => {
      lightboxImage.src = img.src;
      lightboxImage.alt = img.alt || 'Großes Bild';
      lightboxOverlay.hidden = false;
      lightboxOverlay.focus();
    });
  });

  lightboxClose.addEventListener('click', () => {
    lightboxOverlay.hidden = true;
    lightboxImage.src = '';
  });

  lightboxOverlay.addEventListener('click', (e) => {
    if (e.target === lightboxOverlay) {
      lightboxOverlay.hidden = true;
      lightboxImage.src = '';
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !lightboxOverlay.hidden) {
      lightboxOverlay.hidden = true;
      lightboxImage.src = '';
    }
  });
})();

