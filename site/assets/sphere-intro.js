// sphere-intro: the hero intro. 17 app icons pop in one at a time on a
// fibonacci sphere, spin up exponentially, converge and merge into the
// superbot app icon, the icon flips and grows (the bench's fv-flip-icon-grow
// curve, exact), then it expands and dissolves — the extension — handing the
// stage back to its settled hub UI. Curves ported from the sphere-collapse
// bench (hero-loading-animations.html): the same pop clock, the same
// exponential spin-up (0.35 → 21 rad/s), the same 450ms accelerating merge,
// the same 920ms flip+grow. Replaces hub-boot.js (kept on disk, unreferenced).
(() => {
  const stage = document.getElementById("stage");
  if (!stage) return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return; // static stage stays

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

  const STAGE = 460, C = STAGE / 2, R = 175, TILE = 54;
  const TAU = Math.PI * 2;
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
  const easeOutBack = (t) => { const c = 1.70158; const x = clamp01(t); return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };

  // overlay: fills the stage, transparent — the stage card shows through
  const overlay = document.createElement("div");
  overlay.className = "sphere-intro";
  overlay.setAttribute("aria-hidden", "true");
  overlay.style.cssText = "position:absolute;inset:0;overflow:hidden;z-index:30;pointer-events:none;";
  stage.appendChild(overlay);

  // fixed 460px choreography space, scaled to fit the stage
  const holder = document.createElement("div");
  holder.style.cssText = "position:absolute;left:50%;top:50%;width:" + STAGE + "px;height:" + STAGE + "px;transform:translate(-50%,-50%);transform-style:preserve-3d;perspective:1100px;";
  overlay.appendChild(holder);
  const fit = () => {
    const r = stage.getBoundingClientRect();
    const s = Math.max(0.3, Math.min(r.width, r.height) / (STAGE + 40));
    holder.style.transform = "translate(-50%,-50%) scale(" + s + ")";
  };
  fit();
  addEventListener("resize", fit);

  // the merge target — appears instantly at the merge, then flips + grows
  const bloom = document.createElement("div");
  bloom.style.cssText = "position:absolute;left:50%;top:50%;width:250px;height:250px;margin:-125px 0 0 -125px;z-index:5;opacity:0;will-change:transform,filter;";
  const bloomImg = new Image();
  bloomImg.src = "site/assets/intro/superbot-bloom-m13.png";
  bloomImg.alt = "";
  bloomImg.draggable = false;
  bloomImg.style.cssText = "width:100%;height:100%;display:block;border-radius:56px;box-shadow:0 18px 70px -18px rgba(0,0,0,.85);";
  bloom.appendChild(bloomImg);
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

  const place3 = (el, x, y, z, s) => {
    const size = TILE * s;
    el.style.transform = "translate3d(" + (C - size / 2 + x) + "px," + (C - size / 2 + y) + "px," + z + "px) scale(" + s + ")";
  };

  let ang = 0, last = null, phase = "run", raf = 0;
  // tester override: ?intro=<ms> jumps into the timeline (e.g. ?intro=4300
  // lands just after the merge, mid-flip) — the bench's ?t= pattern
  const startAt = Math.max(0, parseInt(new URLSearchParams(location.search).get("intro") || "0", 10) || 0);
  let clock = startAt;
  const frame = (ts) => {
    if (last == null) last = ts;
    const dMs = Math.min(50, ts - last);
    last = ts;
    clock += dMs;
    ang += (dMs / 1000) * omegaAt(Math.min(clock, MERGE_T));
    tiles.forEach((t, i) => {
      const pop = clamp01((clock - popAt(i)) / 240);
      if (pop <= 0) { t.style.opacity = "0"; return; }
      const v = rotY3(FIB[i], ang);
      let x, y, z;
      if (clock < MERGE_T - 450) {
        x = v.x * R; y = v.y * R; z = v.z * R;
      } else {
        const mergeT = Math.pow(clamp01((clock - (MERGE_T - 450)) / 450), 1.7);
        x = lerp(v.x * R, 0, mergeT); y = lerp(v.y * R, 0, mergeT); z = v.z * lerp(R, 10, mergeT);
      }
      const depth = (v.z + 1) / 2;
      const blurT = clamp01((clock - MERGE_T * 0.62) / (MERGE_T * 0.38));
      t.style.opacity = String(Math.min(1, (0.16 + 0.84 * depth) * (1 - clamp01((clock - MERGE_T) / 220))) * pop);
      t.style.filter = "blur(" + (blurT * 4).toFixed(2) + "px)";
      place3(t, x, y, z, 0.6 + 0.4 * easeOutBack(pop));
    });
    if (phase === "run" && clock >= MERGE_T) { phase = "finisher"; runFinisher(); }
    if (phase === "run") raf = requestAnimationFrame(frame);
    else if (clock >= MERGE_T + 240) {
      tiles.forEach((t) => { t.style.visibility = "hidden"; });
    } else raf = requestAnimationFrame(frame);
  };

  // fv-flip-icon-grow, exact: 0→0.76 flip 180°→0° + grow + brighten, then settle
  const runFinisher = () => {
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

  // the extension: the icon expands outward and the overlay dissolves,
  // revealing the settled stage beneath (the demo's "expands into the chat")
  const extension = () => {
    const grow = bloom.animate([
      { transform: "scale(1)", opacity: 1, easing: "cubic-bezier(.3,.7,.2,1)" },
      { transform: "scale(2.6)", opacity: 0 },
    ], { duration: 620, fill: "forwards" });
    const done = () => {
      overlay.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, fill: "forwards" })
        .finished.then(() => overlay.remove()).catch(() => overlay.remove());
    };
    grow.finished.then(done).catch(done);
  };

  raf = requestAnimationFrame(frame);

  // watchdog: if the finisher chain ever stalls (WAAPI promises can sit
  // unresolved under throttling), force the reveal so the stage is never
  // left covered
  setTimeout(() => {
    if (overlay.isConnected) {
      overlay.style.transition = "opacity 300ms ease";
      overlay.style.opacity = "0";
      setTimeout(() => overlay.remove(), 320);
    }
  }, MERGE_T + 920 + 620 + 500);
})();
