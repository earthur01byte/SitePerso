(() => {
  const navToggle = document.querySelector("[data-nav-toggle]");
  const nav = document.querySelector("[data-nav]");

  if (navToggle && nav) {
    const setOpen = (open) => {
      nav.dataset.open = open ? "true" : "false";
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    };

    setOpen(false);

    navToggle.addEventListener("click", () => {
      const nextOpen = nav.dataset.open !== "true";
      setOpen(nextOpen);
    });

    // Close menu after navigation (mobile)
    nav.addEventListener("click", (e) => {
      const a = e.target.closest("a");
      if (!a) return;
      setOpen(false);
    });

    // Close on Escape
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setOpen(false);
    });

    // Keep state sane on resize
    window.addEventListener("resize", () => {
      if (window.matchMedia("(min-width: 860px)").matches) setOpen(false);
    });
  }

  const copyBtn = document.querySelector("[data-copy-email]");
  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      const email = copyBtn.getAttribute("data-email");
      if (!email) return;
      try {
        await navigator.clipboard.writeText(email);
        const prev = copyBtn.textContent;
        copyBtn.textContent = "Copied";
        window.setTimeout(() => (copyBtn.textContent = prev), 1200);
      } catch {
        // If clipboard is blocked, fall back to selecting text in the UI.
        const fallback = document.querySelector("[data-email-text]");
        if (fallback) {
          const range = document.createRange();
          range.selectNodeContents(fallback);
          const sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
        }
      }
    });
  }

  const header = document.querySelector(".site-header");
  if (header) {
    const trigger = window.innerHeight * 0.2;
    const onScroll = () => {
      const visible = window.scrollY >= trigger;
      header.classList.toggle("is-visible", visible);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }
})();
