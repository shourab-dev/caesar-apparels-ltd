/* ==========================================================
   Caesar Apparels Ltd — shared site behaviour (every page)
   Smooth scroll, header, mobile menu, split headings, generic reveals.
   Exposes helpers on window.CA for page scripts.
   ========================================================== */
(() => {
  const root = document.documentElement;

  // If GSAP failed to load, drop the pre-animation hide states and bail.
  if (!window.gsap || !window.ScrollTrigger) {
    root.classList.remove("js");
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fmt = (n) => Math.round(n).toLocaleString("en-US");

  const yearEl = $("[data-year]");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Smooth scroll ---------- */
  let lenis = null;
  if (!reduceMotion && window.Lenis) {
    lenis = new Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  const header = $("[data-header]");

  // Same-page anchors scroll smoothly; links to other pages navigate normally.
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (id.length < 2) return;
      const target = $(id);
      if (!target) return;
      e.preventDefault();
      closeMenu();
      if (lenis) lenis.scrollTo(target, { offset: id === "#top" ? 0 : -60 });
      else target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
    });
  });

  /* ---------- Header: solid after hero start, hide on scroll down ---------- */
  let lastY = 0;
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle("is-solid", y > 40);
    header.classList.toggle("is-hidden", y > 400 && y > lastY && !root.classList.contains("menu-open"));
    lastY = y;
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  const menuBtn = $("[data-menu-toggle]");
  const menu = $("[data-mobile-menu]");
  let menuTl = null;

  function openMenu() {
    menu.hidden = false;
    root.classList.add("menu-open");
    menuBtn.setAttribute("aria-expanded", "true");
    lenis && lenis.stop();
    menuTl = gsap.timeline()
      .fromTo(menu, { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: 0.7, ease: "expo.inOut" })
      .from($$("a", menu.querySelector("nav")), { yPercent: 110, duration: 0.7, stagger: 0.06, ease: "expo.out" }, "-=0.25")
      .from(".mobile-menu-foot", { opacity: 0, duration: 0.4 }, "-=0.4");
  }
  function closeMenu() {
    if (!root.classList.contains("menu-open")) return;
    root.classList.remove("menu-open");
    menuBtn.setAttribute("aria-expanded", "false");
    lenis && lenis.start();
    menuTl && menuTl.kill();
    gsap.to(menu, {
      clipPath: "inset(0 0 100% 0)", duration: 0.55, ease: "expo.inOut",
      onComplete: () => { menu.hidden = true; gsap.set(menu, { clearProps: "clipPath" }); },
    });
  }
  menuBtn.addEventListener("click", () => (root.classList.contains("menu-open") ? closeMenu() : openMenu()));
  document.addEventListener("keydown", (e) => e.key === "Escape" && closeMenu());
  window.addEventListener("resize", () => window.innerWidth > 960 && closeMenu());

  /* ---------- Split headings into words ---------- */
  $$(".split").forEach((el) => {
    const words = el.textContent.trim().split(/\s+/);
    el.setAttribute("aria-label", el.textContent.trim());
    el.innerHTML = words
      .map((w) => `<span class="word" aria-hidden="true"><span>${w}</span></span>`)
      .join(" ");
  });

  window.CA = { $, $$, reduceMotion, lenis, header, fmt, closeMenu };

  if (reduceMotion) {
    // Everything visible, nothing moves.
    gsap.set(header, { opacity: 1 });
    $$(".split .word > span").forEach((s) => (s.style.transform = "none"));
    return;
  }

  /* ---------- Generic heading reveal ---------- */
  $$(".split").forEach((el) => {
    gsap.from($$(".word > span", el), {
      yPercent: 110, duration: 1.1, ease: "expo.out", stagger: 0.06,
      scrollTrigger: { trigger: el, start: "top 88%" },
    });
  });

  $$(".kicker").forEach((el) => {
    if (el.closest(".hero, [data-intro]")) return;
    gsap.from(el, { opacity: 0, x: -16, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 90%" } });
  });

  /* ---------- Image clip reveal + inner parallax ---------- */
  $$(".reveal-img").forEach((fig) => {
    const img = $("img", fig);
    gsap.fromTo(fig, { clipPath: "inset(100% 0 0 0)" }, {
      clipPath: "inset(0% 0 0 0)", duration: 1.5, ease: "expo.inOut",
      scrollTrigger: { trigger: fig, start: "top 82%" },
    });
    if (img && !fig.classList.contains("sustain-media")) {
      gsap.fromTo(img, { yPercent: -8 }, {
        yPercent: 0, ease: "none",
        scrollTrigger: { trigger: fig, start: "top bottom", end: "bottom top", scrub: true },
      });
    }
  });

  /* ---------- Stats counters ---------- */
  $$("[data-count]").forEach((el) => {
    const end = +el.dataset.count;
    const obj = { v: 0 };
    gsap.to(obj, {
      v: end, duration: 2.2, ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 92%" },
      onUpdate: () => (el.textContent = Math.round(obj.v).toLocaleString("en-US")),
    });
  });

  /* ---------- CTA & footer ---------- */
  gsap.from(".cta-note, .cta-actions .btn", {
    opacity: 0, y: 24, duration: 1, stagger: 0.1, ease: "power3.out",
    scrollTrigger: { trigger: ".cta", start: "top 82%" },
  });
  gsap.from(".footer-grid > *", {
    opacity: 0, y: 24, duration: 1, stagger: 0.08, ease: "power3.out",
    scrollTrigger: { trigger: ".footer", start: "top 90%" },
  });

  /* ---------- Magnetic buttons (pointer devices only) ---------- */
  if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    $$(".btn, .round-btn, .play-ring").forEach((btn) => {
      const xTo = gsap.quickTo(btn, "x", { duration: 0.5, ease: "power3.out" });
      const yTo = gsap.quickTo(btn, "y", { duration: 0.5, ease: "power3.out" });
      btn.addEventListener("pointermove", (e) => {
        const r = btn.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * 0.18);
        yTo((e.clientY - r.top - r.height / 2) * 0.3);
      });
      btn.addEventListener("pointerleave", () => { xTo(0); yTo(0); });
    });
  }

  window.addEventListener("load", () => ScrollTrigger.refresh());
})();
