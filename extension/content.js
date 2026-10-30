// No AI – hides Google's AI Overview and AI Mode on search result pages.
//
// Modes (stored in extension storage under "mode"):
//   "hide" – hide AI Overview and the AI Mode tab (default)
//   "web"  – additionally switch to Google's "Web" results (udm=14),
//            which Google renders without any AI Overview
//   "off"  – do nothing

(() => {
  "use strict";

  const api = globalThis.browser ?? globalThis.chrome;
  const DEFAULT_MODE = "hide";

  // Headings Google uses for the AI Overview box, lower-cased.
  const AI_HEADINGS = new Set([
    "ai overview",
    "ai overviews",
    "übersicht mit ki",
    "ki-übersicht",
    "aperçu ia",
    "aperçu généré par l'ia",
    "aperçu généré par l’ia",
    "resumen de ia",
    "resumen creado con ia",
    "vista creada con ia",
    "panoramica ai",
    "panoramica ia",
    "ai-overzicht",
    "visão geral criada por ia",
    "przegląd od ai",
    "ai-oversigt",
    "ai-översikt",
    "ki-oversikt",
    "ai-yhteenveto",
  ]);

  // Containers we never climb past when looking for the AI Overview block.
  const STOP_IDS = new Set(["rso", "center_col", "rcnt", "search", "main", "cnt"]);

  let mode = DEFAULT_MODE;
  let observer = null;

  // Works with both the promise-based `browser` API (Safari, Firefox)
  // and the callback-based `chrome` API.
  function loadMode() {
    const defaults = { mode: DEFAULT_MODE };
    const read = globalThis.browser
      ? api.storage.local.get(defaults)
      : new Promise((resolve) => api.storage.local.get(defaults, resolve));
    return read.then(
      (items) => items?.mode ?? DEFAULT_MODE,
      () => DEFAULT_MODE
    );
  }

  function applyMode() {
    const root = document.documentElement;
    if (mode === "off") {
      root.removeAttribute("data-noai");
      stopObserving();
      return;
    }
    root.setAttribute("data-noai", mode);
    if (mode === "web" && switchToWebResults()) return;
    scan();
    startObserving();
  }

  // Redirects a plain "All" search to the AI-free "Web" tab.
  // Returns true if a redirect was started.
  function switchToWebResults() {
    const url = new URL(location.href);
    const p = url.searchParams;
    if (url.pathname !== "/search" || !p.has("q")) return false;
    // Leave other tabs (images, news, shopping, …) alone.
    if (p.has("udm") || p.has("tbm")) return false;
    p.set("udm", "14");
    location.replace(url.toString());
    return true;
  }

  function resultTitleCount(el) {
    return el.querySelectorAll("a h3").length;
  }

  // Walks up from the heading to the largest block that still contains
  // no additional regular search results, so only the AI box is hidden.
  function findAiBlock(heading) {
    let block = heading;
    const ownResults = resultTitleCount(heading);
    while (block.parentElement) {
      const parent = block.parentElement;
      if (parent === document.body || STOP_IDS.has(parent.id)) break;
      if (resultTitleCount(parent) > ownResults) break;
      block = parent;
    }
    return block;
  }

  function scan() {
    if (mode === "off") return;
    const scope = document.getElementById("rcnt") || document.body;
    if (!scope) return;
    const candidates = scope.querySelectorAll(
      'h1, h2, h3, [role="heading"], strong, span, div[aria-level]'
    );
    for (const el of candidates) {
      if (el.closest("[data-noai-hidden]")) continue;
      const text = el.textContent;
      if (!text || text.length > 40) continue;
      if (!AI_HEADINGS.has(text.trim().toLowerCase())) continue;
      // Skip the heading if it is a regular result title linking somewhere.
      if (el.closest("a[href]")) continue;
      findAiBlock(el).setAttribute("data-noai-hidden", "");
    }
  }

  let scheduled = false;
  function scheduleScan() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      scan();
    });
  }

  function startObserving() {
    if (observer) return;
    observer = new MutationObserver(scheduleScan);
    observer.observe(document.documentElement, { childList: true, subtree: true });
    document.addEventListener("DOMContentLoaded", scan, { once: true });
  }

  function stopObserving() {
    observer?.disconnect();
    observer = null;
  }

  // Apply the default right away so the AI box never flashes, then
  // correct it once the stored setting has been read.
  document.documentElement.setAttribute("data-noai", DEFAULT_MODE);

  loadMode().then((stored) => {
    mode = stored;
    applyMode();
  });

  api.storage.onChanged.addListener((changes, area) => {
    if (area !== "local" || !changes.mode) return;
    mode = changes.mode.newValue ?? DEFAULT_MODE;
    applyMode();
  });
})();
