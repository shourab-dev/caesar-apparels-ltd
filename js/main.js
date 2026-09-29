/* ==========================================================
   Caesar Apparels Ltd — Home interactions (GSAP + ScrollTrigger + Lenis)
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

  /* ---------- Hero slider ---------- */
  const slides = $$(".hero-slide");
  const captions = ["Stitching line, Chattogram", "Production floor", "Denim finishing", "Outbound from Chattogram port"];
  const currentEl = $("[data-hero-current]");
  const captionEl = $("[data-hero-caption]");
  const bar = $("[data-hero-bar]");
  const SLIDE_TIME = 6.5;
  let current = 0;
  let barTween = null;
  let busy = false;

  function kenBurns(slide) {
    if (reduceMotion) return;
    gsap.fromTo($("img", slide), { scale: 1.14 }, { scale: 1, duration: SLIDE_TIME + 1.6, ease: "none" });
  }

  function runBar() {
    barTween && barTween.kill();
    if (reduceMotion) return;
    barTween = gsap.fromTo(bar, { scaleX: 0 }, { scaleX: 1, duration: SLIDE_TIME, ease: "none", onComplete: () => goTo(current + 1) });
  }

  function goTo(index) {
    if (busy) return;
    const next = (index + slides.length) % slides.length;
    if (next === current) return;
    busy = true;
    const from = slides[current];
    const to = slides[next];
    const dir = index > current ? 1 : -1;

    gsap.set(to, { visibility: "visible", zIndex: 2, opacity: 1 });
    gsap.set(from, { zIndex: 1 });
    kenBurns(to);
    gsap.timeline({
      onComplete: () => {
        from.classList.remove("is-active");
        gsap.set(from, { visibility: "hidden", opacity: 0, zIndex: 0 });
        to.classList.add("is-active");
        busy = false;
      },
    })
      .fromTo(to, { clipPath: dir > 0 ? "inset(0 0 0 100%)" : "inset(0 100% 0 0)" },
        { clipPath: "inset(0 0% 0 0%)", duration: 1.3, ease: "expo.inOut" })
      .to($("img", from), { xPercent: -8 * dir, duration: 1.3, ease: "expo.inOut" }, 0)
      .set($("img", from), { xPercent: 0 });

    current = next;
    gsap.timeline()
      .to([currentEl, captionEl], { yPercent: -60, opacity: 0, duration: 0.3, ease: "power2.in" })
      .add(() => {
        currentEl.textContent = String(current + 1).padStart(2, "0");
        captionEl.textContent = captions[current];
      })
      .fromTo([currentEl, captionEl], { yPercent: 60 }, { yPercent: 0, opacity: 1, duration: 0.5, ease: "power3.out" });
    runBar();
  }

  $("[data-hero-next]").addEventListener("click", () => goTo(current + 1));
  $("[data-hero-prev]").addEventListener("click", () => goTo(current - 1));

  // Pause autoplay while hero is off-screen
  ScrollTrigger.create({
    trigger: "[data-hero]",
    start: "top top",
    end: "bottom top",
    onLeave: () => barTween && barTween.pause(),
    onEnterBack: () => barTween && barTween.resume(),
  });

  /* ---------- Intro sequence ---------- */
  const intro = gsap.timeline({ defaults: { ease: "expo.out" }, delay: 0.1 });
  if (reduceMotion) {
    gsap.set([header, ".hero-kicker", ".hero-lede", ".hero-actions", ".hero-controls"], { opacity: 1 });
    gsap.set(".hero-title .line > span", { yPercent: 0, y: 0 });
  } else {
    intro
      .fromTo(".hero-slides", { clipPath: "inset(12% 10% 12% 45%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.8, ease: "expo.inOut" })
      .add(() => kenBurns(slides[0]), 0)
      .fromTo(".hero-shade", { opacity: 0 }, { opacity: 1, duration: 1.4 }, 0.5)
      .fromTo(".hero-kicker", { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 1 }, 1.0)
      .fromTo(".hero-title .line > span", { y: 0, yPercent: 110 }, { yPercent: 0, duration: 1.4, stagger: 0.12 }, 1.05)
      .fromTo(".hero-lede", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1.2 }, 1.45)
      .fromTo(".hero-actions", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1.2 }, 1.6)
      .fromTo(".hero-controls", { opacity: 0 }, { opacity: 1, duration: 1 }, 1.8)
      .fromTo(header, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 1 }, 1.6)
      .add(runBar, 1.8);
  }

  if (reduceMotion) {
    // Everything visible, nothing moves.
    $$(".split .word > span").forEach((s) => (s.style.transform = "none"));
    return;
  }

  /* ---------- Hero scroll-out parallax ---------- */
  gsap.to(".hero-content", {
    yPercent: -18, opacity: 0.2, ease: "none",
    scrollTrigger: { trigger: "[data-hero]", start: "top top", end: "bottom top", scrub: true },
  });
  gsap.to(".hero-slides", {
    yPercent: 14, ease: "none",
    scrollTrigger: { trigger: "[data-hero]", start: "top top", end: "bottom top", scrub: true },
  });

  /* ---------- Generic heading reveal ---------- */
  $$(".split").forEach((el) => {
    gsap.from($$(".word > span", el), {
      yPercent: 110, duration: 1.1, ease: "expo.out", stagger: 0.06,
      scrollTrigger: { trigger: el, start: "top 88%" },
    });
  });

  $$(".kicker").forEach((el) => {
    if (el.closest(".hero")) return;
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
  gsap.from(".stat", {
    opacity: 0, y: 20, duration: 1, stagger: 0.1, ease: "power3.out",
    scrollTrigger: { trigger: ".stats", start: "top 92%" },
  });

  /* ---------- Story & text blocks ---------- */
  gsap.from(".story-copy .body, .story-copy .text-link", {
    opacity: 0, y: 24, duration: 1, stagger: 0.12, ease: "power3.out",
    scrollTrigger: { trigger: ".story-copy", start: "top 78%" },
  });
  gsap.from(".story-values li", {
    opacity: 0, x: 24, duration: 0.9, stagger: 0.12, ease: "power3.out",
    scrollTrigger: { trigger: ".story-values", start: "top 85%" },
  });

  /* ---------- Capabilities ---------- */
  gsap.from(".cap-item", {
    opacity: 0, y: 40, duration: 1.1, stagger: 0.14, ease: "expo.out",
    scrollTrigger: { trigger: ".cap-list", start: "top 82%" },
  });

  /* ---------- Clients: infinite marquee ---------- */
  const PX_PER_SEC = 55;
  const marquees = $$("[data-marquee]").map((row) => {
    const track = $(".clients-track", row);
    const originals = [...track.children];
    originals.forEach((li) => {
      const clone = li.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      $("img", clone).alt = "";
      track.appendChild(clone);
    });
    const m = { row, track, count: originals.length, dir: row.dataset.marquee === "right" ? 1 : -1, hover: false, sign: 1, tween: null };

    m.build = () => {
      const progress = m.tween ? m.tween.progress() : 0;
      m.tween && m.tween.kill();
      // Distance from first item to its clone = one full set including gaps, so the loop is seamless.
      const dist = track.children[m.count].offsetLeft - track.children[0].offsetLeft;
      const from = m.dir < 0 ? 0 : -dist;
      const to = m.dir < 0 ? -dist : 0;
      m.tween = gsap.fromTo(track, { x: from }, { x: to, duration: dist / PX_PER_SEC, ease: "none", repeat: -1 });
      // Start far into the repeat cycle so negative timeScale (scrolling up) can play backwards indefinitely.
      m.tween.totalTime(m.tween.duration() * (1000 + progress));
      m.tween.timeScale(m.sign);
    };
    m.build();

    row.addEventListener("pointerenter", () => { m.hover = true; gsap.to(m.tween, { timeScale: 0.12 * m.sign, duration: 0.6, ease: "power2.out", overwrite: true }); });
    row.addEventListener("pointerleave", () => { m.hover = false; gsap.to(m.tween, { timeScale: m.sign, duration: 0.8, ease: "power2.inOut", overwrite: true }); });
    return m;
  });

  // Scroll velocity nudges the rows faster; scrolling up reverses them.
  ScrollTrigger.create({
    trigger: ".clients",
    start: "top bottom",
    end: "bottom top",
    onUpdate: (self) => {
      const boost = gsap.utils.clamp(0, 5, Math.abs(self.getVelocity()) / 400);
      marquees.forEach((m) => {
        if (m.hover) return;
        m.sign = self.direction;
        gsap.to(m.tween, {
          timeScale: m.sign * (1 + boost), duration: 0.25, ease: "power2.out", overwrite: true,
          onComplete: () => !m.hover && gsap.to(m.tween, { timeScale: m.sign, duration: 1, ease: "power2.inOut", overwrite: true }),
        });
      });
    },
  });

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => marquees.forEach((m) => m.build()), 200);
  });

  gsap.from(".clients-row", {
    opacity: 0, x: (i) => (i ? -80 : 80), duration: 1.4, stagger: 0.12, ease: "expo.out",
    scrollTrigger: { trigger: ".clients-rows", start: "top 88%" },
  });

  /* ---------- Products: staggered rise ---------- */
  ScrollTrigger.matchMedia({
    "(min-width: 721px)": () => {
      gsap.from(".product", {
        y: 60, opacity: 0, duration: 1.2, stagger: 0.08, ease: "expo.out",
        scrollTrigger: { trigger: "[data-products]", start: "top 85%" },
      });
    },
  });

  /* ---------- Process: pinned horizontal scroll ---------- */
  const track = $("[data-process-track]");
  const list = $(".process-list", track);
  const stepEl = $("[data-process-step]");
  const stepBar = $("[data-process-bar]");
  const steps = $$(".step", list);
  const distance = () => Math.max(0, list.scrollWidth - track.clientWidth + parseFloat(getComputedStyle(track).paddingLeft));

  const processTween = gsap.to(list, {
    x: () => -distance(),
    ease: "none",
    scrollTrigger: {
      trigger: "[data-process]",
      start: "top top",
      end: () => "+=" + distance(),
      pin: ".process-pin",
      scrub: 0.8,
      invalidateOnRefresh: true,
      anticipatePin: 1,
      onUpdate: (self) => {
        const i = Math.min(steps.length - 1, Math.floor(self.progress * steps.length));
        stepEl.textContent = String(i + 1).padStart(2, "0");
        gsap.set(stepBar, { scaleX: (i + 1) / steps.length });
      },
    },
  });

  steps.forEach((step) => {
    gsap.from($("img", step), {
      scale: 1.3, ease: "none",
      scrollTrigger: {
        trigger: step, containerAnimation: processTween,
        start: "left right", end: "right 60%", scrub: true,
      },
    });
    gsap.from([$("h3", step), $("p", step), $(".step-num", step)], {
      opacity: 0, y: 24, duration: 0.8, stagger: 0.08, ease: "power3.out",
      scrollTrigger: { trigger: step, containerAnimation: processTween, start: "left 85%" },
    });
  });

  /* ---------- Sustainability ---------- */
  gsap.fromTo(".sustain-media img", { scale: 1.25 }, {
    scale: 1, ease: "none",
    scrollTrigger: { trigger: ".sustain-feature", start: "top bottom", end: "bottom top", scrub: true },
  });
  gsap.from(".pillars li", {
    opacity: 0, x: 30, duration: 1, stagger: 0.1, ease: "expo.out",
    scrollTrigger: { trigger: ".pillars", start: "top 85%" },
  });
  gsap.from(".certs-list li", {
    opacity: 0, scale: 0.9, duration: 0.8, stagger: 0.07, ease: "back.out(1.6)",
    scrollTrigger: { trigger: ".certs", start: "top 85%" },
  });

  /* ---------- Global reach: draw routes ---------- */
  const routes = $$("[data-routes] .routes path");
  routes.forEach((p) => {
    const len = p.getTotalLength();
    gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
  });
  gsap.timeline({ scrollTrigger: { trigger: ".reach-map", start: "top 78%" } })
    .from(".map-dots", { opacity: 0, duration: 1 })
    .from(".nodes .origin", { scale: 0, svgOrigin: "428 176", duration: 0.6, ease: "back.out(2)" }, 0.2)
    .to(routes, { strokeDashoffset: 0, duration: 1.6, stagger: 0.15, ease: "power2.inOut" }, 0.4)
    .from(".nodes circle:not(.origin):not(.origin-pulse)", { scale: 0, transformOrigin: "50% 50%", duration: 0.5, stagger: 0.15, ease: "back.out(2)" }, 1.4)
    .from(".labels text", { opacity: 0, y: 6, duration: 0.6, stagger: 0.08 }, 1.5);
  gsap.fromTo(".origin-pulse", { scale: 0.6, opacity: 0.35, svgOrigin: "428 176" }, { scale: 2.4, svgOrigin: "428 176", opacity: 0, duration: 2, repeat: -1, ease: "power1.out" });
  gsap.from(".markets li", {
    opacity: 0, y: 12, duration: 0.6, stagger: 0.04, ease: "power2.out",
    scrollTrigger: { trigger: ".markets", start: "top 88%" },
  });

  /* ---------- Quality band ---------- */
  gsap.fromTo(".quality-media img", { yPercent: -6, scale: 1.15 }, {
    yPercent: 6, ease: "none",
    scrollTrigger: { trigger: ".quality", start: "top bottom", end: "bottom top", scrub: true },
  });
  gsap.from(".quality-title", {
    opacity: 0, y: 30, duration: 1.1, ease: "expo.out",
    scrollTrigger: { trigger: ".quality", start: "top 80%" },
  });
  gsap.from(".quality-steps li", {
    opacity: 0, y: 24, duration: 1, stagger: 0.12, ease: "expo.out",
    scrollTrigger: { trigger: ".quality-steps", start: "top 88%" },
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
