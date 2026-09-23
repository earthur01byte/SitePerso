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
        copyBtn.textContent = "Copié !";
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

  // --- LOT 10 : section « Mes posts LinkedIn » (productions.html) ---
  // Filtre par categorie (.lp-chip) + depliage du texte ligne par ligne.
  const lpGrille = document.querySelector("[data-lp-grid]");
  if (lpGrille) {
    const LIGNES_BASE = 2;
    const LIGNES_PAS = 3;
    const cartes = Array.prototype.slice.call(lpGrille.querySelectorAll(".lp-card"));
    const puces = Array.prototype.slice.call(document.querySelectorAll("[data-lp-filter]"));
    const compteur = document.querySelector("[data-lp-compteur]");

    const appliquer = (categorie) => {
      let visibles = 0;
      cartes.forEach((carte) => {
        const cats = (carte.getAttribute("data-lp-cats") || "").split(/\s+/);
        const garder = categorie === "tous" || cats.indexOf(categorie) !== -1;
        carte.hidden = !garder;
        if (garder) visibles += 1;
      });
      puces.forEach((puce) => {
        const actif = puce.getAttribute("data-lp-filter") === categorie;
        puce.setAttribute("aria-pressed", actif ? "true" : "false");
      });
      if (compteur) compteur.textContent = String(visibles);
      // Repere expose pour les controles automatises.
      document.documentElement.setAttribute("data-lp-filtre", categorie);
      document.documentElement.setAttribute("data-lp-visibles", String(visibles));
    };

    puces.forEach((puce) => {
      puce.addEventListener("click", () => appliquer(puce.getAttribute("data-lp-filter")));
    });

    cartes.forEach((carte) => {
      const texte = carte.querySelector(".lp-card-text");
      const plus = carte.querySelector("[data-lp-more]");
      const moins = carte.querySelector("[data-lp-moins]");
      if (!texte || !plus) return;
      let lignes = LIGNES_BASE;

      const maj = () => {
        texte.style.setProperty("--lp-lignes", String(lignes));
        const complet = texte.scrollHeight <= texte.clientHeight + 2;
        texte.classList.toggle("lp-complet", complet);
        plus.hidden = complet;
        plus.setAttribute("aria-expanded", lignes > LIGNES_BASE ? "true" : "false");
        if (moins) moins.hidden = lignes === LIGNES_BASE;
        carte.setAttribute("data-lp-lignes", String(lignes));
      };

      plus.addEventListener("click", () => {
        lignes += LIGNES_PAS;
        maj();
      });
      if (moins) {
        moins.addEventListener("click", () => {
          lignes = LIGNES_BASE;
          maj();
        });
      }
      maj();
    });

    // Lien partageable : productions.html?cat=energie
    const demandee = new URLSearchParams(window.location.search).get("cat");
    const connue = puces.some((p) => p.getAttribute("data-lp-filter") === demandee);
    appliquer(connue ? demandee : "tous");
  }

})();
