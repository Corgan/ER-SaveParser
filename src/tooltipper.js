class Tooltipper {
    constructor() {
      this.clickTooltip = (e) => {
        const el = e.target?.closest("[tooltip]");
        if (!(el instanceof HTMLElement) || el?.getAttribute("tooltip") === null) {
          return;
        }
        if (e instanceof KeyboardEvent) {
          if (e.key !== " ") {
            return;
          }
        }
        if (!el.dataset.tooltipUid) {
          el.dataset.tooltipUid = uuid();
        }
        const tooltip = document.body.querySelector(`tooltip[uid="${el.dataset.tooltipUid}"]`);
        if (tooltip) {
          tooltip?.remove();
        }
      };
      this.showTooltip = (e) => {
        const el = e.target;
        if (!(el instanceof HTMLElement) || el?.getAttribute("tooltip") === null || typeof TouchEvent !== "undefined" && e instanceof TouchEvent || e instanceof FocusEvent && this.deviceType !== 1) {
          return;
        }
        let text = el.getAttribute("tooltip");
        if (!text.length) {
          text = el.getAttribute("aria-label");
        }
        if (!text.length) {
          text = el.getAttribute("title");
        }
        if (!text.length) {
          console.warn(`Tooltip could not be created -- missing aria-label, tooltip, or title attribute.`);
          return;
        }
        if (!el.dataset.tooltipUid) {
          el.dataset.tooltipUid = uuid();
        }
        let tooltip = document.body.querySelector(`tooltip`) || document.createElement("tooltip");
        tooltip.setAttribute("uid", el.dataset.tooltipUid);
        tooltip.innerHTML = text;
        tooltip.setAttribute("role", "tooltip");
        tooltip.style.position = "absolute";
        tooltip.style.zIndex = "999999";
        tooltip.style.opacity = "0";
        if (!tooltip.isConnected) {
          document.body.appendChild(tooltip);
        }
        this.placeTooltip(el, tooltip);
        tooltip.classList.add("visible");
        tooltip.style.opacity = "1";
        if (!(el.dataset.tooltipUid in this.trackedElements)) {
          this.trackedElements[el.dataset.tooltipUid] = null;
        }
      };
      this.hideTooltip = (e) => {
        const el = e.target;
        if (!(el instanceof HTMLElement) || el?.getAttribute("tooltip") === null || !el?.dataset?.tooltipUid) {
          return;
        }
        const tooltip = document.body.querySelector(`tooltip[uid="${el.dataset.tooltipUid}"]`);
        if (tooltip) {
          tooltip?.remove();
        }
      };
      this.trackedElements = {};
      this.deviceType = 1;
      document.addEventListener("mouseenter", this.showTooltip, { capture: true, passive: true });
      document.addEventListener("focus", this.showTooltip, { capture: true, passive: true });
      document.addEventListener("mouseleave", this.hideTooltip, { capture: true, passive: true });
      document.addEventListener("blur", this.hideTooltip, { capture: true, passive: true });
      document.addEventListener("click", this.clickTooltip, { capture: true, passive: true });
      document.addEventListener("keypress", this.clickTooltip, { capture: true, passive: true });
      document.addEventListener("touchstart", () => {
        this.deviceType = 2;
      }, { capture: true, passive: true });
      document.addEventListener("mousemove", () => {
        this.deviceType = 1;
      }, { capture: true, passive: true });
      this.tick();
    }
    tick() {
      for (const uid in this.trackedElements) {
        const el = document.body.querySelector(`[data-tooltip-uid="${uid}"]`);
        const tooltip = document.body.querySelector(`tooltip[uid="${uid}"]`);
        if (el == null) {
          delete this.trackedElements[uid];
          if (tooltip) {
            tooltip.remove();
          }
        } else {
          let text = el.getAttribute("tooltip");
          if (!text.length) {
            text = el.getAttribute("aria-label");
          }
          if (!text.length) {
            text = el.getAttribute("title");
          }
          if(tooltip !== null) {
            tooltip.innerHTML = text;
            this.placeTooltip(el, tooltip);
          }
        }
      }
      window.requestAnimationFrame(this.tick.bind(this));
    }
    placeTooltip(el, tooltip) {
      const elBounds = el.getBoundingClientRect();
      const tipBounds = tooltip.getBoundingClientRect();

      let tooltipLeft = elBounds.left + (elBounds.width / 2) - (tipBounds.width / 2);
      if (tooltipLeft + tipBounds.width > document.documentElement.clientWidth - 4) {
        tooltipLeft -= tooltipLeft + tipBounds.width - document.documentElement.clientWidth + 4;
      } else if (tooltipLeft < 4) {
        tooltipLeft = 4;
      }
      tooltipLeft += window.scrollX;

      let tooltipTop = elBounds.top - tipBounds.height + window.scrollY;
      if (tooltipTop - window.scrollY < 4)
        tooltipTop = tooltipTop + elBounds.height + tipBounds.height;

      tooltip.style.top = `${tooltipTop}px`;
      tooltip.style.left = `${tooltipLeft}px`;
    }
  }
  function uuid() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16));
  }
  const tooltipper = new Tooltipper();
  export {
    tooltipper as default
  };