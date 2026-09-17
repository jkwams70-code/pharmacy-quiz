(function () {
  "use strict";

  const STORAGE_KEY = "quizUiPrefsV1";
  const TEXT_SCALES = {
    "very-small": 0.875,
    small: 0.9375,
    default: 1,
    medium: 1.0625,
    large: 1.125,
  };
  const originalFontSizes = new WeakMap();
  let applyQueued = false;

  function getTextScale() {
    try {
      const prefs = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "{}");
      return TEXT_SCALES[String(prefs?.textSize || "default").toLowerCase()] || 1;
    } catch {
      return 1;
    }
  }

  function shouldSkip(element) {
    return element.matches(
      "script, style, template, noscript, svg, path, circle, rect, line, polyline, polygon, use, [data-ajix-font-size-ignore]",
    );
  }

  function applyTextSize() {
    applyQueued = false;
    const scale = getTextScale();
    document.documentElement.dataset.ajixTextSizeScale = String(scale);
    document.documentElement.style.setProperty("--ajix-text-scale", String(scale));

    if (!document.body) return;

    [document.body, ...document.body.querySelectorAll("*")].forEach((element) => {
      if (!(element instanceof HTMLElement) || shouldSkip(element)) return;

      const computed = window.getComputedStyle(element);
      if (!originalFontSizes.has(element)) {
        const baseSize = Number.parseFloat(computed.fontSize);
        if (!Number.isFinite(baseSize) || baseSize <= 0) return;
        originalFontSizes.set(element, baseSize);
      }

      const baseSize = originalFontSizes.get(element);
      if (scale === 1) {
        element.style.removeProperty("font-size");
      } else {
        element.style.setProperty("font-size", String(baseSize * scale) + "px");
      }
    });
  }

  function queueApply() {
    if (applyQueued) return;
    applyQueued = true;
    window.requestAnimationFrame(applyTextSize);
  }

  window.AjixUiPreferences = {
    applyTextSize,
    getTextScale,
  };

  window.addEventListener("storage", (event) => {
    if (event.key === STORAGE_KEY) queueApply();
  });

  document.addEventListener("DOMContentLoaded", () => {
    applyTextSize();

    const observer = new MutationObserver((mutations) => {
      if (mutations.some((mutation) => mutation.addedNodes.length > 0)) {
        queueApply();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  });
})();