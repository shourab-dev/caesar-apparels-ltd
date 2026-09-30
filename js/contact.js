/* ==========================================================
   Caesar Apparels Ltd — Contact page (requires common.js)
   ========================================================== */
(() => {
  if (!window.CA) return;
  const { $, $$, reduceMotion, header } = window.CA;
  if (window.MotionPathPlugin) gsap.registerPlugin(MotionPathPlugin);

  /* ---------- Markup prep ---------- */
  // Title lines -> words -> characters (words stay unbroken)
  $$(".ct-line").forEach((line) => {
    line.innerHTML = line.textContent.trim().split(" ")
      .map((w) => `<span style="display:inline-block;white-space:nowrap">${[...w].map((c) => `<span class="ct-char">${c}</span>`).join("")}</span>`)
      .join(" ");
  });

  // Preselect a topic from ?topic=quote etc.
  const topic = new URLSearchParams(location.search).get("topic");
  if (topic) {
    const radio = $(`.chip input[value="${CSS.escape(topic)}"]`);
    if (radio) radio.checked = true;
  }

  // Coming from a certificate: ask for a copy
  const cert = new URLSearchParams(location.search).get("cert");
  if (cert) {
    const msg = document.getElementById("f-message");
    if (msg && !msg.value) msg.value = `Please share a copy of your ${cert} certificate.\n\n`;
  }

  // Coming from the catalogue: prefill the message with the chosen style
  const style = new URLSearchParams(location.search).get("style");
  if (style) {
    const msg = document.getElementById("f-message");
    if (msg && !msg.value) msg.value = `I'm interested in this style from your catalogue: ${style}.\n\n`;
  }

  /* ---------- Live clocks (Bangladesh, Hong Kong) ---------- */
  const timeParts = (tz) => {
    const parts = new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).formatToParts(new Date());
    const get = (t) => +parts.find((p) => p.type === t).value;
    return { h: get("hour") % 24, m: get("minute"), s: get("second") };
  };
  const pad = (n) => String(n).padStart(2, "0");
  // Hands only ever rotate forwards, so 59s -> 0s ticks on instead of spinning back.
  const forward = (el, target) => {
    const cur = el._rot ?? target;
    let next = target;
    while (next < cur - 0.01) next += 360;
    el._rot = next;
    return next;
  };
  const clocks = $$("[data-clock]").map((el) => ({
    tz: el.dataset.clock,
    h: $(".hand-h", el), m: $(".hand-m", el), s: $(".hand-s", el),
    text: $("[data-clock-text]", el),
  }));
  const accTimes = $$("[data-tz]");

  function tick(first = false) {
    clocks.forEach((c) => {
      const { h, m, s } = timeParts(c.tz);
      const angles = [[c.h, (h % 12) * 30 + m * 0.5], [c.m, m * 6 + s * 0.1], [c.s, s * 6]];
      angles.forEach(([hand, a], i) => {
        const rot = forward(hand, a);
        if (first || reduceMotion) gsap.set(hand, { rotation: rot, svgOrigin: "50 50" });
        else gsap.to(hand, { rotation: rot, svgOrigin: "50 50", duration: i === 2 ? 0.6 : 0.8, ease: i === 2 ? "elastic.out(1.1, 0.45)" : "power2.out" });
      });
      c.text.textContent = `${pad(h)}:${pad(m)}`;
    });
    accTimes.forEach((el) => {
      const { h, m } = timeParts(el.dataset.tz);
      el.textContent = `${pad(h)}:${pad(m)} local time`;
    });
  }
  tick(true);
  setInterval(tick, 1000);

  /* ---------- Office accordion ---------- */
  $$(".acc-item").forEach((item) => {
    const btn = $(".acc-btn", item);
    const panel = $(".acc-panel", item);
    btn.addEventListener("click", () => {
      const open = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!open));
      item.classList.toggle("is-open", !open);
      if (reduceMotion) { panel.hidden = open; return; }
      if (open) {
        gsap.to(panel, { height: 0, duration: 0.5, ease: "power3.inOut", onComplete: () => { panel.hidden = true; gsap.set(panel, { clearProps: "height" }); } });
      } else {
        panel.hidden = false;
        gsap.fromTo(panel, { height: 0 }, { height: "auto", duration: 0.6, ease: "expo.out", onComplete: () => ScrollTrigger.refresh() });
        gsap.fromTo($(".acc-inner", panel).children, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.06, ease: "power3.out", delay: 0.1 });
      }
    });
  });

  /* ---------- Copy email buttons ---------- */
  $$("[data-copy]").forEach((btn) => {
    const label = $("span", btn);
    btn.addEventListener("click", async () => {
      try { await navigator.clipboard.writeText(btn.dataset.copy); } catch (e) { return; }
      btn.classList.add("is-done");
      gsap.timeline()
        .to(label, { yPercent: -120, duration: 0.2, ease: "power2.in" })
        .add(() => (label.textContent = "Copied"))
        .fromTo(label, { yPercent: 120 }, { yPercent: 0, duration: 0.35, ease: "back.out(2)" })
        .to(label, { yPercent: -120, duration: 0.2, ease: "power2.in", delay: 1.4 })
        .add(() => { label.textContent = "Copy"; btn.classList.remove("is-done"); })
        .fromTo(label, { yPercent: 120 }, { yPercent: 0, duration: 0.35, ease: "power3.out" });
    });
  });

  /* ---------- Enquiry form ---------- */
  const form = $("[data-form]");
  const status = $("[data-status]");
  const success = $("[data-success]");
  const submitBtn = $("[data-submit]");
  const submitText = $(".ct-submit-text", submitBtn);
  const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const rules = {
    name: (v) => v.trim().length > 0,
    company: (v) => v.trim().length > 0,
    email: (v) => EMAIL.test(v.trim()),
    message: (v) => v.trim().length > 0,
  };
  let attempted = false;

  function check(name) {
    const input = form.elements[name];
    const field = input.closest(".field");
    const ok = rules[name](input.value);
    field.classList.toggle("is-invalid", !ok);
    input.setAttribute("aria-invalid", String(!ok));
    if (!ok) input.setAttribute("aria-describedby", `e-${name}`);
    else input.removeAttribute("aria-describedby");
    return ok;
  }
  Object.keys(rules).forEach((name) => {
    const input = form.elements[name];
    input.addEventListener("blur", () => attempted && check(name));
    input.addEventListener("input", () => attempted && check(name));
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    attempted = true;
    const bad = Object.keys(rules).filter((n) => !check(n));
    if (bad.length) {
      const first = form.elements[bad[0]];
      first.focus({ preventScroll: true });
      window.CA.lenis ? window.CA.lenis.scrollTo(first.closest(".field"), { offset: -160 }) : first.scrollIntoView({ block: "center" });
      status.textContent = `Please fix ${bad.length} field${bad.length > 1 ? "s" : ""} before sending.`;
      if (!reduceMotion) {
        bad.forEach((n) => gsap.fromTo(form.elements[n].closest(".field"), { x: 0 }, { keyframes: { x: [-8, 8, -6, 6, -3, 0] }, duration: 0.45, ease: "none" }));
      }
      return;
    }

    const data = new FormData(form);
    const topicLabel = $(".chip input:checked + span", form).textContent;
    const lines = [`Topic: ${topicLabel}`, `Name: ${data.get("name")}`, `Company: ${data.get("company")}`, `Email: ${data.get("email")}`];
    [["phone", "Phone"], ["country", "Country"], ["category", "Product category"], ["quantity", "Estimated quantity per style"]]
      .forEach(([key, label]) => data.get(key) && lines.push(`${label}: ${data.get(key)}`));
    lines.push("", data.get("message"));
    const subject = `Enquiry: ${topicLabel} — ${data.get("company")}`;
    const mailto = `mailto:info@caesargroup.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n"))}`;

    submitBtn.disabled = true;
    submitText.textContent = "Opening your email app…";
    setTimeout(() => {
      window.location.href = mailto;
      showSuccess();
    }, reduceMotion ? 0 : 500);
  });

  function showSuccess() {
    success.hidden = false;
    status.textContent = "Your message is ready in your email app.";
    submitBtn.disabled = false;
    submitText.textContent = "Send enquiry";
    if (reduceMotion) return;
    const circle = $(".ct-check circle", success);
    const path = $(".ct-check path", success);
    [circle, path].forEach((el) => { const l = el.getTotalLength(); gsap.set(el, { strokeDasharray: l, strokeDashoffset: l }); });
    gsap.timeline({ defaults: { ease: "expo.out" } })
      .fromTo(success, { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: 0.8, ease: "expo.inOut" })
      .to(circle, { strokeDashoffset: 0, duration: 0.8, ease: "power2.inOut" }, 0.4)
      .to(path, { strokeDashoffset: 0, duration: 0.5, ease: "power2.out" }, 0.9)
      .from(success.querySelectorAll("h3, p, button"), { y: 24, opacity: 0, duration: 0.8, stagger: 0.08 }, 0.7);
  }

  $("[data-reset]").addEventListener("click", () => {
    form.reset();
    attempted = false;
    $$(".field", form).forEach((f) => f.classList.remove("is-invalid"));
    const hide = () => { success.hidden = true; gsap.set(success, { clearProps: "clipPath" }); form.elements.name.focus(); };
    if (reduceMotion) return hide();
    gsap.to(success, { clipPath: "inset(100% 0 0 0)", duration: 0.7, ease: "expo.inOut", onComplete: hide });
  });

  if (reduceMotion) {
    gsap.set([header, ".ct-title", ".ct-kicker", ".ct-lede", ".ct-quick"], { opacity: 1 });
    return;
  }

  /* ---------- Intro ---------- */
  gsap.set([".ct-title", ".ct-kicker", ".ct-lede", ".ct-quick"], { opacity: 1 });
  gsap.timeline({ defaults: { ease: "expo.out" }, delay: 0.1 })
    .fromTo(".ct-kicker", { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 1 }, 0.1)
    .fromTo(".ct-char", { yPercent: 115, rotate: 10 }, { yPercent: 0, rotate: 0, duration: 1.3, stagger: 0.025 }, 0.2)
    .fromTo(".ct-lede", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1.1 }, 0.9)
    .fromTo(".ct-quick li", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1.1, stagger: 0.1 }, 1.05)
    .fromTo(header, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 1, clearProps: "transform" }, 0.8);

  // A plane flies the route, drawing its dashed trail; then keeps flying it on a loop.
  const clipRect = $("[data-thread-clip]");
  const plane = $(".ct-plane");
  const threadPath = $("#thread-path");
  if (window.MotionPathPlugin) {
    const flight = { path: threadPath, align: threadPath, alignOrigin: [0.5, 0.5], autoRotate: true };
    gsap.set(clipRect, { attr: { width: 0 } });
    gsap.timeline({ delay: 0.6 })
      .fromTo(plane, { opacity: 0 }, { opacity: 1, duration: 0.3 }, 0)
      .to(plane, { motionPath: flight, duration: 3.6, ease: "power1.inOut" }, 0)
      .to(clipRect, { attr: { width: 1520 }, duration: 3.6, ease: "power1.inOut" }, 0)
      .to(plane, { opacity: 0, duration: 0.3 }, 3.3)
      .add(() => {
        gsap.to(threadPath, { strokeDashoffset: -150, duration: 4, ease: "none", repeat: -1 });
        gsap.timeline({ repeat: -1, repeatDelay: 2.5, delay: 1.5 })
          .to(plane, { motionPath: flight, duration: 7, ease: "none" }, 0)
          .fromTo(plane, { opacity: 0 }, { opacity: 1, duration: 0.4 }, 0)
          .to(plane, { opacity: 0, duration: 0.4 }, 6.6);
      });
  } else {
    gsap.set(plane, { display: "none" });
  }
  // Thread drifts slower than the page while scrolling out of the hero
  gsap.to(".ct-thread", {
    yPercent: 25, ease: "none",
    scrollTrigger: { trigger: ".ct-hero", start: "top top", end: "bottom top", scrub: true },
  });

  /* ---------- Form & info reveals ---------- */
  gsap.from(".chip", {
    scale: 0.6, opacity: 0, duration: 0.7, stagger: 0.05, ease: "back.out(2)",
    scrollTrigger: { trigger: ".chips", start: "top 85%" },
  });
  gsap.from(".fields .field", {
    y: 30, opacity: 0, duration: 0.9, stagger: 0.07, ease: "expo.out",
    scrollTrigger: { trigger: ".fields", start: "top 85%" },
  });
  gsap.from(".ct-submit-row", {
    y: 24, opacity: 0, duration: 0.9, ease: "expo.out",
    scrollTrigger: { trigger: ".ct-submit-row", start: "top 92%" },
  });
  gsap.fromTo(".ct-info-inner", { clipPath: "inset(0 0 100% 0 round 8px)" }, {
    clipPath: "inset(0 0 0% 0 round 8px)", duration: 1.4, ease: "expo.inOut",
    scrollTrigger: { trigger: ".ct-info", start: "top 80%" },
  });
  gsap.from(".ct-info-inner > *", {
    y: 30, opacity: 0, duration: 1, stagger: 0.1, ease: "expo.out", delay: 0.5,
    scrollTrigger: { trigger: ".ct-info", start: "top 80%" },
  });
  gsap.to(".ct-info-inner", {
    "--spin": 1, ease: "none",
    scrollTrigger: { trigger: ".ct-main", start: "top bottom", end: "bottom top", scrub: true },
  });

  // Selected chip gives a small pop
  $$(".chip input").forEach((input) => input.addEventListener("change", () => {
    gsap.fromTo(input.nextElementSibling, { scale: 0.92 }, { scale: 1, duration: 0.5, ease: "back.out(3)" });
  }));

  /* ---------- Offices ---------- */
  gsap.from(".clock", {
    scale: 0.7, opacity: 0, duration: 1, stagger: 0.12, ease: "back.out(1.8)",
    scrollTrigger: { trigger: ".clocks", start: "top 88%" },
  });
  gsap.from(".acc-item", {
    y: 50, opacity: 0, duration: 1.1, stagger: 0.1, ease: "expo.out",
    scrollTrigger: { trigger: ".acc", start: "top 85%" },
  });
})();
