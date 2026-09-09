// hero-edit: a small live editor for the hero brand lockup. Open the page
// with ?edit and a panel appears: edit the wordmark and the tagline, scale
// each, scale the mark, set the gap, and nudge the words with the sliders
// or by DRAGGING them. Values write straight to the lockup's custom
// properties (hero-3.css .sb-lockup) so what you see is what ships; "Copy
// CSS" puts the exact override line + the .sb-words markup on the clipboard
// to paste back. Nothing here loads without ?edit.
(() => {
  const lockup = document.querySelector(".sb-lockup");
  const words = lockup && lockup.querySelector(".sb-words");
  const h1 = words && words.querySelector("h1");
  const tag = words && words.querySelector(".tag");
  if (!lockup || !words || !h1 || !tag) return;

  const KEY = "hero-tune-2";
  const DEFAULTS = { text: "superbot.gg", tag: "the agent to manage your agents.", h1: 1, tagScale: 1, mark: 6.4, gap: 12, dx: 0, dy: 0 };
  const FIELDS = [
    { k: "h1", label: "wordmark size", min: 0.4, max: 2, step: 0.01, unit: "×" },
    { k: "tagScale", label: "tagline size", min: 0.4, max: 2.5, step: 0.01, unit: "×" },
    { k: "mark", label: "mark size", min: 2, max: 10, step: 0.05, unit: "em" },
    { k: "gap", label: "gap", min: 0, max: 96, step: 1, unit: "px" },
    { k: "dx", label: "words x", min: -300, max: 300, step: 1, unit: "px" },
    { k: "dy", label: "words y", min: -200, max: 200, step: 1, unit: "px" },
  ];
  let v = { ...DEFAULTS };
  try { v = { ...v, ...JSON.parse(localStorage.getItem(KEY) || "{}") }; } catch (e) { console.error("[hero-edit] saved values unreadable:", e); }

  const esc = (s) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]);
  const apply = () => {
    lockup.style.setProperty("--hero-h1-scale", String(v.h1));
    lockup.style.setProperty("--hero-tag-scale", String(v.tagScale));
    lockup.style.setProperty("--hero-mark", v.mark + "em");
    lockup.style.setProperty("--hero-gap", v.gap + "px");
    lockup.style.setProperty("--hero-h1-dx", v.dx + "px");
    lockup.style.setProperty("--hero-h1-dy", v.dy + "px");
    if (h1.textContent !== v.text) h1.textContent = v.text;
    if (tag.textContent !== v.tag) tag.textContent = v.tag;
    FIELDS.forEach((f) => { const o = out[f.k]; if (o) o.textContent = fmt(f, v[f.k]); const r = inputs[f.k]; if (r && +r.value !== v[f.k]) r.value = v[f.k]; });
  };
  const fmt = (f, x) => (f.step < 1 ? Number(x).toFixed(2) : String(Math.round(x))) + f.unit;
  const save = () => localStorage.setItem(KEY, JSON.stringify(v));

  const cssBlock = () =>
    ".sb-lockup { --hero-mark: " + v.mark + "em; --hero-h1-scale: " + v.h1 + "; --hero-tag-scale: " + v.tagScale + "; --hero-gap: " + v.gap + "px; --hero-h1-dx: " + v.dx + "px; --hero-h1-dy: " + v.dy + "px; }\n" +
    '<div class="sb-words">\n  <h1>' + esc(v.text) + '</h1>\n  <p class="tag">' + esc(v.tag) + "</p>\n</div>";

  // ---- the panel ----
  const panel = document.createElement("div");
  panel.id = "hero-edit";
  panel.style.cssText = "position:fixed;top:12px;right:12px;z-index:9999;width:300px;padding:12px;border-radius:12px;background:#111;color:#eee;border:1px solid #333;box-shadow:0 12px 40px rgba(0,0,0,.6);font:12px/1.4 -apple-system,system-ui,sans-serif;";
  const field = (id, label) => '<label style="display:block;color:#aaa;margin:6px 0 3px">' + label + '</label><input id="' + id + '" style="width:100%;box-sizing:border-box;background:#000;color:#eee;border:1px solid #333;border-radius:8px;padding:6px;font:13px/1.3 inherit">';
  panel.innerHTML =
    '<div style="display:flex;align-items:center;justify-content:space-between"><b>hero editor</b><span style="color:#888">drag the words to move them</span></div>' +
    field("he-text", "wordmark") + field("he-tag", "tagline") +
    '<div id="he-fields" style="margin-top:8px"></div>' +
    '<div style="display:flex;gap:6px;margin-top:10px"><button id="he-copy" style="flex:1">Copy CSS</button><button id="he-reset">Reset</button></div>' +
    '<div id="he-msg" style="color:#8f8;margin-top:6px;min-height:1.2em"></div>';
  document.body.appendChild(panel);
  panel.querySelectorAll("button").forEach((b) => { b.style.cssText = "padding:6px 10px;border-radius:8px;border:1px solid #444;background:#222;color:#eee;cursor:pointer;font:inherit;"; });

  const inputs = {}, out = {};
  const fields = panel.querySelector("#he-fields");
  FIELDS.forEach((f) => {
    const row = document.createElement("div");
    row.style.cssText = "display:grid;grid-template-columns:90px 1fr 52px;align-items:center;gap:6px;margin:3px 0";
    row.innerHTML = '<span style="color:#aaa">' + f.label + '</span><input type="range" min="' + f.min + '" max="' + f.max + '" step="' + f.step + '" style="width:100%"><span style="text-align:right;color:#ccc"></span>';
    fields.appendChild(row);
    inputs[f.k] = row.querySelector("input");
    out[f.k] = row.querySelector("span:last-child");
    inputs[f.k].addEventListener("input", () => { v[f.k] = +inputs[f.k].value; apply(); save(); });
  });
  const tx = panel.querySelector("#he-text"), tg = panel.querySelector("#he-tag");
  tx.value = v.text; tg.value = v.tag;
  tx.addEventListener("input", () => { v.text = tx.value; apply(); save(); });
  tg.addEventListener("input", () => { v.tag = tg.value; apply(); save(); });
  panel.querySelector("#he-reset").addEventListener("click", () => { v = { ...DEFAULTS }; tx.value = v.text; tg.value = v.tag; apply(); save(); msg("reset to the shipped values"); });
  panel.querySelector("#he-copy").addEventListener("click", async () => {
    const s = cssBlock();
    try { await navigator.clipboard.writeText(s); msg("copied — paste the first line into hero-3.css and the .sb-words block into index.html"); }
    catch (e) { console.error("[hero-edit] clipboard refused:", e); window.prompt("copy this:", s); }
  });
  const msg = (t) => { panel.querySelector("#he-msg").textContent = t; };

  // ---- drag the words ----
  words.style.cursor = "move";
  words.style.userSelect = "none";
  let drag = null;
  words.addEventListener("pointerdown", (e) => { drag = { x: e.clientX, y: e.clientY, dx: v.dx, dy: v.dy }; words.setPointerCapture(e.pointerId); e.preventDefault(); });
  words.addEventListener("pointermove", (e) => { if (!drag) return; v.dx = Math.round(drag.dx + e.clientX - drag.x); v.dy = Math.round(drag.dy + e.clientY - drag.y); apply(); });
  words.addEventListener("pointerup", () => { if (drag) { drag = null; save(); } });

  apply();
})();
