/* ==========================================================
   Caesar Apparels Ltd — Careers page (requires common.js + careers-data.js)
   Smooth, calm motion: soft reveals, Flip filtering, eased accordion.
   ========================================================== */
(() => {
  if (!window.CA || !window.CAREERS_JOBS) return;
  const { $, $$, reduceMotion, header, lenis } = window.CA;
  const useFlip = !reduceMotion && window.Flip;
  if (useFlip) gsap.registerPlugin(Flip);

  const JOBS = window.CAREERS_JOBS;
  const LOCS = window.CAREERS_LOCATIONS || {};
  const EMAIL = window.CAREERS_EMAIL || "info@caesargroup.com";
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const plural = (n, w) => `${n} ${w}${n === 1 ? "" : "s"}`;
  const locName = (k) => LOCS[k] || k;
  const locShort = (k) => locName(k).split(" — ")[0];

  const mailto = (subject, body) => `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  const applyLink = (j) => mailto(
    `Application: ${j.title} (${j.ref})`,
    `Dear Caesar Apparels team,\n\nI would like to apply for the ${j.title} role (ref ${j.ref}), based in ${locShort(j.location)}.\n\nPlease find my CV attached.\n\nName:\nPhone:\n\nKind regards,\n`
  );
  const generalLink = mailto(
    "General application",
    "Dear Caesar Apparels team,\n\nI would like to be considered for future roles at Caesar Apparels.\n\nArea of interest:\nPreferred location:\n\nPlease find my CV attached.\n\nName:\nPhone:\n\nKind regards,\n"
  );
  $$("[data-general]").forEach((a) => (a.href = generalLink));

  /* ---------- Hero title: words -> letters ---------- */
  $$(".cr-line").forEach((line) => {
    line.innerHTML = line.textContent.trim().split(" ")
      .map((w) => `<span style="display:inline-block;white-space:nowrap">${[...w].map((c) => `<span class="cr-char" style="display:inline-block">${c}</span>`).join("")}</span>`)
      .join(" ");
  });

  /* ---------- Render jobs ---------- */
  const list = $("[data-jobs]");
  list.innerHTML = JOBS.map((j, i) => `
    <li class="job" id="${esc(j.ref)}" data-i="${i}" data-dept="${esc(j.dept)}" data-loc="${esc(j.location)}">
      <h3 class="job-head">
        <button type="button" class="job-btn" aria-expanded="false" aria-controls="job-panel-${i}" id="job-btn-${i}">
          <span>
            <span class="job-title">${esc(j.title)}</span>
            <span class="job-ref">${esc(j.ref)}</span>
          </span>
          <span class="job-dept">${esc(j.dept)}<span class="job-loc-sm">, ${esc(locShort(j.location))}</span></span>
          <span class="job-loc">${esc(locName(j.location))}</span>
          <span class="job-type">${esc(j.type)}</span>
          <span class="job-icon" aria-hidden="true"></span>
        </button>
      </h3>
      <div class="job-panel" id="job-panel-${i}" role="region" aria-labelledby="job-btn-${i}" hidden>
        <div class="job-inner">
          <div>
            <p class="job-summary">${esc(j.summary)}</p>
            <div class="job-lists">
              <div><h4>What you’ll do</h4><ul>${j.duties.map((d) => `<li>${esc(d)}</li>`).join("")}</ul></div>
              <div><h4>What you’ll need</h4><ul>${j.needs.map((d) => `<li>${esc(d)}</li>`).join("")}</ul></div>
            </div>
          </div>
          <div class="job-apply">
            <p>Apply by email with your CV. Your email app will open with this role’s reference, <b>${esc(j.ref)}</b>, in the subject.</p>
            <a class="btn btn-primary" href="${applyLink(j)}">Apply now <svg class="ic"><use href="#i-arrow"/></svg></a>
            <p class="job-apply-mail">Or write to <a href="mailto:${esc(EMAIL)}">${esc(EMAIL)}</a></p>
          </div>
        </div>
      </div>
    </li>`).join("");
  const jobs = $$(".job", list);

  // Hero facts
  const usedLocs = [...new Set(JOBS.map((j) => j.location))];
  $('[data-fact="roles"]').textContent = JOBS.length;
  $('[data-fact="locations"]').textContent = usedLocs.length || Object.keys(LOCS).length;

  /* ---------- Filters ---------- */
  const depts = [...new Set(JOBS.map((j) => j.dept))];
  const chipsEl = $("[data-dept-chips]");
  chipsEl.innerHTML = [["", "All", JOBS.length], ...depts.map((d) => [d, d, JOBS.filter((j) => j.dept === d).length])]
    .map(([v, t, n]) => `<button type="button" class="cr-chip" data-dept="${esc(v)}" aria-pressed="false">${esc(t)} <small>${n}</small></button>`).join("");
  const chips = $$(".cr-chip", chipsEl);
  const locSelect = $("[data-location]");
  locSelect.insertAdjacentHTML("beforeend", usedLocs.map((k) => `<option value="${esc(k)}">${esc(locName(k))}</option>`).join(""));
  const search = $("[data-search]");
  const countEl = $("[data-results]");
  const emptyEl = $("[data-empty]");
  const state = { dept: "", loc: "", q: "" };

  const matches = (j) =>
    (!state.dept || j.dept === state.dept) &&
    (!state.loc || j.location === state.loc) &&
    (!state.q || `${j.title} ${j.ref} ${j.dept} ${locName(j.location)} ${j.summary}`.toLowerCase().includes(state.q));

  function apply(animate = true) {
    chips.forEach((c) => c.setAttribute("aria-pressed", String(c.dataset.dept === state.dept)));
    const flipState = animate && useFlip ? Flip.getState(jobs) : null;
    let shown = 0;
    jobs.forEach((el) => {
      const ok = matches(JOBS[+el.dataset.i]);
      el.hidden = !ok;
      if (ok) shown++;
    });
    const filtered = state.dept || state.loc || state.q;
    countEl.textContent = !JOBS.length ? "" : filtered ? `Showing ${shown} of ${plural(JOBS.length, "open role")}` : `${plural(JOBS.length, "open role")}`;
    emptyEl.hidden = shown > 0;
    $("[data-empty-title]").textContent = JOBS.length ? "No roles match these filters." : "There are no open roles right now.";
    $("[data-clear]", emptyEl).hidden = !JOBS.length;
    if (flipState) {
      Flip.from(flipState, {
        duration: 0.5, ease: "power2.inOut", absolute: true,
        onEnter: (els) => gsap.fromTo(els, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.04, delay: 0.1 }),
        onLeave: (els) => gsap.to(els, { opacity: 0, duration: 0.2 }),
        onComplete: () => ScrollTrigger.refresh(),
      });
    } else if (window.ScrollTrigger) ScrollTrigger.refresh();
  }

  chips.forEach((c) => c.addEventListener("click", () => { state.dept = c.dataset.dept; apply(); }));
  locSelect.addEventListener("change", () => { state.loc = locSelect.value; apply(); });
  let t;
  search.addEventListener("input", () => { clearTimeout(t); t = setTimeout(() => { state.q = search.value.trim().toLowerCase(); apply(); }, 180); });
  $("[data-clear]", emptyEl).addEventListener("click", () => {
    state.dept = ""; state.loc = ""; state.q = ""; search.value = ""; locSelect.value = "";
    apply();
  });
  apply(false);

  /* ---------- Accordion ---------- */
  function toggle(job, open, instant = false) {
    const btn = $(".job-btn", job);
    const panel = $(".job-panel", job);
    if ((btn.getAttribute("aria-expanded") === "true") === open) return;
    btn.setAttribute("aria-expanded", String(open));
    job.classList.toggle("is-open", open);
    if (reduceMotion || instant) {
      panel.hidden = !open;
      ScrollTrigger.refresh();
      return;
    }
    gsap.killTweensOf(panel);
    if (open) {
      panel.hidden = false;
      gsap.fromTo(panel, { height: 0 }, { height: "auto", duration: 0.6, ease: "power3.out", onComplete: () => ScrollTrigger.refresh() });
      gsap.fromTo($(".job-inner", panel).querySelectorAll(".job-summary, .job-lists > div, .job-apply"),
        { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.06, ease: "power3.out", delay: 0.08 });
    } else {
      gsap.to(panel, {
        height: 0, duration: 0.45, ease: "power3.inOut",
        onComplete: () => { panel.hidden = true; gsap.set(panel, { clearProps: "height" }); ScrollTrigger.refresh(); },
      });
    }
  }
  jobs.forEach((job) => $(".job-btn", job).addEventListener("click", () => {
    const open = $(".job-btn", job).getAttribute("aria-expanded") !== "true";
    toggle(job, open);
    if (open) history.replaceState(null, "", `#${job.id}`);
  }));

  // Shared links like careers.html#MER-01 open that role
  const fromHash = jobs.find((j) => location.hash && j.id === decodeURIComponent(location.hash.slice(1)));
  if (fromHash) {
    toggle(fromHash, true, true);
    setTimeout(() => (lenis ? lenis.scrollTo(fromHash, { offset: -100 }) : fromHash.scrollIntoView()), 300);
  }

  if (reduceMotion) {
    gsap.set([header, ".cr-title", ".cr-kicker", ".cr-hero-side"], { opacity: 1 });
    return;
  }

  /* ---------- Calm reveals ---------- */
  gsap.set([".cr-title", ".cr-kicker", ".cr-hero-side"], { opacity: 1 });
  gsap.timeline({ defaults: { ease: "power3.out" }, delay: 0.1 })
    .fromTo(header, { opacity: 0, y: -12 }, { opacity: 1, y: 0, duration: 0.8, clearProps: "transform" }, 0)
    .fromTo(".cr-kicker", { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.8 }, 0.1)
    .fromTo(".cr-char", { yPercent: 110 }, { yPercent: 0, duration: 1.1, stagger: 0.018, ease: "expo.out" }, 0.15)
    .fromTo(".cr-hero-side > *", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.08 }, 0.5);

  gsap.from(".why", {
    opacity: 0, y: 30, duration: 0.9, stagger: 0.08, ease: "power3.out",
    scrollTrigger: { trigger: ".why-list", start: "top 85%" },
  });
  gsap.from(".cr-filters", {
    opacity: 0, y: 16, duration: 0.8, ease: "power3.out",
    scrollTrigger: { trigger: ".cr-filters", start: "top 90%" },
  });
  gsap.set(jobs, { opacity: 0, y: 20 });
  ScrollTrigger.batch(jobs, {
    start: "top 94%", once: true,
    onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 0.7, stagger: 0.06, ease: "power3.out", overwrite: true }),
  });
  gsap.from(".steps-list li", {
    opacity: 0, y: 30, duration: 0.9, stagger: 0.12, ease: "power3.out",
    scrollTrigger: { trigger: ".steps-list", start: "top 85%" },
  });
  gsap.from(".cr-general-inner > *", {
    opacity: 0, y: 20, duration: 0.9, stagger: 0.1, ease: "power3.out",
    scrollTrigger: { trigger: ".cr-general", start: "top 85%" },
  });
})();
