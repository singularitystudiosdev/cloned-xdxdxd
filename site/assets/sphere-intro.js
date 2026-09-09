// sphere-intro: the hero's opening — the sphere-collapse bench's desktop
// intro (hero-loading-animations.html), adapted to this site's stage:
//   1. 17 app icons pop in one at a time on a fibonacci sphere and spin up
//      exponentially (0.35 → 21 rad/s), dead center in the arena
//   2. they converge and merge (the bench's 450ms accelerating window) and
//      the superbot mascot mark flips and grows (fv-flip-icon-grow, exact)
//   3. the mark glides LEFT and settles as the rail's home button
//   4. the crew ICON rail assembles downward beneath it — separator, seven
//      tiles and the + add-app tile springing in 44px apart — then hub-boot's
//      story takes over as the overlay dissolves (margin text is hidden
//      entirely; there is no transcript in this hero).
// No text dropdowns, no overlapping layers: one beat at a time.
(() => {
  const stage = document.getElementById("stage");
  if (!stage) return;
  const arena = document.getElementById("arena") || stage;

  // the sphere plays for everyone: a prefers-reduced-motion match here was
  // silently skipping the whole intro (the machine reports reduce), leaving
  // hub-boot to run its story from zero — the opposite of the request

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

  // fixed coordinate space: 460px choreography, sphere R=175, 54px tiles
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
  // boot log (0-2.9) AND past the chips segment (5.0-12.15, removed)
  const HANDOFF_AT = 12.0;

  // overlay clips to the terminal BODY (the visible interior) — the arena's
  // own box is far larger than what's visible, so its geometric center lands
  // off-screen; one shared, true coordinate space for every beat
  const body = stage.querySelector(".body") || stage;
  const overlay = document.createElement("div");
  overlay.className = "sphere-intro";
  overlay.setAttribute("aria-hidden", "true");
  overlay.style.cssText = "position:absolute;inset:0;overflow:hidden;z-index:30;pointer-events:none;";
  body.appendChild(overlay);

  // the choreography's center in overlay px — every centered element anchors here
  const acx = () => body.offsetWidth * 0.64;
  const acy = () => body.offsetHeight * 0.5;
  let S = 1;
  const fit = () => {
    // content-area center: the margin column is ~28% of the body's width
    const ax = body.offsetWidth * 0.64;
    const ay = body.offsetHeight * 0.5;
    S = Math.min(1, Math.min(body.offsetWidth * 0.7, body.offsetHeight) / (STAGE + 40));
    holder.style.left = ax + "px";
    holder.style.top = ay + "px";
    holder.style.transform = "translate(-50%,-50%) scale(" + S + ")";
  };

  const holder = document.createElement("div");
  holder.style.cssText = "position:absolute;left:50%;top:50%;width:" + STAGE + "px;height:" + STAGE + "px;transform:translate(-50%,-50%);transform-style:preserve-3d;perspective:1100px;";
  overlay.appendChild(holder);
  fit();
  addEventListener("resize", fit);

  // the merge target — the site's own mascot mark on the dark tile, with the
  // same teal/magenta chromatic fringe the hero's big mascot carries
  const MARK = 250; // design px
  const bloom = document.createElement("div");
  bloom.style.cssText = "position:absolute;left:50%;top:50%;width:" + MARK * S + "px;height:" + MARK * S + "px;margin:" + (-MARK * S) / 2 + "px 0 0 " + (-MARK * S) / 2 + "px;z-index:5;opacity:0;will-change:transform,filter;";
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
  const placeBloom = () => {
    bloom.style.left = acx() + "px";
    bloom.style.top = acy() + "px";
  };
  placeBloom();
  addEventListener("resize", placeBloom);

  const FIB = fibDirs(ICONS.length);
  const tiles = ICONS.map((icon) => {
    const t = document.createElement("div");
    t.style.cssText = "position:absolute;left:0;top:0;width:" + TILE + "px;height:" + TILE + "px;border-radius:12px;box-shadow:0 10px 30px -10px rgba(0,0,0,.8);display:flex;align-items:center;justify-content:center;will-change:transform,opacity,filter;opacity:0;";
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

  // the handoff: hub-boot starts playing beneath the overlay. Idempotent.
  let handedOff = false;
  const handoff = () => {
    if (handedOff) return;
    handedOff = true;
    window.__hubBootStartAt = HANDOFF_AT;
    import("./hub-boot.js?v=9");
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

  // beat 2 — fv-flip-icon-grow, exact: 0→0.76 flip 180°→0° + grow + brighten
  const runFinisher = () => {
    bloom.style.opacity = "1";
    const flip = bloom.animate([
      { transform: "perspective(900px) rotateY(180deg) scale(" + (TILE / 250) + ")", filter: "brightness(0.5)", easing: "cubic-bezier(.3,.85,.3,1.04)" },
      { transform: "perspective(900px) rotateY(0deg) scale(1.05)", filter: "brightness(1)", offset: 0.76, easing: "ease-out" },
      { transform: "scale(1)", filter: "brightness(1)" },
    ], { duration: 920, fill: "forwards" });
    flip.finished.then(() => {
      try { flip.commitStyles(); } catch (e) {}
      flip.cancel();
      moveLeft();
    }).catch((e) => {
      if (!e || e.name !== "AbortError") console.error("[sphere-intro] flip failed:", e);
    });
  };

  const anim = (el, keyframes, opts) =>
    el.animate(keyframes, opts).finished.catch((e) => {
      if (!e || e.name !== "AbortError") console.error("[sphere-intro] step failed:", e);
    });
  const px = (v) => v * S;

  // beat 3 — the mark glides LEFT to the bench's rail-button rest (40px,
  // left 14, center 63px from the top)
  const moveLeft = () => {
    const dx = px(14 + 20) - acx();
    const dy = px(63) - acy();
    const move = bloom.animate([
      { transform: "scale(1)" },
      { transform: "translate(" + dx + "px," + dy + "px) scale(" + px(40) / (MARK * S) + ")" },
    ], { duration: 560, fill: "forwards", easing: "cubic-bezier(.3,.7,.2,1)" });
    move.finished.then(() => railBloom()).catch(() => railBloom());
  };

  // beat 4 — the ICON rail assembles downward beneath the settled mark:
  // separator first, then the 7 crew tiles and the + add-app tile (the
  // bench's exact bloom — icons only, no text)
  const crewTile = (icon, sizeDesignPx) => {
    const t = document.createElement("div");
    const size = sizeDesignPx * S;
    t.style.cssText = "position:absolute;border-radius:" + 10 * S + "px;background:#16161a;box-shadow:0 0 0 1px rgba(255,255,255,.07),0 8px 22px -8px rgba(0,0,0,.8);display:flex;align-items:center;justify-content:center;will-change:transform,opacity;opacity:0;width:" + size + "px;height:" + size + "px;";
    const img = new Image();
    img.src = icon.src;
    img.alt = icon.name;
    img.draggable = false;
    img.style.cssText = "width:100%;height:100%;border-radius:" + 10 * S + "px;object-fit:cover;"; // full-bleed: the icons carry their own rounded backgrounds
    t.appendChild(img);
    overlay.appendChild(t);
    return t;
  };
  const railBloom = () => {
    const colLeft = 14;               // crew column left, rest coords
    const crewTop0 = 91 + 8;          // below the separator line
    const railSep = document.createElement("div");
    railSep.style.cssText = "position:absolute;left:" + colLeft * S + "px;top:" + 91 * S + "px;width:" + 32 * S + "px;height:2px;border-radius:1px;background:rgba(255,255,255,.16);opacity:0;";
    overlay.appendChild(railSep);
    const crew = [0, 1, 2, 6, 5, 3, 4].map((idx) => crewTile(ICONS[idx], 40)); // bench order: Cursor, ChatGPT, Claude, Devin, Hermes, Gemini, Grok
    const plusTile = crewTile(ICONS[0], 40);
    plusTile.innerHTML = "";
    plusTile.style.opacity = "0";
    plusTile.innerHTML = '<svg viewBox="0 0 12 12" style="width:' + 12 * S + 'px;height:' + 12 * S + 'px"><path d="M6 1.8v8.4M1.8 6h8.4" stroke="#9aa0aa" stroke-width="1.4" stroke-linecap="round" fill="none"/></svg>';
    crew.push(plusTile);
    crew.forEach((el, i) => {
      el.style.left = colLeft * S + "px";
      el.style.top = (crewTop0 + i * 44) * S + "px";
    });
    Promise.all([
      ...crew.map((el, i) => anim(el, [
        { transform: "translateY(" + -8 * S + "px) scale(0.2)", opacity: 0 },
        { transform: "translateY(0) scale(1)", opacity: 1 },
      ], { duration: 480, delay: i * 70, easing: "cubic-bezier(.34,1.56,.64,1)", fill: "forwards" })),
      anim(railSep, [{ opacity: 0 }, { opacity: 1 }], { duration: 300, fill: "forwards" }),
    ]).then(() => {
      handoff();
      dissolve();
    }).catch(() => { handoff(); dissolve(); });
  };

  raf = requestAnimationFrame(frame);

  // watchdog: if any step stalls (WAAPI promises can sit unresolved under
  // throttling), force the handoff and dissolve so the stage is never covered
  setTimeout(() => { handoff(); if (overlay.isConnected) dissolve(); }, startAt + 10500);
})();
