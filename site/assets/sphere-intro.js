// sphere-intro: the hero's opening — four clean beats, adapted from the
// sphere-collapse bench's desktop card (hero-loading-animations.html) into
// this site's own stage:
//   1. 17 app icons pop in one at a time on a fibonacci sphere and spin up
//      exponentially (0.35 → 21 rad/s), DEAD CENTER in the stage
//   2. they converge and merge (the bench's 450ms accelerating window) and
//      the superbot mascot mark flips and grows (fv-flip-icon-grow, exact)
//   3. the platform dropdown extends downward out of the mark, holds, closes
//   4. the mark glides LEFT to the bench's rail-button rest position, and only
//      then hub-boot's story starts and the overlay dissolves — one beat at a
//      time, nothing overlapping
// hub-boot resumes at its 12.0s mark — past the boot log AND past the chips
// segment — typing "all yours now." into a clean margin.
(() => {
  const stage = document.getElementById("stage");
  if (!stage) return;
  // the choreography lives in the ARENA — the stage's content area right of
  // the client rail — the same space hub-boot lays its story out in; centering
  // on the full stage width is what dragged the sphere left
  const arena = document.getElementById("arena") || stage;

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
  // boot log (0-2.9) AND past the app/rule chips segment (5.0-12.15, removed)
  // — the story resumes typing "all yours now." at 12.15
  const HANDOFF_AT = 12.0;

  // overlay fills the stage; the choreography space is dead center via
  // translate(-50%,-50%) — no offset math, the sphere cannot drift
  const overlay = document.createElement("div");
  overlay.className = "sphere-intro";
  overlay.setAttribute("aria-hidden", "true");
  overlay.style.cssText = "position:absolute;inset:0;overflow:hidden;z-index:30;pointer-events:none;";
  arena.appendChild(overlay);

  const holder = document.createElement("div");
  holder.style.cssText = "position:absolute;left:50%;top:50%;width:" + STAGE + "px;height:" + STAGE + "px;transform:translate(-50%,-50%);transform-style:preserve-3d;perspective:1100px;";
  overlay.appendChild(holder);
  let S = 1;
  const fit = () => {
    const r = arena.getBoundingClientRect();
    S = Math.min(1, Math.min(r.width, r.height) / (STAGE + 40));
    holder.style.transform = "translate(-50%,-50%) scale(" + S + ")";
  };
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
      showDropdown();
    }).catch((e) => {
      if (!e || e.name !== "AbortError") console.error("[sphere-intro] flip failed:", e);
    });
  };

  const anim = (el, keyframes, opts) =>
    el.animate(keyframes, opts).finished.catch((e) => {
      if (!e || e.name !== "AbortError") console.error("[sphere-intro] step failed:", e);
    });
  const px = (v) => v * S;

  // beat 3 — the demo's own platform dropdown, replicated 1:1, extends
  // downward out of the centered mark: icon + name + usage-burn % per row
  // (mono, green <40 / orange 40-70 / red 70+), the current platform raised,
  // "Add Platform" pinned under a separator
  const PH_APPS = [
    { name: "Superbot", src: "site/assets/brand/mark-clean.svg", five: null, on: true },
    { name: "Claude", src: "site/assets/intro/claude.png", five: 62 },
    { name: "Cursor", src: "site/assets/intro/cursor.png", five: 34 },
    { name: "ChatGPT", src: "site/assets/intro/chatgpt.webp", five: 18 },
    { name: "Gemini", src: "site/assets/intro/gemini-app-icon.png", five: 81 },
    { name: "Grok", src: "site/assets/intro/grok.png", five: 47 },
    { name: "Devin", src: "site/assets/intro/devin.png", five: 29 },
    { name: "Hermes", src: "site/assets/intro/hermes.png", five: 55 },
  ];
  const uuColor = (p) => (p >= 70 ? "#e5636a" : p >= 40 ? "#e8b45a" : "#5fd08a");
  const showDropdown = () => {
    const pop = document.createElement("div");
    pop.style.cssText = "position:absolute;left:50%;width:" + px(212) + "px;background:#14161c;border:1px solid rgba(255,255,255,.12);border-radius:" + px(16) + "px;box-shadow:0 0 0 1px rgba(255,255,255,.06),0 " + px(30) + "px " + px(80) + "px " + -px(20) + " rgba(0,0,0,.95);padding:" + px(6) + "px;display:grid;gap:" + px(2) + "px;transform-origin:50% 0;box-sizing:border-box;z-index:6;";
    pop.innerHTML = PH_APPS.map((a) =>
      '<div style="display:flex;align-items:center;gap:' + px(9) + 'px;padding:' + px(7) + 'px ' + px(9) + 'px;border-radius:' + px(11) + 'px;' + (a.on ? "background:rgba(255,255,255,.08);" : "") + '">' +
        '<img src="' + a.src + '" alt="" draggable="false" style="width:' + px(20) + 'px;height:' + px(20) + 'px;border-radius:' + px(6) + 'px;display:block;flex-shrink:0;object-fit:contain;">' +
        '<span style="flex:1;font-size:' + px(13) + 'px;font-weight:600;color:#e6e8ee;font-family:system-ui,-apple-system,sans-serif;">' + a.name + '</span>' +
        (a.five != null ? '<span style="font:600 ' + px(10.5) + 'px ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-variant-numeric:tabular-nums;color:' + uuColor(a.five) + ';">' + a.five + '%</span>' : "") +
      '</div>'
    ).join("") +
      '<div style="display:flex;align-items:center;gap:' + px(9) + 'px;padding:' + px(7) + 'px ' + px(9) + 'px;border-radius:0 0 ' + px(14) + "px " + px(14) + 'px;margin-top:' + px(4) + 'px;border-top:1px solid rgba(255,255,255,.08);color:#9b9b9b;">' +
        '<svg viewBox="0 0 12 12" style="width:' + px(14) + 'px;height:' + px(14) + 'px;stroke:currentColor;fill:none;stroke-width:1.4;stroke-linecap:round;"><path d="M6 1.8v8.4M1.8 6h8.4"/></svg>' +
        '<span style="flex:1;font-size:' + px(13) + 'px;font-weight:600;font-family:system-ui,-apple-system,sans-serif;">Add Platform</span>' +
      '</div>';
    pop.style.top = cy() + (MARK * S) / 2 + px(14) + "px";
    overlay.appendChild(pop);
    const sequence = async () => {
      await anim(pop, [
        { opacity: 0, transform: "translateX(-50%) scale(0.85)" },
        { opacity: 1, transform: "translateX(-50%) scale(1)" },
      ], { duration: 200, fill: "forwards", easing: "cubic-bezier(.34,1.3,.64,1)" });
      await new Promise((r) => setTimeout(r, 1200));
      await anim(pop, [
        { opacity: 1, transform: "translateX(-50%) scale(1)" },
        { opacity: 0, transform: "translateX(-50%) scale(0.9)" },
      ], { duration: 150, fill: "forwards" });
      pop.remove();
      moveLeft();
    };
    sequence();
  };

  // center of the stage in overlay px (the sphere's merge point); the holder
  // is translate-centered, so the overlay's own midpoint IS the mark's center
  const cy = () => overlay.getBoundingClientRect().height / 2;

  // beat 4 — the mark moves left: it glides to the bench's rail-button rest
  // (40px, left 14, center 63px from the top) as one clean final beat, and
  // only THEN hub-boot starts and the overlay dissolves — nothing overlaps
  const moveLeft = () => {
    const r = overlay.getBoundingClientRect();
    const restCx = px(14 + 20), restCy = px(63);
    const dx = restCx - r.width / 2, dy = restCy - r.height / 2;
    const move = bloom.animate([
      { transform: "scale(1)" },
      { transform: "translate(" + dx + "px," + dy + "px) scale(" + px(40) / (MARK * S) + ")" },
    ], { duration: 560, fill: "forwards", easing: "cubic-bezier(.3,.7,.2,1)" });
    move.finished.then(() => {
      railBloom();
    }).catch(() => { handoff(); dissolve(); });
  };

  // beat 5 — the dropdown effect: the crew rail assembles downward beneath
  // the settled mark — separator first, then the 7 crew tiles and the +
  // add-app tile springing in 44px apart (the bench's exact bloom)
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
  const railBloom = () => {
    const colLeft = 14;               // crew column left, rest coords
    const crewTop0 = 91 + 8;          // below the separator line
    const railSep = document.createElement("div");
    railSep.style.cssText = "position:absolute;left:" + colLeft * S + "px;top:" + 91 * S + "px;width:" + 32 * S + "px;height:2px;border-radius:1px;background:rgba(255,255,255,.16);opacity:0;";
    overlay.appendChild(railSep);
    const crew = [1, 2, 6, 5, 3, 4, 0].map((idx) => crewTile(ICONS[idx], 40)); // bench order: ChatGPT, Claude, Devin, Hermes, Gemini, Grok, Cursor
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
