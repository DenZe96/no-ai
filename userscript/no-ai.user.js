// ==UserScript==
// @name         No AI – Google ohne KI
// @description  Blendet die KI-Übersicht (AI Overview) und den KI-Modus in der Google-Suche aus.
// @version      1.0.0
// @match        *://www.google.com/search*
// @match        *://www.google.de/search*
// @match        *://www.google.at/search*
// @match        *://www.google.ch/search*
// @match        *://www.google.co.uk/search*
// @match        *://www.google.fr/search*
// @match        *://www.google.it/search*
// @match        *://www.google.es/search*
// @match        *://www.google.nl/search*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(() => {
  "use strict";

  // true  = immer zum Tab „Web“ wechseln (udm=14, garantiert ohne KI)
  // false = nur KI-Übersicht und KI-Modus ausblenden
  const WEB_ONLY = false;

  const AI_HEADINGS = new Set([
    "ai overview", "ai overviews", "übersicht mit ki", "ki-übersicht",
    "aperçu ia", "aperçu généré par l'ia", "aperçu généré par l’ia",
    "resumen de ia", "resumen creado con ia", "vista creada con ia",
    "panoramica ai", "panoramica ia", "ai-overzicht",
  ]);
  const STOP_IDS = new Set(["rso", "center_col", "rcnt", "search", "main", "cnt"]);

  if (WEB_ONLY) {
    const url = new URL(location.href);
    const p = url.searchParams;
    if (url.pathname === "/search" && p.has("q") && !p.has("udm") && !p.has("tbm")) {
      p.set("udm", "14");
      location.replace(url.toString());
      return;
    }
  }

  const style = document.createElement("style");
  style.textContent = `
    [data-noai-hidden], a[href*="udm=50"],
    [role="listitem"]:has(> a[href*="udm=50"]),
    [role="listitem"]:has(> div > a[href*="udm=50"]) { display: none !important; }`;
  // At document-start the <html> element may not exist yet.
  function addStyle() {
    if (style.isConnected) return;
    const target = document.head || document.documentElement;
    if (target) target.appendChild(style);
  }
  addStyle();

  const titles = (el) => el.querySelectorAll("a h3").length;

  function findAiBlock(heading) {
    let block = heading;
    const own = titles(heading);
    while (block.parentElement) {
      const parent = block.parentElement;
      if (parent === document.body || STOP_IDS.has(parent.id)) break;
      if (titles(parent) > own) break;
      block = parent;
    }
    return block;
  }

  function scan() {
    const scope = document.getElementById("rcnt") || document.body;
    if (!scope) return;
    for (const el of scope.querySelectorAll('h1, h2, h3, [role="heading"], strong, span, div[aria-level]')) {
      const text = el.textContent;
      if (!text || text.length > 40 || el.closest("[data-noai-hidden], a[href]")) continue;
      if (AI_HEADINGS.has(text.trim().toLowerCase())) {
        findAiBlock(el).setAttribute("data-noai-hidden", "");
      }
    }
  }

  let scheduled = false;
  new MutationObserver(() => {
    addStyle();
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => { scheduled = false; scan(); });
  }).observe(document, { childList: true, subtree: true });
  document.addEventListener("DOMContentLoaded", scan, { once: true });
})();
