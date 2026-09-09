// sphere-intro: the hero's opening — the sphere-collapse bench's desktop
// intro (hero-loading-animations.html), adapted to this site's stage:
//   1. the rail's four app icons (openai, claude, gemini, cursor — the same
//      brand tiles the real rail carries) pop in on a fibonacci sphere and
//      spin up exponentially (0.35 → 21 rad/s), centered in the arena
//   2. they converge and merge (the bench's 450ms accelerating window) and
//      the superbot mascot mark flips and grows (fv-flip-icon-grow, exact)
//   3. the mark shrinks to the rail's tile size and the OTHER app icons drop
//      down from it, right there in the middle — a full replica of the rail
//      assembling beneath the mark (the bench's shrink-top + crew bloom)
//   4. the whole lockup (mark + dropped apps) glides LEFT as one, lands
//      exactly on the real rail, crossfades into it, and the sidebar, chat
//      lane and panel extend into view. hub-boot's story (chips, sorting,
//      transcript) is unused.
// No text dropdowns, no overlapping layers: one beat at a time.
(() => {
  const stage = document.getElementById("stage");
  if (!stage) return;
  const arena = document.getElementById("arena") || stage;

  // the sphere plays for everyone: a prefers-reduced-motion match here was
  // silently skipping the whole intro (the machine reports reduce), leaving
  // hub-boot to run its story from zero — the opposite of the request

  // the spinning tiles ARE the rail's app icons — same registry, same brand
  // grounds — so what merges is what the frontend later shows
  const RAIL_APPS = ["openai", "claude", "gemini", "cursor"];
  const SPIN_TILES = 8; // each vendor twice, spread evenly

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
  const POP_START = 120, POP_STAGGER = 60;
  const popAt = (i) => POP_START + i * POP_STAGGER;
  const OMEGA0 = 0.35, OMEGA_MAX = 21;
  const omegaAt = (tMs) => {
    const x = clamp01(tMs / MERGE_T);
    return OMEGA0 * Math.exp(Math.log(OMEGA_MAX / OMEGA0) * Math.pow(x, 1.55));
  };

  // overlay clips to the terminal BODY (the visible interior) — the arena's
  // own box is far larger than what's visible, so its geometric center lands
  // off-screen; one shared, true coordinate space for every beat
  const body = stage.querySelector(".body") || stage;
  // the transcript margin column is dead weight (hub-boot's story is unused):
  // collapse it from the very first frame so the arena — and the whole hub —
  // own the full stage width, with no empty panel on the left
  body.style.transition = "none";
  body.style.gridTemplateColumns = "0% minmax(0, 1fr)";
  // hide the margin in place — display:none would drop it from the grid flow
  // and auto-place the ARENA into the 0% column, collapsing it to nothing
  const mg = stage.querySelector(".margin");
  if (mg) { mg.style.opacity = "0"; mg.style.padding = "0"; mg.style.borderRight = "0"; mg.style.overflow = "hidden"; }
  const overlay = document.createElement("div");
  overlay.className = "sphere-intro";
  overlay.setAttribute("aria-hidden", "true");
  overlay.style.cssText = "position:absolute;inset:0;overflow:hidden;z-index:30;pointer-events:none;";
  body.appendChild(overlay);

  // the choreography's center in overlay px — the ARENA's center, which since
  // the margin collapse is the stage's center
  const acx = () => arena.offsetLeft + arena.clientWidth / 2;
  const acy = () => arena.offsetTop + arena.clientHeight / 2;
  let S = 1;
  const fit = () => {
    S = Math.min(1, Math.min(arena.clientWidth * 0.72, arena.clientHeight) / (STAGE + 40));
    holder.style.left = acx() + "px";
    holder.style.top = acy() + "px";
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

  const FIB = fibDirs(SPIN_TILES);
  const tiles = RAIL_APPS.concat(RAIL_APPS).map((app) => {
    // reuse the rail's own tile: .rail-item + data-app carries the exact brand
    // ground, ink and hairline the sidebar's icons wear (hub-boot.css)
    const t = document.createElement("span");
    t.className = "rail-item";
    t.dataset.app = app;
    t.innerHTML = '<svg><use href="#sb-ic-' + app + '"/></svg>';
    t.style.cssText = "position:absolute;left:0;top:0;width:" + TILE + "px;height:" + TILE + "px;box-shadow:0 10px 30px -10px rgba(0,0,0,.8);will-change:transform,opacity,filter;opacity:0;";
    const svg = t.querySelector("svg");
    svg.style.width = "31px";
    svg.style.height = "31px";
    holder.appendChild(t);
    return t;
  });

  const place3 = (el, x, y, z) => {
    el.style.transform = "translate3d(" + (C - TILE / 2 + x) + "px," + (C - TILE / 2 + y) + "px," + z + "px)";
  };

  // the handoff: hub-boot's story is not used — the sphere hands straight to
  // the real frontend
  let handedOff = false;
  const handoff = () => {
    handedOff = true;
  };

  // dissolve the overlay, revealing the frontend already in place
  const dissolve = () => {
    overlay.style.transition = "opacity 300ms ease";
    overlay.style.opacity = "0";
    setTimeout(() => overlay.remove(), 320);
  };

  let ang = 0, last = null, phase = "run", raf = 0;
  // tester override: ?intro=<ms> jumps into the timeline — the bench's ?t= pattern
  const startAt = Math.max(0, parseInt(new URLSearchParams(location.search).get("intro") || "0", 10) || 0);
  let clock = startAt;
  const popped = new Array(SPIN_TILES).fill(false);
  const frame = (ts) => {
    if (last == null) last = ts;
    const dMs = Math.min(50, ts - last);
    last = ts;
    clock += dMs;
    ang += (dMs / 1000) * omegaAt(Math.min(clock, MERGE_T));

    for (let i = 0; i < SPIN_TILES; i++) {
      if (clock >= popAt(i) && !popped[i]) { popped[i] = true; tiles[i].style.opacity = "1"; }
    }
    for (let i = 0; i < SPIN_TILES; i++) {
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
      showFrontend();
    }).catch((e) => {
      if (!e || e.name !== "AbortError") console.error("[sphere-intro] flip failed:", e);
    });
  };

  const anim = (el, keyframes, opts) =>
    el.animate(keyframes, opts).finished.catch((e) => {
      if (!e || e.name !== "AbortError") console.error("[sphere-intro] step failed:", e);
    });
  const px = (v) => v * S;
  // commit a finished fill:forwards animation to inline style and drop it —
  // a finished filling animation's effect can be garbage-collected otherwise
  const settle = (el) => {
    const a = el.getAnimations().pop();
    if (!a) return;
    try { a.commitStyles(); } catch (e) {}
    try { a.cancel(); } catch (e) {}
  };

  // beats 3 + 4 — the rail assembles UNDER the mark, in the middle of the
  // stage, then the whole lockup glides left and lands on the real rail
  const showFrontend = async () => {
    const hub = document.getElementById("hub");
    if (!hub) { dissolve(); return; }
    const rail = hub.querySelector(".rail");
    const sb = hub.querySelector(".rail-item.sb");
    if (!rail || !sb) { hub.style.opacity = "1"; dissolve(); return; }
    const ovR = overlay.getBoundingClientRect();

    // measure the real rail: every tile's offset from the superbot tile, so
    // the replica assembles with the exact pitch it must land on
    const sbR = sb.getBoundingClientRect();
    const parts = [...rail.children].filter((el) => el !== sb).map((el) => {
      const r = el.getBoundingClientRect();
      return {
        el,
        dx: (r.left + r.width / 2) - (sbR.left + sbR.width / 2),
        dy: (r.top + r.height / 2) - (sbR.top + sbR.height / 2),
        w: r.width, h: r.height,
      };
    });
    const maxDy = parts.length ? parts[parts.length - 1].dy : 0;
    // where the lockup rests: the real superbot slot, in overlay coords
    const sbFx = sbR.left + sbR.width / 2 - ovR.left;
    const sbFy = sbR.top + sbR.height / 2 - ovR.top;
    // the assembly first stands centered in the arena, superbot tile on top
    const homeY = acy() - maxDy / 2;
    const k = sbR.width / (MARK * S);

    // beat 3a — the mark shrinks to the tile size and rises to the column head
    await anim(bloom, [
      { transform: "translate(0,0) scale(1)" },
      { transform: "translate(0," + (homeY - acy()) + "px) scale(" + k + ")" },
    ], { duration: 620, easing: "cubic-bezier(.3,.7,.2,1)", fill: "forwards" });
    settle(bloom);

    // beat 3b — the other app icons drop down from the mark, one at a time:
    // clones of the real rail children, so the landing is pixel-identical
    const clones = parts.map((p) => {
      const c = p.el.cloneNode(true);
      c.style.cssText += ";position:absolute;margin:0;opacity:0;will-change:transform,opacity;left:" + (acx() + p.dx - p.w / 2) + "px;top:" + (homeY + p.dy - p.h / 2) + "px;";
      if (c.classList.contains("rail-div")) c.style.cssText += ";background:var(--line);border-radius:2px;";
      overlay.appendChild(c);
      return c;
    });
    await Promise.all(clones.map((c, i) => anim(c, [
      { transform: "translateY(-34px)", opacity: 0 },
      { transform: "translateY(0)", opacity: 1 },
    ], { duration: 480, delay: i * 90, easing: "cubic-bezier(.34,1.56,.64,1)", fill: "forwards" })));
    clones.forEach(settle);

    // beat 4 — ALL of it moves left as one: the lockup glides from its
    // centered stand onto the real rail while the hub window materializes
    // under it; the deltas are measured, so the landing is pixel-exact
    const gx = sbFx - acx(), gy = sbFy - homeY;
    hub.style.opacity = "1";
    hub.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 500, easing: "ease-out" });
    const from = "translate(0," + (homeY - acy()) + "px) scale(" + k + ")";
    const to = "translate(" + gx + "px," + (homeY - acy() + gy) + "px) scale(" + k + ")";
    await Promise.all([
      anim(bloom, [{ transform: from }, { transform: to }], { duration: 640, easing: "cubic-bezier(.3,.7,.2,1)", fill: "forwards" }),
      ...clones.map((c) => anim(c, [
        { transform: "translate(0,0)" },
        { transform: "translate(" + gx + "px," + gy + "px)" },
      ], { duration: 640, easing: "cubic-bezier(.3,.7,.2,1)", fill: "forwards" })),
    ]);
    // the lockup becomes the real rail: reveal the column underneath (the
    // clones sit pixel-aligned on top) and dissolve the overlay copies
    rail.style.opacity = "1";
    sb.style.opacity = "1";
    parts.forEach((p) => { p.el.style.opacity = "1"; });
    await Promise.all([
      anim(bloom, [{ opacity: 1 }, { opacity: 0 }], { duration: 260, fill: "forwards" }),
      ...clones.map((c) => anim(c, [{ opacity: 1 }, { opacity: 0 }], { duration: 260, fill: "forwards" })),
    ]);
    // the frontend extends: the sidebar, chat lane and panel fade into view
    const rest = [...hub.querySelectorAll(".inner")].filter((el) => !el.classList.contains("rail"));
    await Promise.all(rest.map((el) => anim(el, [{ opacity: 0 }, { opacity: 1 }], { duration: 380, fill: "forwards", easing: "ease-out" })));
    handoff();
    dissolve();
  };

  raf = requestAnimationFrame(frame);

  // watchdog: if any step stalls (WAAPI promises can sit unresolved under
  // throttling), force the handoff and dissolve so the stage is never covered
  setTimeout(() => { handoff(); if (overlay.isConnected) dissolve(); }, startAt + 11000);
})();
