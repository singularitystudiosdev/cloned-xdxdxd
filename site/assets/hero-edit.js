// hero-edit: a small live editor for the hero lockup. Open the page with
// ?edit and a panel appears: edit the headline's lines, scale the text and
// the mark, set the gap, and nudge the headline with the sliders or by
// DRAGGING it. Values write straight to the lockup's custom properties
// (hero-2.css .sb-lockup) so what you see is what ships; "Copy CSS" puts the
// exact override block + the <h1> markup on the clipboard to paste back.
// Nothing here loads without ?edit.
(() => {
  const lockup = document.querySelector(".sb-lockup");
  const h1 = lockup && lockup.querySelector("h1");
  if (!lockup || !h1) return;

  const KEY = "hero-tune";
  const DEFAULTS = { text: "the agent\nto manage\nyour agents.", h1: 0.85, lh: 1.1, mark: 4.25, gap: 20, dx: 0, dy: 0 };
  const FIELDS = [
    { k: "h1", label: "text size", min: 0.4, max: 1.6, step: 0.01, unit: "×" },
    { k: "lh", label: "line height", min: 0.8, max: 1.6, step: 0.01, unit: "" },
    { k: "mark", label: "mark size", min: 1.5, max: 8, step: 0.05, unit: "em" },
    { k: "gap", label: "gap", min: 0, max: 96, step: 1, unit: "px" },
    { k: "dx", label: "text x", min: -300, max: 300, step: 1, unit: "px" },
    { k: "dy", label: "text y", min: -200, max: 200, step: 1, unit: "px" },
  ];
  let v = { ...DEFAULTS };
  try { v = { ...v, ...JSON.parse(localStorage.getItem(KEY) || "{}") }; } catch (e) { console.error("[hero-edit] saved values unreadable:", e); }

  const apply = () => {
    lockup.style.setProperty("--hero-h1-scale", String(v.h1));
    lockup.style.setProperty("--hero-h1-lh", String(v.lh));
    lockup.style.setProperty("--hero-mark", v.mark + "em");
    lockup.style.setProperty("--hero-gap", v.gap + "px");
    lockup.style.setProperty("--hero-h1-dx", v.dx + "px");
    lockup.style.setProperty("--hero-h1-dy", v.dy + "px");
    const html = v.text.split("\n").map((s) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c])).join("<br/>");
    if (h1.innerHTML !== html) h1.innerHTML = html;
    FIELDS.forEach((f) => { const o = out[f.k]; if (o) o.textContent = fmt(f, v[f.k]); const r = inputs[f.k]; if (r && +r.value !== v[f.k]) r.value = v[f.k]; });
  };
  const fmt = (f, x) => (f.step < 1 ? Number(x).toFixed(2) : String(Math.round(x))) + f.unit;
  const save = () => localStorage.setItem(KEY, JSON.stringify(v));

  const cssBlock = () =>
    ".sb-lockup { --hero-mark: " + v.mark + "em; --hero-h1-scale: " + v.h1 + "; --hero-h1-lh: " + v.lh + "; --hero-gap: " + v.gap + "px; --hero-h1-dx: " + v.dx + "px; --hero-h1-dy: " + v.dy + "px; }\n" +
    "<h1>" + h1.innerHTML + "</h1>";

  // ---- the panel ----
  const panel = document.createElement("div");
  panel.id = "hero-edit";
  panel.style.cssText = "position:fixed;top:12px;right:12px;z-index:9999;width:280px;padding:12px;border-radius:12px;background:#111;color:#eee;border:1px solid #333;box-shadow:0 12px 40px rgba(0,0,0,.6);font:12px/1.4 -apple-system,system-ui,sans-serif;";
  panel.innerHTML =
    '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px"><b>hero editor</b><span style="color:#888">drag the headline to move it</span></div>' +
    '<label style="display:block;color:#aaa;margin-bottom:4px">headline (one line per row)</label>' +
    '<textarea id="he-text" rows="3" style="width:100%;box-sizing:border-box;resize:vertical;background:#000;color:#eee;border:1px solid #333;border-radius:8px;padding:6px;font:13px/1.3 inherit"></textarea>' +
    '<div id="he-fields" style="margin-top:6px"></div>' +
    '<div style="display:flex;gap:6px;margin-top:10px"><button id="he-copy" style="flex:1">Copy CSS</button><button id="he-reset">Reset</button></div>' +
    '<div id="he-msg" style="color:#8f8;margin-top:6px;min-height:1.2em"></div>';
  document.body.appendChild(panel);
  panel.querySelectorAll("button").forEach((b) => { b.style.cssText = "padding:6px 10px;border-radius:8px;border:1px solid #444;background:#222;color:#eee;cursor:pointer;font:inherit;"; });

  const inputs = {}, out = {};
  const fields = panel.querySelector("#he-fields");
  FIELDS.forEach((f) => {
    const row = document.createElement("div");
    row.style.cssText = "display:grid;grid-template-columns:76px 1fr 52px;align-items:center;gap:6px;margin:3px 0";
    row.innerHTML = '<span style="color:#aaa">' + f.label + '</span><input type="range" min="' + f.min + '" max="' + f.max + '" step="' + f.step + '" style="width:100%"><span style="text-align:right;color:#ccc"></span>';
    fields.appendChild(row);
    inputs[f.k] = row.querySelector("input");
    out[f.k] = row.querySelector("span:last-child");
    inputs[f.k].addEventListener("input", () => { v[f.k] = +inputs[f.k].value; apply(); save(); });
  });
  const ta = panel.querySelector("#he-text");
  ta.value = v.text;
  ta.addEventListener("input", () => { v.text = ta.value; apply(); save(); });
  panel.querySelector("#he-reset").addEventListener("click", () => { v = { ...DEFAULTS }; ta.value = v.text; apply(); save(); msg("reset to the shipped values"); });
  panel.querySelector("#he-copy").addEventListener("click", async () => {
    const s = cssBlock();
    try { await navigator.clipboard.writeText(s); msg("copied — paste the first line into hero-2.css and the <h1> into index.html"); }
    catch (e) { console.error("[hero-edit] clipboard refused:", e); window.prompt("copy this:", s); }
  });
  const msg = (t) => { panel.querySelector("#he-msg").textContent = t; };

  // ---- drag the headline ----
  h1.style.cursor = "move";
  h1.style.userSelect = "none";
  let drag = null;
  h1.addEventListener("pointerdown", (e) => { drag = { x: e.clientX, y: e.clientY, dx: v.dx, dy: v.dy }; h1.setPointerCapture(e.pointerId); e.preventDefault(); });
  h1.addEventListener("pointermove", (e) => { if (!drag) return; v.dx = Math.round(drag.dx + e.clientX - drag.x); v.dy = Math.round(drag.dy + e.clientY - drag.y); apply(); });
  h1.addEventListener("pointerup", () => { if (drag) { drag = null; save(); } });

  apply();
})();
