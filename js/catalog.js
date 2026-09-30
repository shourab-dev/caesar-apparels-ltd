/* ==========================================================
   Caesar Apparels Ltd — Product catalogue (requires common.js + catalog-data.js)
   Calm motion: soft reveals, Flip reflow on filter, gentle quick view.
   ========================================================== */
(() => {
  if (!window.CA || !window.CATALOG) return;
  const { $, $$, reduceMotion, header, lenis } = window.CA;
  const useFlip = !reduceMotion && window.Flip;
  if (useFlip) gsap.registerPlugin(Flip);

  const PRODUCTS = window.CATALOG;
  const CATS = window.CATALOG_CATEGORIES;
  const FABRICS = window.CATALOG_FABRICS;
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;

  const grid = $("[data-grid]");
  const chipsEl = $("[data-chips]");
  const fabricSelect = $("[data-fabric-filter]");
  const search = $("[data-search]");
  const countEl = $("[data-results]");
  const emptyEl = $("[data-empty]");
  const clearBtns = $$("[data-clear]");

  /* ---------- Render ---------- */
  grid.innerHTML = PRODUCTS.map((p, i) => `
    <li class="pcard" data-i="${i}" data-cat="${esc(p.category)}" data-fabric="${esc(p.fabric)}">
      <button type="button" class="pcard-btn" aria-haspopup="dialog">
        <span class="pcard-media">
          <img src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy" width="900" height="1200">
          <span class="pcard-tag">${esc(p.gender)}</span>
          <span class="pcard-quick" aria-hidden="true">Quick view</span>
        </span>
        <span class="pcard-info">
          <span class="pcard-name">${esc(p.name)}</span>
          <span class="pcard-meta">${esc(CATS[p.category] || p.category)}</span>
          <span class="pcard-fabric">${esc((FABRICS[p.fabric] || FABRICS.request).name)}</span>
        </span>
      </button>
    </li>`).join("");
  const cards = $$(".pcard", grid);

  const countBy = (key, val) => PRODUCTS.filter((p) => p[key] === val).length;
  chipsEl.innerHTML = [["", "All", PRODUCTS.length], ...Object.entries(CATS).map(([k, v]) => [k, v, countBy("category", k)])]
    .filter(([, , n]) => n > 0)
    .map(([k, v, n]) => `<button type="button" class="cat-chip" data-cat="${k}" aria-pressed="false">${esc(v)} <small>${n}</small></button>`)
    .join("");
  const chips = $$(".cat-chip", chipsEl);

  const fabricKeys = Object.keys(FABRICS).filter((k) => k !== "request");
  fabricSelect.insertAdjacentHTML("beforeend",
    [...fabricKeys, "request"].map((k) => `<option value="${k}">${esc(FABRICS[k].name)}</option>`).join(""));

  $("[data-fabric-list]").innerHTML = fabricKeys.map((k) => {
    const n = countBy("fabric", k);
    return `<li><button type="button" class="fabric" data-fabric="${k}" aria-pressed="false">
      <span class="swatch swatch-${k}" aria-hidden="true"></span>
      <span class="fabric-name">${esc(FABRICS[k].name)}</span>
      <span class="fabric-note">${esc(FABRICS[k].note)}</span>
      <span class="fabric-count">${n ? `See ${plural(n, "style")}` : "Available on request"}</span>
    </button></li>`;
  }).join("");
  const fabricBtns = $$(".fabric");

  // Header facts
  const facts = { styles: PRODUCTS.length, categories: new Set(PRODUCTS.map((p) => p.category)).size, fabrics: fabricKeys.length };
  $$("[data-fact]").forEach((el) => (el.textContent = facts[el.dataset.fact]));

  /* ---------- State & filtering ---------- */
  const params = new URLSearchParams(location.search);
  const state = {
    cat: CATS[params.get("cat")] ? params.get("cat") : "",
    fabric: FABRICS[params.get("fabric")] ? params.get("fabric") : "",
    q: "",
  };

  const matches = (p) =>
    (!state.cat || p.category === state.cat) &&
    (!state.fabric || p.fabric === state.fabric) &&
    (!state.q || `${p.name} ${CATS[p.category]} ${(FABRICS[p.fabric] || {}).name} ${p.gender}`.toLowerCase().includes(state.q));

  function syncControls() {
    chips.forEach((c) => c.setAttribute("aria-pressed", String(c.dataset.cat === state.cat)));
    fabricSelect.value = state.fabric;
    fabricBtns.forEach((b) => {
      const on = b.dataset.fabric === state.fabric;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-pressed", String(on));
    });
    const url = new URL(location.href);
    ["cat", "fabric"].forEach((k) => (state[k] ? url.searchParams.set(k, state[k]) : url.searchParams.delete(k)));
    history.replaceState(null, "", url);
  }

  function apply(animate = true) {
    syncControls();
    const flipState = animate && useFlip ? Flip.getState(cards) : null;
    let shown = 0;
    cards.forEach((card) => {
      const ok = matches(PRODUCTS[+card.dataset.i]);
      card.hidden = !ok;
      if (ok) shown++;
    });
    emptyEl.hidden = shown > 0;
    const filtered = state.cat || state.fabric || state.q;
    clearBtns.forEach((b) => b.classList.contains("cat-clear") && (b.hidden = !filtered));
    const scope = [state.cat && CATS[state.cat], state.fabric && FABRICS[state.fabric].name].filter(Boolean).join(", ");
    countEl.textContent = filtered
      ? `Showing ${shown} of ${plural(PRODUCTS.length, "style")}${scope ? ` in ${scope}` : ""}${state.q ? ` matching “${search.value.trim()}”` : ""}`
      : `Showing all ${plural(PRODUCTS.length, "style")}`;

    if (flipState) {
      Flip.from(flipState, {
        duration: 0.55, ease: "power2.inOut", absolute: true, scale: false,
        onEnter: (els) => gsap.fromTo(els, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.45, stagger: 0.03, delay: 0.1 }),
        onLeave: (els) => gsap.to(els, { opacity: 0, duration: 0.2 }),
        onComplete: () => ScrollTrigger.refresh(),
      });
    } else if (window.ScrollTrigger) {
      ScrollTrigger.refresh();
    }
  }

  chips.forEach((chip) => chip.addEventListener("click", () => { state.cat = chip.dataset.cat; apply(); }));
  fabricSelect.addEventListener("change", () => { state.fabric = fabricSelect.value; apply(); });
  let searchTimer;
  search.addEventListener("input", () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => { state.q = search.value.trim().toLowerCase(); apply(); }, 180);
  });
  clearBtns.forEach((b) => b.addEventListener("click", () => {
    state.cat = ""; state.fabric = ""; state.q = ""; search.value = "";
    apply();
  }));
  fabricBtns.forEach((b) => b.addEventListener("click", () => {
    state.fabric = state.fabric === b.dataset.fabric ? "" : b.dataset.fabric;
    apply(false);
    const target = $(".cat-results");
    if (lenis) lenis.scrollTo(target, { offset: -150 });
    else target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
  }));

  // Grid density
  $$("[data-view]").forEach((btn) => btn.addEventListener("click", () => {
    const compact = btn.dataset.view === "compact";
    if (grid.classList.contains("is-compact") === compact) return;
    const s = useFlip ? Flip.getState(cards) : null;
    grid.classList.toggle("is-compact", compact);
    $$("[data-view]").forEach((b) => {
      const on = b === btn;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-pressed", String(on));
    });
    if (s) Flip.from(s, { duration: 0.6, ease: "power2.inOut", onComplete: () => ScrollTrigger.refresh() });
  }));

  apply(false);

  // Keep the filter bar tucked under the header, sliding up when the header hides
  const bar = $("[data-bar]");
  new MutationObserver(() => bar.classList.toggle("is-top", header.classList.contains("is-hidden")))
    .observe(header, { attributes: true, attributeFilter: ["class"] });

  /* ---------- Quick view ---------- */
  const qv = $("[data-qv]");
  const qvCard = $(".qv-card", qv);
  const qvImg = $("[data-qv-img]", qv);
  const Q = (k) => $(`[data-qv-${k}]`, qv);
  let list = [];
  let pos = 0;

  function fill(p) {
    qvImg.src = p.image;
    qvImg.alt = p.name;
    Q("cat").textContent = CATS[p.category] || p.category;
    Q("title").textContent = p.name;
    Q("text").textContent = p.text;
    const fab = FABRICS[p.fabric] || FABRICS.request;
    Q("fabric").textContent = fab.name;
    Q("note").textContent = fab.note;
    Q("gender").textContent = p.gender;
    Q("id").textContent = p.id.toUpperCase();
    Q("cta").href = `contact.html?topic=quote&style=${encodeURIComponent(`${p.name} (${p.id.toUpperCase()})`)}#enquiry`;
    Q("pos").textContent = `${pos + 1} / ${list.length}`;
  }

  function open(i) {
    list = cards.filter((c) => !c.hidden).map((c) => +c.dataset.i);
    pos = Math.max(0, list.indexOf(i));
    fill(PRODUCTS[list[pos]]);
    qv.showModal();
    lenis && lenis.stop();
    if (!reduceMotion) {
      gsap.fromTo(qvCard, { opacity: 0, y: 24, scale: 0.98 }, { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "power3.out" });
    }
  }

  function close() {
    const done = () => { qv.close(); lenis && lenis.start(); };
    if (reduceMotion) return done();
    gsap.to(qvCard, { opacity: 0, y: 16, duration: 0.25, ease: "power2.in", onComplete: done });
  }

  function step(dir) {
    pos = (pos + dir + list.length) % list.length;
    if (reduceMotion) return fill(PRODUCTS[list[pos]]);
    const parts = [qvImg, ...$$(".qv-body > *:not(.qv-nav)", qv)];
    gsap.timeline()
      .to(parts, { opacity: 0, x: -12 * dir, duration: 0.18, ease: "power2.in" })
      .add(() => fill(PRODUCTS[list[pos]]))
      .fromTo(parts, { x: 12 * dir }, { opacity: 1, x: 0, duration: 0.35, ease: "power3.out", stagger: 0.02 });
  }

  cards.forEach((card) => $(".pcard-btn", card).addEventListener("click", () => open(+card.dataset.i)));
  Q("close").addEventListener("click", close);
  Q("prev").addEventListener("click", () => step(-1));
  Q("next").addEventListener("click", () => step(1));
  qv.addEventListener("cancel", (e) => { e.preventDefault(); close(); });
  qv.addEventListener("click", (e) => { if (e.target === qv) close(); });
  qv.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") step(1);
    if (e.key === "ArrowLeft") step(-1);
  });

  if (reduceMotion) {
    gsap.set([header, ".cat-title", ".cat-hero-side"], { opacity: 1 });
    return;
  }

  /* ---------- Calm reveals ---------- */
  gsap.timeline({ defaults: { ease: "power3.out" }, delay: 0.1 })
    .fromTo(header, { opacity: 0, y: -12 }, { opacity: 1, y: 0, duration: 0.8, clearProps: "transform" }, 0)
    .fromTo(".cat-title", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1 }, 0.1)
    .fromTo(".cat-hero-side", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.9 }, 0.3)
    .from(".cat-bar", { opacity: 0, duration: 0.8 }, 0.4);

  gsap.set(cards, { opacity: 0, y: 24 });
  ScrollTrigger.batch(cards, {
    start: "top 92%",
    once: true,
    onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 0.7, stagger: 0.06, ease: "power3.out", overwrite: true }),
  });
  gsap.from(".fabric", {
    opacity: 0, y: 24, duration: 0.7, stagger: 0.07, ease: "power3.out",
    scrollTrigger: { trigger: ".fabric-list", start: "top 85%" },
  });
})();
