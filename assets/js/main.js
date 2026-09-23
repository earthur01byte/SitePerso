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
  // Filtre par categorie (.lp-chip), « Voir plus / Voir moins de posts »
  // (6 posts visibles au depart) et depliage du texte ligne par ligne.
  const lpGrille = document.querySelector("[data-lp-grid]");
  if (lpGrille) {
    const LIGNES_BASE = 2;
    const LIGNES_PAS = 3;
    const POSTS_VISIBLES = 6;
    const cartes = Array.prototype.slice.call(lpGrille.querySelectorAll(".lp-card"));
    const puces = Array.prototype.slice.call(document.querySelectorAll("[data-lp-filter]"));
    const compteur = document.querySelector("[data-lp-compteur]");
    const compteurTotal = document.querySelector("[data-lp-total]");
    const zoneTotal = document.querySelector("[data-lp-total-zone]");
    const zonePlus = document.querySelector("[data-lp-plus-zone]");
    const boutonPlus = document.querySelector("[data-lp-plus]");
    const boutonMoins = document.querySelector("[data-lp-plus-moins]");
    const mesures = [];
    let categorie = "tous";
    let deplie = false;

    const appliquer = () => {
      let correspondants = 0;
      let affiches = 0;
      cartes.forEach((carte) => {
        const cats = (carte.getAttribute("data-lp-cats") || "").split(/\s+/);
        const correspond = categorie === "tous" || cats.indexOf(categorie) !== -1;
        carte.hidden = !correspond;
        if (!correspond) {
          carte.classList.remove("lp-planque");
          return;
        }
        correspondants += 1;
        const planque = !deplie && correspondants > POSTS_VISIBLES;
        carte.classList.toggle("lp-planque", planque);
        if (!planque) affiches += 1;
      });
      puces.forEach((puce) => {
        const actif = puce.getAttribute("data-lp-filter") === categorie;
        puce.setAttribute("aria-pressed", actif ? "true" : "false");
      });
      const reste = correspondants - affiches;
      if (compteur) compteur.textContent = String(affiches);
      if (compteurTotal) compteurTotal.textContent = String(correspondants);
      if (zoneTotal) zoneTotal.hidden = affiches === correspondants;
      if (zonePlus) zonePlus.hidden = correspondants <= POSTS_VISIBLES;
      if (boutonPlus) {
        boutonPlus.hidden = deplie || reste <= 0;
        boutonPlus.setAttribute("aria-expanded", deplie ? "true" : "false");
        boutonPlus.textContent = reste > 1
          ? "Voir plus de posts (il en reste " + reste + ")"
          : "Voir plus de posts (il en reste 1)";
      }
      if (boutonMoins) boutonMoins.hidden = !deplie;
      // Reperes exposes pour les controles automatises.
      document.documentElement.setAttribute("data-lp-filtre", categorie);
      document.documentElement.setAttribute("data-lp-visibles", String(affiches));
      document.documentElement.setAttribute("data-lp-correspondants", String(correspondants));
      // Les cartes qui viennent d'apparaitre peuvent maintenant etre mesurees.
      mesures.forEach((mesurer) => mesurer());
    };

    puces.forEach((puce) => {
      puce.addEventListener("click", () => {
        categorie = puce.getAttribute("data-lp-filter");
        deplie = false; // un nouveau theme repart des 6 premiers posts
        appliquer();
      });
    });

    if (boutonPlus) {
      boutonPlus.addEventListener("click", () => {
        deplie = true;
        appliquer();
      });
    }
    if (boutonMoins) {
      boutonMoins.addEventListener("click", () => {
        deplie = false;
        appliquer();
        if (zonePlus) zonePlus.scrollIntoView({ block: "center" });
      });
    }

    cartes.forEach((carte) => {
      const texte = carte.querySelector(".lp-card-text");
      const plus = carte.querySelector("[data-lp-more]");
      const moins = carte.querySelector("[data-lp-moins]");
      if (!texte || !plus) return;
      let lignes = LIGNES_BASE;

      const maj = () => {
        texte.style.setProperty("--lp-lignes", String(lignes));
        // Carte masquee (filtre ou limite de 6 posts) : aucune mesure fiable,
        // on garde l'etat courant plutot que de tout marquer « complet ».
        if (!carte.offsetHeight) return;
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
      mesures.push(maj);
      maj();
    });

    // Lien partageable : productions.html?cat=energie
    const demandee = new URLSearchParams(window.location.search).get("cat");
    const connue = puces.some((p) => p.getAttribute("data-lp-filter") === demandee);
    if (connue) categorie = demandee;
    appliquer();
  }

})();
