(function enableUniversalTableScrolling() {
  const wrapperSelector = [
    ".table-container",
    ".monetization-table-container",
    ".ajx-table-scroll",
    ".table-box",
    ".medlens-table-scroll",
    ".preview-table-scroll",
    ".app-table-scroll",
  ].join(",");

  const ensureWrapper = (table) => {
    const existing = table.closest(wrapperSelector);
    if (existing instanceof HTMLElement) return existing;

    const wrapper = document.createElement("div");
    wrapper.className = "app-table-scroll";
    table.parentNode?.insertBefore(wrapper, table);
    wrapper.appendChild(table);
    return wrapper;
  };

  const bind = () => {
    document.querySelectorAll("table").forEach((table) => {
      if (table instanceof HTMLElement) ensureWrapper(table);
    });

    if (document.documentElement.dataset.universalTableWheelBound === "true") return;
    document.documentElement.dataset.universalTableWheelBound = "true";

    document.addEventListener(
      "wheel",
      (event) => {
        const target = event.target instanceof Element ? event.target : null;
        const container = target?.closest(wrapperSelector);
        if (!(container instanceof HTMLElement)) return;

        const horizontalDelta = event.deltaX || (event.shiftKey ? event.deltaY : 0);
        if (!horizontalDelta) return;

        const maxScrollLeft = container.scrollWidth - container.clientWidth;
        if (maxScrollLeft <= 0) return;

        const nextScrollLeft = Math.max(
          0,
          Math.min(maxScrollLeft, container.scrollLeft + horizontalDelta),
        );
        if (nextScrollLeft === container.scrollLeft) return;

        container.scrollLeft = nextScrollLeft;
        event.preventDefault();
      },
      { passive: false },
    );
  };

  const style = document.createElement("style");
  style.textContent = `
    .app-table-scroll {
      width: 100%;
      max-width: 100%;
      overflow-x: scroll !important;
      overflow-y: visible;
      overscroll-behavior-x: contain;
      touch-action: pan-x pan-y;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: thin !important;
      scrollbar-color: rgba(120, 145, 165, .72) transparent !important;
    }
    .app-table-scroll > table { max-width: none; }
    .table-container,
    .monetization-table-container,
    .ajx-table-scroll,
    .table-box,
    .medlens-table-scroll,
    .preview-table-scroll {
      overflow-x: scroll !important;
      scrollbar-width: thin !important;
      scrollbar-color: rgba(120, 145, 165, .72) transparent !important;
    }
    .app-table-scroll::-webkit-scrollbar,
    .table-container::-webkit-scrollbar,
    .monetization-table-container::-webkit-scrollbar,
    .ajx-table-scroll::-webkit-scrollbar,
    .table-box::-webkit-scrollbar,
    .medlens-table-scroll::-webkit-scrollbar,
    .preview-table-scroll::-webkit-scrollbar {
      width: 4px !important;
      height: 4px !important;
      display: block !important;
    }
    .app-table-scroll::-webkit-scrollbar-track,
    .table-container::-webkit-scrollbar-track,
    .monetization-table-container::-webkit-scrollbar-track,
    .ajx-table-scroll::-webkit-scrollbar-track,
    .table-box::-webkit-scrollbar-track,
    .medlens-table-scroll::-webkit-scrollbar-track,
    .preview-table-scroll::-webkit-scrollbar-track {
      background: transparent !important;
    }
    .app-table-scroll::-webkit-scrollbar-thumb,
    .table-container::-webkit-scrollbar-thumb,
    .monetization-table-container::-webkit-scrollbar-thumb,
    .ajx-table-scroll::-webkit-scrollbar-thumb,
    .table-box::-webkit-scrollbar-thumb,
    .medlens-table-scroll::-webkit-scrollbar-thumb,
    .preview-table-scroll::-webkit-scrollbar-thumb {
      background: rgba(120, 145, 165, .72) !important;
      border-radius: 999px;
    }
  `;
  document.head.appendChild(style);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bind, { once: true });
  } else {
    bind();
  }

})();
