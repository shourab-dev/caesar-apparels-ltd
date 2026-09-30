/* ==========================================================
   Caesar Apparels Ltd — Home page (requires common.js)
   ========================================================== */
(() => {
  if (!window.CA) return;
  const { $, $$, reduceMotion, header, fmt } = window.CA;

  /* ---------- Capacity: final state (animated later unless reduced motion) ---------- */
  const odoStrips = $$(".odo-digit");
  const odoTarget = (d) => -(10 + +d.dataset.digit) * 5; // strip holds 0-9 twice; each digit is 5% of it
  odoStrips.forEach((d) => gsap.set($(".odo-strip", d), { yPercent: odoTarget(d) }));
  const capCounts = $$("[data-cap-count]");
  capCounts.forEach((el) => (el.textContent = fmt(+el.dataset.capCount)));

  // Linked hover between bar segments and legend
  const stack = $(".stack");
  if (stack) {
    const parts = $$("[data-seg]", stack);
    parts.forEach((el) => {
      el.addEventListener("pointerenter", () => {
        stack.classList.add("is-focus");
        parts.forEach((p) => p.classList.toggle("is-active", p.dataset.seg === el.dataset.seg));
      });
      el.addEventListener("pointerleave", () => {
        stack.classList.remove("is-focus");
        parts.forEach((p) => p.classList.remove("is-active"));
      });
    });
  }

  /* ---------- Hero slider ---------- */
  const slides = $$(".hero-slide");
  const captions = ["Stitching line, Chittagong", "Production floor", "Denim finishing", "Outbound from Chittagong port"];
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
      .fromTo(header, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 1, clearProps: "transform" }, 1.6)
      .add(runBar, 1.8);
  }

  /* ---------- Certificates: auto-sliding carousel, drag, dialog (works with or without motion) ---------- */
  const certTrack = $("[data-cert-track]");
  const certItems = $$(".cert", certTrack);
  const certDotsEl = $("[data-cert-dots]");
  const CERT_DELAY = 4; // seconds each slide stays before auto-advancing
  const certStep = () => certItems[0].getBoundingClientRect().width + parseFloat(getComputedStyle(certTrack).columnGap || 0);
  const certLast = () => Math.max(0, Math.round((certTrack.scrollWidth - certTrack.clientWidth) / certStep()));
  let certIndex = 0;
  let certDots = [];
  let certTimer = null;
  const certPause = new Set(reduceMotion ? ["reduced-motion"] : []); // reasons autoplay is paused

  function buildCertDots() {
    const n = certLast() + 1;
    if (certDots.length !== n) {
      certDotsEl.innerHTML = Array.from({ length: n }, (_, i) =>
        `<button type="button" class="cert-dot" aria-label="Go to slide ${i + 1} of ${n}"><span class="cert-dot-fill"></span></button>`).join("");
      certDots = $$(".cert-dot", certDotsEl);
      certDots.forEach((d, i) => d.addEventListener("click", () => goToCert(i)));
    }
    certIndex = Math.min(certIndex, n - 1);
    markCertDot();
  }
  function markCertDot() {
    certDots.forEach((d, i) => {
      d.setAttribute("aria-current", String(i === certIndex));
      gsap.set($(".cert-dot-fill", d), { clearProps: "transform" });
    });
  }
  function restartCertTimer() {
    certTimer && certTimer.kill();
    certTimer = null;
    const fill = certDots[certIndex] && $(".cert-dot-fill", certDots[certIndex]);
    if (!fill || certPause.has("reduced-motion")) return;
    // The active dot fills up while the slide is shown, then the slider advances.
    certTimer = gsap.fromTo(fill, { scaleX: 0 }, { scaleX: 1, duration: CERT_DELAY, ease: "none", onComplete: () => goToCert(certIndex + 1) });
    if (certPause.size) certTimer.pause();
  }
  function goToCert(i) {
    const last = certLast();
    certIndex = i > last ? 0 : i < 0 ? last : i; // wrap around at both ends
    certTrack.scrollTo({ left: certIndex * certStep(), behavior: reduceMotion ? "auto" : "smooth" });
    markCertDot();
    restartCertTimer();
  }
  function setCertPause(reason, on) {
    on ? certPause.add(reason) : certPause.delete(reason);
    if (!certTimer) return;
    certPause.size ? certTimer.pause() : certTimer.resume();
  }

  $("[data-cert-prev]").addEventListener("click", () => goToCert(certIndex - 1));
  $("[data-cert-next]").addEventListener("click", () => goToCert(certIndex + 1));

  // Keep the active dot in sync when the row is swiped or dragged
  let certScrollEnd;
  certTrack.addEventListener("scroll", () => {
    clearTimeout(certScrollEnd);
    certScrollEnd = setTimeout(() => {
      const i = Math.min(certLast(), Math.round(certTrack.scrollLeft / certStep()));
      if (i !== certIndex) { certIndex = i; markCertDot(); restartCertTimer(); }
    }, 140);
  }, { passive: true });

  // Pause while the cards or controls are hovered, keyboard-focused, or off-screen
  const certSection = $(".certificates");
  [certTrack, $(".cert-controls")].forEach((el) => {
    el.addEventListener("pointerenter", () => setCertPause("hover", true));
    el.addEventListener("pointerleave", () => setCertPause("hover", false));
  });
  certSection.addEventListener("focusin", (e) => setCertPause("focus", e.target.matches(":focus-visible")));
  certSection.addEventListener("focusout", () => setCertPause("focus", false));
  setCertPause("offscreen", true);
  new IntersectionObserver(([entry]) => setCertPause("offscreen", !entry.isIntersecting), { threshold: 0.25 }).observe(certSection);

  let certResize;
  window.addEventListener("resize", () => {
    clearTimeout(certResize);
    certResize = setTimeout(() => { buildCertDots(); goToCert(certIndex); }, 200);
  });
  buildCertDots();
  restartCertTimer();

  // Drag to scroll with a mouse (touch already scrolls natively)
  let drag = null;
  let dragged = false;
  certTrack.addEventListener("pointerdown", (e) => {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    drag = { x: e.clientX, left: certTrack.scrollLeft };
    dragged = false;
  });
  window.addEventListener("pointermove", (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.x;
    if (!dragged && Math.abs(dx) > 5) { dragged = true; certTrack.classList.add("is-dragging"); setCertPause("drag", true); }
    if (dragged) certTrack.scrollLeft = drag.left - dx;
  });
  window.addEventListener("pointerup", () => {
    if (!drag) return;
    drag = null;
    if (!dragged) return;
    certTrack.classList.remove("is-dragging");
    setCertPause("drag", false);
    goToCert(Math.round(certTrack.scrollLeft / certStep())); // settle on the nearest card
    setTimeout(() => (dragged = false), 0);
  });

  const certDlg = $("[data-cert-dlg]");
  const certDlgCard = $(".cert-dlg-card", certDlg);
  const D = (k) => $(`[data-cert-dlg-${k}]`, certDlg);
  function openCert(item) {
    const file = item.dataset.file;
    const titleEl = $(".cert-title", item);
    const plain = titleEl.textContent.trim();
    const media = D("media");
    media.innerHTML = "";
    if (file) {
      const img = new Image();
      img.src = file;
      img.alt = `${plain} certificate issued to Caesar Apparels Limited`;
      media.appendChild(img);
    } else {
      const paper = $(".cert-paper", item).cloneNode(true);
      paper.removeAttribute("style");
      paper.setAttribute("aria-hidden", "true");
      media.appendChild(paper);
    }
    D("title").innerHTML = titleEl.innerHTML;
    D("full").textContent = $(".cert-full", item).textContent;
    D("text").textContent = item.dataset.text;
    D("copy").textContent = file ? "Shown here — open in full below" : "Available on request";
    D("request").href = `contact.html?topic=compliance&cert=${encodeURIComponent(plain)}#enquiry`;
    const fileLink = D("file");
    fileLink.hidden = !file;
    if (file) fileLink.href = file;
    certDlg.showModal();
    setCertPause("dialog", true);
    window.CA.lenis && window.CA.lenis.stop();
    if (!reduceMotion) {
      gsap.fromTo(certDlgCard, { opacity: 0, y: 30, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.55, ease: "power3.out" });
      gsap.fromTo(media.firstElementChild, { rotationY: -25, opacity: 0 }, { rotationY: 0, opacity: 1, duration: 0.9, ease: "expo.out", delay: 0.1, transformPerspective: 900 });
    }
  }
  function closeCert() {
    const done = () => { certDlg.close(); setCertPause("dialog", false); window.CA.lenis && window.CA.lenis.start(); };
    if (reduceMotion) return done();
    gsap.to(certDlgCard, { opacity: 0, y: 20, duration: 0.25, ease: "power2.in", onComplete: done });
  }
  certItems.forEach((item) => $(".cert-card", item).addEventListener("click", () => { if (!dragged) openCert(item); }));
  D("close").addEventListener("click", closeCert);
  certDlg.addEventListener("cancel", (e) => { e.preventDefault(); closeCert(); });
  certDlg.addEventListener("click", (e) => { if (e.target === certDlg) closeCert(); });

  if (reduceMotion) return;

  /* ---------- Certificates: deal-in and tilt ---------- */
  gsap.from(certItems, {
    y: 140, opacity: 0, rotation: (i) => [-9, 6, -4, 8, -7, 5, -3][i % 7], duration: 1.3, stagger: 0.08, ease: "expo.out",
    scrollTrigger: { trigger: ".certificates", start: "top 70%", refreshPriority: -1 },
  });
  gsap.from(".cert-seal", {
    rotation: -180, scale: 0.4, opacity: 0, transformOrigin: "50% 50%", duration: 1.4, stagger: 0.08, ease: "expo.out", delay: 0.3,
    scrollTrigger: { trigger: ".certificates", start: "top 70%", refreshPriority: -1 },
  });
  if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    certItems.forEach((item) => {
      const paper = $(".cert-paper", item);
      const rx = gsap.quickTo(paper, "rotationX", { duration: 0.5, ease: "power3" });
      const ry = gsap.quickTo(paper, "rotationY", { duration: 0.5, ease: "power3" });
      const lift = gsap.quickTo(paper, "y", { duration: 0.5, ease: "power3" });
      item.addEventListener("pointermove", (e) => {
        const r = item.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        ry((px - 0.5) * 16);
        rx((0.5 - py) * 12);
        lift(-10);
        paper.style.setProperty("--gx", `${px * 100}%`);
        paper.style.setProperty("--gy", `${py * 100}%`);
      });
      item.addEventListener("pointerleave", () => { rx(0); ry(0); lift(0); });
    });
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
  /* ---------- Capacity ---------- */
  const capacity = $("[data-capacity]");
  const capTl = gsap.timeline({ paused: true, defaults: { ease: "expo.out" } });
  odoStrips.forEach((d, i) => {
    capTl.fromTo($(".odo-strip", d), { yPercent: 0 }, { yPercent: odoTarget(d), duration: 2 + i * 0.18, ease: "expo.inOut" }, i * 0.06);
  });
  capTl
    .fromTo(".odo-sep", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8 }, 0.4)
    .fromTo(".odo-unit", { opacity: 0, x: -24 }, { opacity: 1, x: 0, duration: 1.2 }, 1.2)
    .fromTo(".stitch", { scaleX: 0, transformOrigin: "left" }, { scaleX: 1, duration: 1.6, ease: "power3.inOut" }, 0.6);
  $$(".seg-fill").forEach((seg, i) => {
    capTl.fromTo(seg, { scaleX: 0 }, { scaleX: 1, duration: 0.9, ease: "power4.inOut" }, 1.1 + i * 0.35);
  });
  $$(".legend-item").forEach((item, i) => {
    const num = $("[data-cap-count]", item);
    const obj = { v: 0 };
    capTl
      .fromTo(item, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1 }, 1.35 + i * 0.35)
      .to(obj, { v: +num.dataset.capCount, duration: 1.2, ease: "power2.out", onUpdate: () => (num.textContent = fmt(obj.v)) }, 1.35 + i * 0.35);
  });
  $$(".capacity-facts .fact").forEach((fact, i) => {
    capTl.fromTo(fact, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1.1 }, 2.4 + i * 0.12);
  });
  $$(".capacity-facts [data-cap-count]").forEach((num) => {
    const obj = { v: 0 };
    capTl.to(obj, { v: +num.dataset.capCount, duration: 1.8, ease: "power3.out", onUpdate: () => (num.textContent = fmt(obj.v)) }, 2.4);
  });
  capTl.add(startLiveTicker, 2.8);
  ScrollTrigger.create({ trigger: capacity, start: "top 65%", once: true, onEnter: () => capTl.play() });

  // Running stitches along the bar
  gsap.to(".stitch line", { strokeDashoffset: -180, duration: 3, ease: "none", repeat: -1 });

  // Subtle drift of the big number while scrolling past
  gsap.fromTo(".odo-num", { xPercent: 2 }, {
    xPercent: -3, ease: "none",
    scrollTrigger: { trigger: capacity, start: "top bottom", end: "bottom top", scrub: true },
  });

  // Live ticker: garments made since the page opened, at full monthly capacity
  const PER_SECOND = 550000 / (30 * 24 * 60 * 60); // ≈ 0.212 pieces/s ≈ 12.7 per minute
  const PERIOD = 1 / PER_SECOND;
  const pageStart = performance.now();
  const liveNum = $("[data-live-count]");
  function startLiveTicker() {
    const update = () => {
      liveNum.textContent = fmt(Math.floor(((performance.now() - pageStart) / 1000) * PER_SECOND));
      gsap.fromTo(liveNum, { scale: 1.3, transformOrigin: "left bottom" }, { scale: 1, duration: 0.6, ease: "back.out(3)" });
    };
    update();
    const elapsed = ((performance.now() - pageStart) / 1000) % PERIOD;
    gsap.fromTo("[data-live-arc]", { strokeDashoffset: 125.66 }, {
      strokeDashoffset: 0, duration: PERIOD, ease: "none", repeat: -1, onRepeat: update,
    }).progress(elapsed / PERIOD);
  }

  // Cursor glow
  if (window.matchMedia("(hover: hover)").matches) {
    capacity.addEventListener("pointermove", (e) => {
      const r = capacity.getBoundingClientRect();
      gsap.to(capacity, { "--mx": `${e.clientX - r.left}px`, "--my": `${e.clientY - r.top}px`, duration: 0.8, ease: "power3.out", overwrite: "auto" });
    });
  }

  gsap.from(".fabrics-list li", {
    opacity: 0, y: 14, duration: 0.7, stagger: 0.06, ease: "power3.out",
    scrollTrigger: { trigger: ".fabrics", start: "top 92%" },
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
})();
