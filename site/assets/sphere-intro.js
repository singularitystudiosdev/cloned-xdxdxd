// sphere-intro: the hero's new OPENING segment — the bench's DESKTOP-card
// choreography (hero-loading-animations.html), end to end: 17 app icons pop
// in one at a time on a fibonacci sphere, spin up exponentially (0.35 →
// 21 rad/s), converge and merge over the same 450ms accelerating window, the
// superbot mascot mark flips and grows (fv-flip-icon-grow, exact), then the
// bench's afterglow: shrink-top (the mark flies up to become the rail's home
// button), crew bloom (7 app tiles + the + add-app tile springing in 44px
// apart), drift-left (the lockup hugs the card's left edge), settle (the
// white pill indicator grows at Claude's stop), the chat panel docks, and the
// platform dropdown extends upward out of the composer chip. hub-boot.js
// starts playing UNDER the overlay at the flip, so the dissolve hands a story
// that is already alive — no jump.
(() => {
  const stage = document.getElementById("stage");
  if (!stage) return;

  // reduced motion: skip the sphere, hand straight to hub-boot's own still
  // (?motion=1 overrides — headless Chrome reports reduce by default)
  const motionForced = new URLSearchParams(location.search).get("motion") === "1";
  if (!motionForced && matchMedia("(prefers-reduced-motion: reduce)").matches) {
    window.__hubBootStartAt = 0;
    import("./hub-boot.js");
    return;
  }

  const ICONS = [
    { name: "Cursor", src: "site/assets/intro/cursor.png" },
    { name: "ChatGPT", src: "site/assets/intro/chatgpt.webp" },
    { name: "Claude", src: "site/assets/intro/claude.png" },
    { name: "Gemini", src: "site/assets/intro/gemini-app-icon.png" },
    { name: "Grok", src: "site/assets/intro/grok.png" },
    { name: "Hermes", src: "site/assets/intro/hermes.png" },
    { name: "Devin", src: "site/assets/intro/devin.png" },
    { name: "Copilot", src: "site/assets/intro/copilot.svg" },
    { name: "v0", src: "site/assets/intro/v0.svg" },
    { name: "Bolt", src: "site/assets/intro/bolt.png" },
    { name: "Lovable", src: "site/assets/intro/lovable.png" },
    { name: "Replit", src: "site/assets/intro/replit.png" },
    { name: "Base44", src: "site/assets/intro/base44.png" },
    { name: "VS Code", src: "site/assets/intro/vscode.png" },
    { name: "JetBrains", src: "site/assets/intro/jetbrains.png" },
    { name: "Kiro", src: "site/assets/intro/kiro.ico" },
    { name: "Warp", src: "site/assets/intro/warp.png" },
  ];
  // the bench's rail lineup: Cursor, ChatGPT, Claude, Devin, Hermes, Gemini, Grok
  const CREW_IDX = [0, 1, 2, 6, 5, 3, 4];

  // fixed coordinate space: 460px choreography, sphere R=175, 54px tiles;
  // the afterglow rail is 40px tiles stacked 44px apart, resting 14px from
  // the left edge, home button center 63px from the top (all bench 1:1)
  const STAGE = 460, C = STAGE / 2, R = 175, TILE = 54;
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp01 = (t) => Math.min(1, Math.max(0, t));
  const rotY3 = (v, a) => ({ x: v.x * Math.cos(a) + v.z * Math.sin(a), y: v.y, z: -v.x * Math.sin(a) + v.z * Math.cos(a) });
  const fibDirs = (n) => Array.from({ length: n }, (_, i) => {
    const y = 1 - (2 * i + 1) / n;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const th = 2.399963 * i;
    return { x: Math.cos(th) * r, y, z: Math.sin(th) * r };
  });

  const MERGE_T = 4000;
  const POP_START = 120, POP_STAGGER = 48;
  const popAt = (i) => POP_START + i * POP_STAGGER;
  const OMEGA0 = 0.35, OMEGA_MAX = 21;
  const omegaAt = (tMs) => {
    const x = clamp01(tMs / MERGE_T);
    return OMEGA0 * Math.exp(Math.log(OMEGA_MAX / OMEGA0) * Math.pow(x, 1.55));
  };

  // the hub-boot story picks up here once the sphere hands off: past the
  // boot log (0-2.9) AND past the app/rule chips segment (5.0-12.15, the part
  // the user removed) — the story resumes typing "all yours now." at 12.15
  const HANDOFF_AT = 12.0;

  // overlay fills the stage; everything is positioned in stage pixels,
  // scaled by S so the fixed design space fits any stage size
  const overlay = document.createElement("div");
  overlay.className = "sphere-intro";
  overlay.setAttribute("aria-hidden", "true");
  overlay.style.cssText = "position:absolute;inset:0;overflow:hidden;z-index:30;pointer-events:none;";
  stage.appendChild(overlay);

  let W = 660, H = 459, S = 1;
  const fit = () => {
    const r = stage.getBoundingClientRect();
    W = Math.max(320, r.width);
    H = Math.max(300, r.height);
    S = Math.min(1, Math.min(W, H) / (STAGE + 40));
    layout();
  };
  // the choreography space rides the card's center column, like the bench
  const holder = document.createElement("div");
  holder.style.cssText = "position:absolute;width:" + STAGE + "px;height:" + STAGE + "px;transform-style:preserve-3d;perspective:1100px;";
  overlay.appendChild(holder);
  const layout = () => {
    holder.style.left = ((W - STAGE) / 2) + "px";
    holder.style.top = ((H - STAGE) / 2) + "px";
    holder.style.transform = "scale(" + S + ")";
    holder.style.transformOrigin = "top left";
  };
  fit();
  addEventListener("resize", fit);

  // stage-center in overlay px (the sphere's merge point)
  const cx = () => W / 2;
  const cy = () => H / 2;

  // the merge target — the site's own mascot mark on the dark tile, with the
  // same teal/magenta chromatic fringe the hero's big mascot carries
  const MARK = 250; // design px
  const bloom = document.createElement("div");
  bloom.style.cssText = "position:absolute;z-index:5;opacity:0;will-change:transform,filter;";
  const bloomTile = document.createElement("div");
  bloomTile.style.cssText = "position:absolute;inset:0;border-radius:56px;background:#101014;box-shadow:0 0 0 1px rgba(255,255,255,.07),0 18px 70px -18px rgba(0,0,0,.85);";
  const mark = new Image();
  mark.src = "site/assets/brand/mark-clean.svg";
  mark.alt = "";
  mark.draggable = false;
  mark.style.cssText = "position:absolute;inset:14%;width:72%;height:72%;filter:drop-shadow(-2px 0 0 #34e0c8) drop-shadow(2px 0 0 #e14fd2);";
  bloom.appendChild(bloomTile);
  bloom.appendChild(mark);
  overlay.appendChild(bloom);
  // the mark's box from its top-left, in overlay px (design px × S)
  const placeMark = (left, top, scale) => {
    const size = MARK * S * scale;
    bloom.style.width = size + "px";
    bloom.style.height = size + "px";
    bloom.style.transform = "translate(" + (left - size / 2) + "px," + (top - size / 2) + "px)" + (scale === 1 ? "" : " scale(" + scale + ")");
    bloom.style.left = "0";
    bloom.style.top = "0";
    bloom.style.margin = "0";
  };

  const FIB = fibDirs(ICONS.length);
  const tiles = ICONS.map((icon) => {
    const t = document.createElement("div");
    t.style.cssText = "position:absolute;left:0;top:0;width:" + TILE + "px;height:" + TILE + "px;border-radius:12px;background:#16161a;box-shadow:0 0 0 1px rgba(255,255,255,.07),0 10px 30px -10px rgba(0,0,0,.8);display:flex;align-items:center;justify-content:center;will-change:transform,opacity,filter;opacity:0;";
    const img = new Image();
    img.src = icon.src;
    img.alt = icon.name;
    img.draggable = false;
    img.style.cssText = "width:72%;height:72%;border-radius:8px;object-fit:contain;";
    t.appendChild(img);
    holder.appendChild(t);
    return t;
  });

  const place3 = (el, x, y, z) => {
    el.style.transform = "translate3d(" + (C - TILE / 2 + x) + "px," + (C - TILE / 2 + y) + "px," + z + "px)";
  };

  // the handoff: hub-boot starts playing beneath the overlay. Idempotent —
  // called at the flip and by the watchdog.
  let handedOff = false;
  const handoff = () => {
    if (handedOff) return;
    handedOff = true;
    window.__hubBootStartAt = HANDOFF_AT;
    import("./hub-boot.js");
  };

  // dissolve the overlay, revealing the story already running underneath
  const dissolve = () => {
    overlay.style.transition = "opacity 300ms ease";
    overlay.style.opacity = "0";
    setTimeout(() => overlay.remove(), 320);
  };

  let ang = 0, last = null, phase = "run", raf = 0;
  // tester override: ?intro=<ms> jumps into the timeline — the bench's ?t= pattern
  const startAt = Math.max(0, parseInt(new URLSearchParams(location.search).get("intro") || "0", 10) || 0);
  let clock = startAt;
  const popped = new Array(ICONS.length).fill(false);
  const frame = (ts) => {
    if (last == null) last = ts;
    const dMs = Math.min(50, ts - last);
    last = ts;
    clock += dMs;
    ang += (dMs / 1000) * omegaAt(Math.min(clock, MERGE_T));

    for (let i = 0; i < ICONS.length; i++) {
      if (clock >= popAt(i) && !popped[i]) { popped[i] = true; tiles[i].style.opacity = "1"; }
    }
    for (let i = 0; i < ICONS.length; i++) {
      if (!popped[i]) continue;
      const v = rotY3(FIB[i], ang);
      const mergeT = Math.pow(clamp01((clock - (MERGE_T - 450)) / 450), 1.7);
      const x = lerp(v.x * R, 0, mergeT), y = lerp(v.y * R, 0, mergeT), z = v.z * lerp(R, 10, mergeT);
      const depth = (z + 190) / 380;
      place3(tiles[i], x, y, z);
      tiles[i].style.opacity = String(Math.min(1, (0.16 + 0.84 * depth) * (1 - clamp01((clock - MERGE_T) / 220))));
      const blurT = clamp01((clock - MERGE_T * 0.62) / (MERGE_T * 0.38));
      const blur = Math.pow(blurT, 2) * 3.6 + (depth < 0.5 ? (0.5 - depth) * 3 : 0);
      tiles[i].style.filter = blur > 0.05 ? "blur(" + blur.toFixed(2) + "px)" : "none";
    }
    if (phase !== "run" && clock >= MERGE_T + 220) tiles.forEach((t) => { t.style.visibility = "hidden"; });
    if (phase === "run" && clock >= MERGE_T) { phase = "finisher"; runFinisher(); }
    if (phase === "run" || (phase === "finisher" && clock < MERGE_T + 220)) raf = requestAnimationFrame(frame);
  };

  // fv-flip-icon-grow, exact: 0→0.76 flip 180°→0° + grow + brighten, then settle
  const runFinisher = () => {
    handoff(); // the story starts beneath the overlay NOW — seamless reveal later
    bloom.style.opacity = "1";
    placeMark(cx(), cy(), 1);
    const flip = bloom.animate([
      {
        transform: "translate(" + (cx() - (MARK * S * (TILE / 250)) / 2) + "px," + (cy() - (MARK * S * (TILE / 250)) / 2) + "px) perspective(900px) rotateY(180deg) scale(" + (TILE / 250) + ")",
        filter: "brightness(0.5)",
        easing: "cubic-bezier(.3,.85,.3,1.04)",
      },
      {
        transform: "translate(" + (cx() - (MARK * S * 1.05) / 2) + "px," + (cy() - (MARK * S * 1.05) / 2) + "px) perspective(900px) rotateY(0deg) scale(1.05)",
        filter: "brightness(1)",
        offset: 0.76,
        easing: "ease-out",
      },
      { transform: "translate(" + (cx() - (MARK * S) / 2) + "px," + (cy() - (MARK * S) / 2) + "px) scale(1)", filter: "brightness(1)" },
    ], { duration: 920, fill: "forwards" });
    flip.finished.then(() => {
      try { flip.commitStyles(); } catch (e) {}
      flip.cancel();
      afterglow();
    }).catch((e) => {
      if (!e || e.name !== "AbortError") console.error("[sphere-intro] flip failed:", e);
    });
  };

  // ---------- the bench's afterglow (desktop), adapted to the clone's stage ----------
  const anim = (el, keyframes, opts) =>
    el.animate(keyframes, opts).finished.catch((e) => {
      if (!e || e.name !== "AbortError") console.error("[sphere-intro] afterglow step failed:", e);
    });
  const px = (v) => v * S;

  const crewTile = (icon, sizeDesignPx) => {
    const t = document.createElement("div");
    const size = sizeDesignPx * S;
    t.style.cssText = "position:absolute;border-radius:" + 10 * S + "px;background:#16161a;box-shadow:0 0 0 1px rgba(255,255,255,.07),0 8px 22px -8px rgba(0,0,0,.8);display:flex;align-items:center;justify-content:center;will-change:transform,opacity;opacity:0;width:" + size + "px;height:" + size + "px;";
    const img = new Image();
    img.src = icon.src;
    img.alt = icon.name;
    img.draggable = false;
    img.style.cssText = "width:74%;height:74%;border-radius:" + 7 * S + "px;object-fit:contain;";
    t.appendChild(img);
    overlay.appendChild(t);
    return t;
  };

  async function afterglow() {
    // STAGE 1 — shrink-top: slight shrink, then fly to the rail's home-button
    // stop at the card's left edge (bench 1:1: 0.92 mid-shrink, 0.16 rest,
    // rest center 63px from the stage top, home center 7px left of the
    // crew column center becomes moot once the column rests at left 14)
    const homeCx = 14 + 20;           // crew column left 14 + half a 40px tile
    const homeCy = 63;
    await anim(bloom, [
      { transform: bloom.style.transform, easing: "ease-out" },
      { transform: "translate(" + (cx() - (MARK * S * 0.92) / 2) + "px," + (cy() - (MARK * S * 0.92) / 2) + "px) scale(0.92)", offset: 0.16, easing: "cubic-bezier(.3,.7,.2,1)" },
      { transform: "translate(" + (homeCx * S - (MARK * S * 0.16) / 2) + "px," + (homeCy * S - (MARK * S * 0.16) / 2) + "px) scale(0.16)" },
    ], { duration: 640, fill: "forwards" });

    // STAGE 2 — crew bloom: the 7 crew tiles + the + add-app tile spring in
    // under the home button, 44px apart, with Discord's separator between
    const colLeft = 14;               // crew column left, rest coords
    const crewTop0 = 91 + 8;          // below the separator line
    const crew = CREW_IDX.map((idx) => crewTile(ICONS[idx], 40));
    const railSep = document.createElement("div");
    railSep.style.cssText = "position:absolute;left:" + colLeft * S + "px;top:" + 91 * S + "px;width:" + 32 * S + "px;height:2px;border-radius:1px;background:rgba(255,255,255,.16);opacity:0;";
    overlay.appendChild(railSep);
    const plusTile = crewTile(ICONS[0], 40);
    plusTile.innerHTML = "";
    plusTile.style.opacity = "0";
    plusTile.innerHTML = '<svg viewBox="0 0 12 12" style="width:' + 12 * S + 'px;height:' + 12 * S + 'px"><path d="M6 1.8v8.4M1.8 6h8.4" stroke="#9aa0aa" stroke-width="1.4" stroke-linecap="round" fill="none"/></svg>';
    crew.push(plusTile);
    crew.forEach((t, i) => {
      t.style.left = colLeft * S + "px";
      t.style.top = (crewTop0 + i * 44) * S + "px";
    });
    await Promise.all([
      ...crew.map((el, i) => anim(el, [
        { transform: "translateY(" + -8 * S + "px) scale(0.2)", opacity: 0 },
        { transform: "translateY(0) scale(1)", opacity: 1 },
      ], { duration: 480, delay: i * 70, easing: "cubic-bezier(.34,1.56,.64,1)", fill: "forwards" })),
      anim(railSep, [{ opacity: 0 }, { opacity: 1 }], { duration: 300, fill: "forwards" }),
    ]);

    // STAGE 3 — drift-left: the crew column is already at rest left 14; the
    // home button (the mark) slides the last -7px to line up dead center
    await anim(bloom, [
      { transform: bloom.style.transform },
      { transform: "translate(" + ((14 + 20) * S - (MARK * S * 0.16) / 2) + "px," + (63 * S - (MARK * S * 0.16) / 2) + "px) scale(0.16)" },
    ], { duration: 360, fill: "forwards", easing: "cubic-bezier(.4,0,.2,1)" });

    // STAGE 4 — settle: Discord's white pill indicator grows at Claude's stop
    const pill = document.createElement("div");
    pill.style.cssText = "position:absolute;left:" + (colLeft - 6) * S + "px;width:" + 4 * S + "px;border-radius:" + 2 * S + "px;background:#e8eaf0;opacity:0;";
    const claudeTop = (crewTop0 + 2 * 44) * S;
    pill.style.top = claudeTop + "px";
    overlay.appendChild(pill);
    await anim(pill, [
      { height: 8 * S + "px", transform: "translateY(" + 16 * S + "px)", opacity: 0 },
      { height: 40 * S + "px", transform: "translateY(0)", opacity: 1 },
    ], { duration: 200, fill: "forwards", easing: "ease-out" });

    // STAGE 5 — the panel docks right of the rail, then the platform dropdown
    // extends upward out of the composer chip (the beat the page is named for)
    const panel = document.createElement("div");
    panel.style.cssText = "position:absolute;display:flex;flex-direction:column;border-radius:" + 14 * S + "px;background:#101014;box-shadow:0 0 0 1px rgba(255,255,255,.06),0 24px 80px -24px rgba(0,0,0,.9);overflow:hidden;";
    const panelLeft = (14 + 40 + 12) * S, panelTop = 12 * S;
    panel.style.left = panelLeft + "px";
    panel.style.top = panelTop + "px";
    panel.style.width = (W - panelLeft - 12 * S) + "px";
    panel.style.height = (H - panelTop - 12 * S) + "px";
    panel.innerHTML =
      '<div style="display:flex;align-items:center;gap:' + 8 * S + 'px;padding:' + 12 * S + 'px ' + 14 * S + 'px;box-shadow:0 1px 0 rgba(255,255,255,.06);">' +
        '<img src="site/assets/intro/claude.png" alt="" style="width:' + 16 * S + 'px;height:' + 16 * S + 'px;border-radius:' + 4 * S + 'px;">' +
        '<span style="font:600 ' + 12 * S + 'px system-ui;color:#e8eaf0;">Claude</span>' +
        '<span style="font:' + 11 * S + 'px system-ui;color:#6b7280;">via superbot</span>' +
      '</div>' +
      '<div style="flex:1;display:flex;flex-direction:column;justify-content:flex-end;gap:' + 8 * S + 'px;padding:' + 12 * S + 'px ' + 14 * S + 'px;">' +
        '<div style="align-self:flex-end;max-width:70%;background:#1c1f26;border-radius:' + 12 * S + 'px ' + 12 * S + 'px ' + 4 * S + 'px ' + 12 * S + 'px;padding:' + 8 * S + 'px ' + 11 * S + 'px;font:' + 11.5 * S + 'px system-ui;color:#d6d9e0;">route tonight’s batch through Gemini — it’s cheapest after midnight</div>' +
        '<div style="align-self:flex-start;max-width:78%;background:#16161a;border-radius:' + 12 * S + 'px ' + 12 * S + 'px ' + 12 * S + 'px ' + 4 * S + 'px;padding:' + 8 * S + 'px ' + 11 * S + 'px;font:' + 11.5 * S + 'px system-ui;color:#b9bec9;">done — 3 agents queued, budget capped at $2.40</div>' +
      '</div>';
    const composer = document.createElement("div");
    composer.style.cssText = "margin:" + 10 * S + "px " + 12 * S + "px " + 12 * S + "px;display:flex;align-items:center;gap:" + 8 * S + "px;background:#16161a;border-radius:" + 999 * S + "px;padding:" + 8 * S + "px " + 12 * S + "px;box-shadow:0 0 0 1px rgba(255,255,255,.06);";
    composer.innerHTML = '<span style="flex:1;font:' + 11.5 * S + 'px system-ui;color:#6b7280;">tell superbot what to run…</span>';
    const chip = document.createElement("div");
    chip.id = "bc-plat";
    chip.style.cssText = "display:flex;align-items:center;gap:" + 6 * S + "px;background:#1c1f26;border-radius:" + 999 * S + "px;padding:" + 5 * S + "px " + 9 * S + "px;position:relative;";
    chip.innerHTML = '<img src="site/assets/intro/gemini-app-icon.png" alt="" style="width:' + 13 * S + 'px;height:' + 13 * S + 'px;border-radius:' + 3 * S + 'px;">' +
      '<span style="font:600 ' + 10.5 * S + 'px system-ui;color:#d6d9e0;">Gemini</span>' +
      '<svg viewBox="0 0 10 10" style="width:' + 8 * S + 'px;height:' + 8 * S + 'px"><path d="M2 6.2 5 3.4l3 2.8" stroke="#9aa0aa" stroke-width="1.3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    composer.appendChild(chip);
    panel.appendChild(composer);
    panel.style.opacity = "0";
    panel.style.transform = "translateX(" + 24 * S + "px)";
    overlay.appendChild(panel);
    await Promise.all([
      anim(panel, [
        { opacity: 0, transform: "translateX(" + 24 * S + "px)" },
        { opacity: 1, transform: "translateX(0)" },
      ], { duration: 420, fill: "forwards", easing: "cubic-bezier(.3,.7,.2,1)" }),
    ]);

    // the platform dropdown: extends upward out of the chip, holds, closes
    const pop = document.createElement("div");
    pop.style.cssText = "position:absolute;background:#14161c;border-radius:" + 12 * S + "px;box-shadow:0 0 0 1px rgba(255,255,255,.08),0 18px 50px -12px rgba(0,0,0,.9);padding:" + 6 * S + "px;transform-origin:bottom center;opacity:0;z-index:6;";
    pop.innerHTML = ["ChatGPT", "Claude", "Gemini", "Cursor"].map((name, i) => {
      const icon = ICONS.find((ic) => ic.name === name);
      return '<div style="display:flex;align-items:center;gap:' + 8 * S + 'px;padding:' + 7 * S + 'px ' + 9 * S + 'px;border-radius:' + 8 * S + 'px;' + (i === 2 ? "background:rgba(255,255,255,.07);" : "") + '">' +
        '<img src="' + icon.src + '" alt="" style="width:' + 14 * S + 'px;height:' + 14 * S + 'px;border-radius:' + 4 * S + 'px;">' +
        '<span style="font:' + 11 * S + 'px system-ui;color:' + (i === 2 ? "#e8eaf0" : "#b9bec9") + ';">' + name + '</span>' +
        (i === 2 ? '<svg viewBox="0 0 12 12" style="width:' + 10 * S + 'px;height:' + 10 * S + 'px;margin-left:auto"><path d="M2.4 6.4 4.8 8.8 9.6 3.6" stroke="#34e0c8" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>' : "") +
        '</div>';
    }).join("");
    overlay.appendChild(pop);
    const chipRect = chip.getBoundingClientRect();
    const ovRect = overlay.getBoundingClientRect();
    const popLeft = chipRect.left - ovRect.left;
    const popBottom = chipRect.top - ovRect.top - 6 * S;
    pop.style.left = Math.min(popLeft, W - 190 * S) + "px";
    pop.style.top = (popBottom - 4 * 34 * S - 6 * S) + "px";
    await anim(pop, [
      { opacity: 0, transform: "translateY(" + 8 * S + "px) scale(0.85)" },
      { opacity: 1, transform: "translateY(0) scale(1)" },
    ], { duration: 200, fill: "forwards", easing: "cubic-bezier(.34,1.3,.64,1)" });
    await new Promise((r) => setTimeout(r, 1300));
    await anim(pop, [
      { opacity: 1, transform: "translateY(0) scale(1)" },
      { opacity: 0, transform: "translateY(" + 6 * S + "px) scale(0.9)" },
    ], { duration: 150, fill: "forwards" });
    pop.remove();

    // hand the stage to hub-boot's story, which has been running underneath
    dissolve();
  }

  raf = requestAnimationFrame(frame);

  // watchdog: if any step stalls (WAAPI promises can sit unresolved under
  // throttling), force the handoff and dissolve so the stage is never covered
  setTimeout(() => { handoff(); if (overlay.isConnected) dissolve(); }, startAt + 11000);
})();
