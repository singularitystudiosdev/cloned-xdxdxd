// sphere-intro: the hero's new OPENING segment — the bench's DESKTOP-card
// choreography (hero-loading-animations.html), not the phone variant: the
// 460px coordinate space rides the card's center column, tiles pop FULL SIZE
// from the first frame, depth (z+190)/380, blur pow(t,2)*3.6 + depth falloff.
// 17 app icons pop in one at a time on a fibonacci sphere, spin up
// exponentially (0.35 → 21 rad/s), converge and merge over the same 450ms
// accelerating window, then the superbot mascot mark flips and grows
// (fv-flip-icon-grow, exact). At the merge moment hub-boot.js starts playing
// UNDER the overlay (from its 2.9s mark), so when the mark expands and the
// overlay dissolves the story is already alive — the transition is seamless.
(() => {
  const stage = document.getElementById("stage");
  if (!stage) return;

  // reduced motion: skip the sphere, hand straight to hub-boot's own still
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
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

  // the bench's fixed coordinate space: 460px, sphere R=175, 54px tiles
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

  // timeline: pops (0-0.9s) → exponential spin-up with convergence → merge at MERGE_T
  const MERGE_T = 4000;
  const POP_START = 120, POP_STAGGER = 48;
  const popAt = (i) => POP_START + i * POP_STAGGER;
  // exponential tween, skewed late: 0.35 rad/s → 21 rad/s at the merge
  const OMEGA0 = 0.35, OMEGA_MAX = 21;
  const omegaAt = (tMs) => {
    const x = clamp01(tMs / MERGE_T);
    return OMEGA0 * Math.exp(Math.log(OMEGA_MAX / OMEGA0) * Math.pow(x, 1.55));
  };

  // the hub-boot story picks up here once the sphere hands off (its face is
  // just formed; the boot-log opening this intro replaces sat before it)
  const HANDOFF_AT = 2.9;

  // overlay: fills the stage, transparent — the stage card shows through
  const overlay = document.createElement("div");
  overlay.className = "sphere-intro";
  overlay.setAttribute("aria-hidden", "true");
  overlay.style.cssText = "position:absolute;inset:0;overflow:hidden;z-index:30;pointer-events:none;";
  stage.appendChild(overlay);

  // fixed 460px choreography space, centered in the stage, NEVER upscaled —
  // the sphere (R 175 + half a 54px tile = 202px) must stay inside its 230px
  // half-space so nothing rides out of frame
  const holder = document.createElement("div");
  holder.style.cssText = "position:absolute;left:50%;top:50%;width:" + STAGE + "px;height:" + STAGE + "px;transform:translate(-50%,-50%);transform-style:preserve-3d;perspective:1100px;";
  overlay.appendChild(holder);
  const fit = () => {
    const r = stage.getBoundingClientRect();
    const s = Math.min(1, Math.min(r.width, r.height) / (STAGE + 40));
    holder.style.transform = "translate(-50%,-50%) scale(" + s + ")";
  };
  fit();
  addEventListener("resize", fit);

  // the merge target — the site's own mascot mark on the dark tile, with the
  // same teal/magenta chromatic fringe the hero's big mascot carries
  const bloom = document.createElement("div");
  bloom.style.cssText = "position:absolute;left:50%;top:50%;width:250px;height:250px;margin:-125px 0 0 -125px;z-index:5;opacity:0;will-change:transform,filter;";
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
  // called at the merge moment and by the watchdog.
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
  // tester override: ?intro=<ms> jumps into the timeline (e.g. ?intro=4300
  // lands just after the merge, mid-flip) — the bench's ?t= pattern
  const startAt = Math.max(0, parseInt(new URLSearchParams(location.search).get("intro") || "0", 10) || 0);
  let clock = startAt;
  const popped = new Array(ICONS.length).fill(false);
  const frame = (ts) => {
    if (last == null) last = ts;
    const dMs = Math.min(50, ts - last);
    last = ts;
    clock += dMs;
    ang += (dMs / 1000) * omegaAt(Math.min(clock, MERGE_T));

    // sequential pop-in, one at a time, FULL SIZE from the first frame
    for (let i = 0; i < ICONS.length; i++) {
      if (clock >= popAt(i) && !popped[i]) { popped[i] = true; tiles[i].style.opacity = "1"; }
    }

    for (let i = 0; i < ICONS.length; i++) {
      if (!popped[i]) continue;
      const v = rotY3(FIB[i], ang);
      // fast convergence: 450ms, accelerating INTO the center
      const mergeT = Math.pow(clamp01((clock - (MERGE_T - 450)) / 450), 1.7);
      const x = lerp(v.x * R, 0, mergeT), y = lerp(v.y * R, 0, mergeT), z = v.z * lerp(R, 10, mergeT);
      const depth = (z + 190) / 380;
      place3(tiles[i], x, y, z);
      tiles[i].style.opacity = String(Math.min(1, (0.16 + 0.84 * depth) * (1 - clamp01((clock - MERGE_T) / 220))));
      // motion blur stays off for most of the ramp and only smears in the last stretch
      const blurT = clamp01((clock - MERGE_T * 0.62) / (MERGE_T * 0.38));
      const blur = Math.pow(blurT, 2) * 3.6 + (depth < 0.5 ? (0.5 - depth) * 3 : 0);
      tiles[i].style.filter = blur > 0.05 ? "blur(" + blur.toFixed(2) + "px)" : "none";
    }
    if ((phase === "finisher" || phase === "done") && clock >= MERGE_T + 220) {
      tiles.forEach((t) => { t.style.visibility = "hidden"; });
    }
    if (phase === "run" && clock >= MERGE_T) { phase = "finisher"; runFinisher(); }
    if (phase === "run" || (phase === "finisher" && clock < MERGE_T + 220)) raf = requestAnimationFrame(frame);
  };

  // fv-flip-icon-grow, exact: 0→0.76 flip 180°→0° + grow + brighten, then settle
  const runFinisher = () => {
    handoff(); // the story starts beneath the overlay NOW — seamless reveal later
    bloom.style.opacity = "1";
    const flip = bloom.animate([
      {
        transform: "perspective(900px) rotateY(180deg) scale(" + (TILE / 250) + ")",
        filter: "brightness(0.5)",
        easing: "cubic-bezier(.3,.85,.3,1.04)",
      },
      {
        transform: "perspective(900px) rotateY(0deg) scale(1.05)",
        filter: "brightness(1)",
        offset: 0.76,
        easing: "ease-out",
      },
      { transform: "scale(1)", filter: "brightness(1)" },
    ], { duration: 920, fill: "forwards" });
    flip.finished.then(() => {
      try { flip.commitStyles(); } catch (e) {}
      flip.cancel();
      extension();
    }).catch((e) => {
      if (!e || e.name !== "AbortError") console.error("[sphere-intro] flip failed:", e);
    });
  };

  // the extension: the mark expands outward and the overlay dissolves —
  // hub-boot's story is already alive underneath (the demo's "expands into
  // the chat", here into the hub story)
  const extension = () => {
    const grow = bloom.animate([
      { transform: "scale(1)", opacity: 1, easing: "cubic-bezier(.3,.7,.2,1)" },
      { transform: "scale(2.6)", opacity: 0 },
    ], { duration: 620, fill: "forwards" });
    grow.finished.then(dissolve).catch(dissolve);
  };

  raf = requestAnimationFrame(frame);

  // watchdog: if the finisher chain ever stalls (WAAPI promises can sit
  // unresolved under throttling), force the handoff and dissolve so the
  // stage is never left covered
  setTimeout(() => { handoff(); if (overlay.isConnected) dissolve(); }, startAt + MERGE_T + 920 + 620 + 500);
})();
