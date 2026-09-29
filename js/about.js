/* ==========================================================
   Caesar Apparels Ltd — About page (requires common.js)
   ========================================================== */
(() => {
  if (!window.CA) return;
  const { $, $$, reduceMotion, header, fmt } = window.CA;

  /* ---------- Markup prep (runs for everyone) ---------- */
  // Hero words -> characters
  $$(".ab-word").forEach((w) => {
    w.innerHTML = [...w.textContent].map((c) => `<span class="ab-char">${c}</span>`).join("");
  });

  // Statement -> words, lit up on scroll
  const statement = $("[data-statement]");
  statement.setAttribute("aria-label", statement.textContent.trim());
  statement.innerHTML = statement.textContent.trim().split(/\s+/)
    .map((w) => `<span class="sw" aria-hidden="true">${w}</span>`).join(" ");

  // Certification names keep their real text for scrambling
  $$("[data-scramble]").forEach((el) => (el.dataset.text = el.textContent));

  if (reduceMotion) {
    gsap.set([header, ".ab-hero-title", ".ab-hero-top", ".ab-scroll-cue", ".ab-hero-after"], { opacity: 1 });
    return;
  }

  const isSmall = () => window.innerWidth <= 720;

  /* ---------- Intro (page load) ---------- */
  gsap.set([".ab-hero-title", ".ab-hero-top", ".ab-scroll-cue"], { opacity: 1 });
  gsap.timeline({ defaults: { ease: "expo.out" }, delay: 0.1 })
    .fromTo(".ab-hero-media", { scale: 0 }, { scale: 1, duration: 1.6, ease: "expo.inOut" }, 0)
    .fromTo(".ab-hero-media img", { scale: 1.6 }, { scale: 1, duration: 2.2, ease: "expo.out" }, 0.4)
    .fromTo(".ab-char", { yPercent: 110, rotate: 8 }, { yPercent: 0, rotate: 0, duration: 1.3, stagger: 0.035 }, 0.5)
    .fromTo([".ab-hero-top .kicker", ".ab-hero-lede"], { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 1, stagger: 0.1 }, 1.1)
    .fromTo(".ab-scroll-cue", { opacity: 0 }, { opacity: 1, duration: 1 }, 1.4)
    .fromTo(header, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 1 }, 1.2);

  /* ---------- Hero: pinned zoom-through ---------- */
  gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      trigger: "[data-ab-hero]",
      start: "top top",
      end: "+=150%",
      pin: ".ab-hero-pin",
      scrub: 1,
      invalidateOnRefresh: true,
      anticipatePin: 1,
    },
  })
    .fromTo(".ab-hero-media",
      { clipPath: () => (isSmall() ? "inset(40% 28% 40% 28% round 6px)" : "inset(39% 39% 39% 39% round 6px)") },
      { clipPath: "inset(0% 0% 0% 0% round 0px)", ease: "power2.inOut", duration: 1 }, 0)
    .to('.ab-row[data-row="0"]', { x: () => -window.innerWidth * 0.45, yPercent: -60, opacity: 0, duration: 0.8 }, 0)
    .to('.ab-row[data-row="1"]', { x: () => window.innerWidth * 0.45, yPercent: 60, opacity: 0, duration: 0.8 }, 0)
    .to(".ab-hero-top", { y: -40, opacity: 0, duration: 0.4 }, 0)
    .to(".ab-scroll-cue", { opacity: 0, duration: 0.2 }, 0)
    .to(".ab-hero-shade", { opacity: 1, duration: 0.5 }, 0.45)
    .fromTo(".ab-hero-after", { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 0.45 }, 0.7);

  /* ---------- Statement: words light up with scroll ---------- */
  gsap.to(".statement .sw", {
    opacity: 1, stagger: 0.1, ease: "none",
    scrollTrigger: { trigger: statement, start: "top 80%", end: "bottom 45%", scrub: true },
  });

  /* ---------- Values: stacking cards ---------- */
  const cards = $$(".value-card");
  cards.forEach((card, i) => {
    gsap.fromTo($("img", card), { scale: 1.3 }, {
      scale: 1, ease: "none",
      scrollTrigger: { trigger: card, start: "top bottom", end: "top top", scrub: true },
    });
    gsap.from([$(".value-title", card), $(".value-text", card), $(".value-tag", card)], {
      y: 40, opacity: 0, duration: 1.1, stagger: 0.1, ease: "expo.out",
      scrollTrigger: { trigger: card, start: "top 70%" },
    });
    const next = cards[i + 1];
    if (!next) return;
    gsap.to(card, {
      scale: 0.92, filter: "brightness(0.78)", ease: "none",
      scrollTrigger: {
        trigger: next,
        start: "top 75%",
        end: () => `top ${parseFloat(getComputedStyle(next).top)}px`,
        scrub: true,
        invalidateOnRefresh: true,
      },
    });
  });

  /* ---------- Numbers: pinned horizontal, outlines fill and count ---------- */
  const numTrack = $(".numbers-track");
  const numList = $(".numbers-list");
  const numBar = $("[data-numbers-bar]");
  const numDistance = () => Math.max(0, numList.scrollWidth - numTrack.clientWidth + parseFloat(getComputedStyle(numTrack).paddingLeft));

  const numTween = gsap.to(numList, {
    x: () => -numDistance(),
    ease: "none",
    scrollTrigger: {
      trigger: "[data-numbers]",
      start: "top top",
      end: () => "+=" + numDistance(),
      pin: ".numbers-pin",
      scrub: 0.8,
      invalidateOnRefresh: true,
      anticipatePin: 1,
      onUpdate: (self) => gsap.set(numBar, { scaleX: self.progress }),
    },
  });

  $$(".num-panel").forEach((panel) => {
    const outline = $(".num-outline", panel);
    const fill = $(".num-fill", panel);
    const end = fill.dataset.num ? +fill.dataset.num : null;
    // One scrubbed timeline per panel: fill rises, number counts, label appears.
    // The count writes to both layers so the outline and fill always line up.
    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: { trigger: panel, containerAnimation: numTween, start: "left 90%", end: "left 35%", scrub: true },
    });
    tl.fromTo(fill, { clipPath: "inset(100% 0 0 0)" }, { clipPath: "inset(0% 0 0 0)", duration: 1 }, 0)
      .fromTo($(".num-label", panel), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4 }, 0.5)
      .fromTo(outline, { opacity: 1 }, { opacity: 0, duration: 0.25 }, 0.75);
    if (end !== null) {
      const obj = { v: 0 };
      tl.to(obj, {
        v: end, duration: 0.8, ease: "power2.out",
        onUpdate: () => { outline.textContent = fill.textContent = fmt(obj.v); },
      }, 0);
    }
  });

  /* ---------- Services: rows + cursor-following image ---------- */
  const svcList = $("[data-svc]");
  const rows = $$(".svc", svcList);
  gsap.from(rows, {
    y: 50, opacity: 0, duration: 1.1, stagger: 0.08, ease: "expo.out",
    scrollTrigger: { trigger: svcList, start: "top 80%" },
  });

  const cursor = $("[data-svc-cursor]");
  const cursorImg = $("img", cursor);
  if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    const xTo = gsap.quickTo(cursor, "x", { duration: 0.6, ease: "power3" });
    const yTo = gsap.quickTo(cursor, "y", { duration: 0.6, ease: "power3" });
    const rTo = gsap.quickTo(cursor, "rotation", { duration: 0.5, ease: "power3" });
    let lastX = 0;
    let first = true;

    svcList.addEventListener("pointermove", (e) => {
      if (first) { gsap.set(cursor, { x: e.clientX, y: e.clientY }); first = false; }
      xTo(e.clientX);
      yTo(e.clientY);
      rTo(gsap.utils.clamp(-14, 14, (e.clientX - lastX) * 0.6));
      lastX = e.clientX;
    });
    svcList.addEventListener("pointerenter", () => gsap.to(cursor, { opacity: 1, scale: 1, duration: 0.5, ease: "expo.out", overwrite: "auto" }));
    svcList.addEventListener("pointerleave", () => {
      first = true;
      gsap.to(cursor, { opacity: 0, scale: 0.6, duration: 0.4, ease: "power3.in", overwrite: "auto" });
    });
    rows.forEach((row) => {
      row.addEventListener("pointerenter", () => {
        const src = row.dataset.img;
        if (cursorImg.getAttribute("src") === src) return;
        cursorImg.src = src;
        gsap.fromTo(cursorImg, { clipPath: "inset(100% 0 0 0)", scale: 1.3 }, { clipPath: "inset(0% 0 0 0)", scale: 1, duration: 0.7, ease: "expo.out" });
      });
    });
  }

  /* ---------- Gallery: columns at different speeds ---------- */
  $$(".gal-col").forEach((col) => {
    gsap.fromTo(col, { yPercent: 0 }, {
      yPercent: +col.dataset.speed, ease: "none",
      scrollTrigger: { trigger: ".ab-gallery", start: "top bottom", end: "bottom top", scrub: true },
    });
  });
  $$(".gal-item").forEach((item) => {
    gsap.fromTo(item, { clipPath: "inset(0 0 100% 0)" }, {
      clipPath: "inset(0 0 0% 0)", duration: 1.4, ease: "expo.inOut",
      scrollTrigger: { trigger: item, start: "top 90%" },
    });
    gsap.to($("img", item), {
      scale: 1, ease: "none",
      scrollTrigger: { trigger: item, start: "top bottom", end: "bottom top", scrub: true },
    });
  });
  gsap.from(".gal-copy .body, .gal-copy .text-link", {
    opacity: 0, y: 24, duration: 1, stagger: 0.1, ease: "power3.out",
    scrollTrigger: { trigger: ".gal-copy", start: "top 80%" },
  });

  /* ---------- Offices: cards flip up ---------- */
  gsap.from(".office", {
    rotateX: -75, y: 80, opacity: 0, duration: 1.4, stagger: 0.12, ease: "expo.out",
    scrollTrigger: { trigger: ".office-list", start: "top 82%" },
  });

  /* ---------- Certifications: text scramble ---------- */
  const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*";
  function scramble(el, duration = 1.1, delay = 0) {
    const final = el.dataset.text;
    const obj = { p: 0 };
    gsap.to(obj, {
      p: 1, duration, delay, ease: "none", overwrite: true,
      onUpdate: () => {
        const n = Math.floor(obj.p * final.length);
        el.textContent = final.slice(0, n) + [...final.slice(n)]
          .map((c) => (c === " " ? " " : GLYPHS[(Math.random() * GLYPHS.length) | 0])).join("");
      },
      onComplete: () => (el.textContent = final),
    });
  }
  const scrambleEls = $$("[data-scramble]");
  gsap.set(scrambleEls, { opacity: 0 });
  ScrollTrigger.create({
    trigger: ".scramble-list", start: "top 80%", once: true,
    onEnter: () => scrambleEls.forEach((el, i) => {
      gsap.fromTo(el, { opacity: 0, x: 30 }, { opacity: 1, x: 0, duration: 0.8, delay: i * 0.09, ease: "expo.out" });
      scramble(el, 1.1, i * 0.09);
    }),
  });
  scrambleEls.forEach((el) => el.addEventListener("pointerenter", () => scramble(el, 0.6)));
})();
