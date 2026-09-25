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

  // --- LOT 10/11 : section « Mes posts LinkedIn » (ressources.html) ---
  // Filtre par categorie (.lp-chip), affichage progressif par 2 lignes de
  // posts (6 au depart, +2 lignes par clic sur « Voir plus de posts », retour
  // a 6 avec « Voir moins de posts ») et depliage du texte de chaque carte.
  const lpGrille = document.querySelector("[data-lp-grid]");
  if (lpGrille) {
    const LIGNES_BASE = 2;
    const POSTS_BASE = 6;
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
    let postsAffiches = POSTS_BASE;
    let apercu = 0;
    let rangeeApercu = 0;
    let minuterie = 0;

    // La barre de boutons fait partie de la grille : elle occupe une bande de
    // lignes entiere, ce qui permet de la superposer a la ligne d'apercu.
    if (zonePlus && zonePlus.parentElement !== lpGrille) {
      lpGrille.appendChild(zonePlus);
    }

    const compterColonnes = () => {
      const tpl = window.getComputedStyle(lpGrille).gridTemplateColumns || "";
      const n = tpl.split(" ").filter((v) => v && v !== "none").length;
      return Math.max(1, n);
    };

    const appliquer = () => {
      const colonnes = compterColonnes();
      let correspondants = 0;
      let affiches = 0;
      cartes.forEach((carte) => {
        carte.style.gridRowStart = "";
        carte.style.gridColumnStart = "";
        carte.classList.remove("lp-apercu");
        carte.removeAttribute("aria-hidden");
        carte.removeAttribute("inert");
        const cats = (carte.getAttribute("data-lp-cats") || "").split(/\s+/);
        const correspond = categorie === "tous" || cats.indexOf(categorie) !== -1;
        carte.hidden = !correspond;
        if (!correspond) {
          carte.classList.remove("lp-planque");
          return;
        }
        correspondants += 1;
        const planque = correspondants > postsAffiches;
        carte.classList.toggle("lp-planque", planque);
        if (!planque) affiches += 1;
      });

      // La ligne de posts suivante reste visible en transparence derriere la
      // barre de boutons : elle donne envie de cliquer sans etre utilisable
      // (non cliquable, non annoncee aux lecteurs d'ecran).
      rangeeApercu = Math.ceil(affiches / colonnes) + 1;
      const ligne = cartes
        .filter((c) => !c.hidden && c.classList.contains("lp-planque"))
        .slice(0, colonnes);
      ligne.forEach((carte, i) => {
        carte.classList.remove("lp-planque");
        carte.classList.add("lp-apercu");
        carte.setAttribute("aria-hidden", "true");
        carte.setAttribute("inert", "");
        carte.style.gridRowStart = String(rangeeApercu);
        carte.style.gridColumnStart = String(i + 1);
      });
      apercu = ligne.length;

      puces.forEach((puce) => {
        const actif = puce.getAttribute("data-lp-filter") === categorie;
        puce.setAttribute("aria-pressed", actif ? "true" : "false");
      });

      const reste = correspondants - affiches;
      if (compteur) compteur.textContent = String(affiches);
      if (compteurTotal) compteurTotal.textContent = String(correspondants);
      if (zoneTotal) zoneTotal.hidden = reste === 0;
      if (zonePlus) {
        zonePlus.hidden = reste <= 0 && postsAffiches <= POSTS_BASE;
        // Toujours sous les posts affiches, donc sur la ligne d'apercu quand
        // il y en a une.
        zonePlus.style.gridColumn = "1 / -1";
        zonePlus.style.gridRowStart = String(rangeeApercu);
      }
      if (boutonPlus) {
        boutonPlus.hidden = reste <= 0;
        boutonPlus.setAttribute("aria-expanded", reste <= 0 ? "true" : "false");
        boutonPlus.textContent = "Voir plus de posts";
      }
      if (boutonMoins) boutonMoins.hidden = postsAffiches <= POSTS_BASE;

      // Reperes exposes pour les controles automatises.
      document.documentElement.setAttribute("data-lp-filtre", categorie);
      document.documentElement.setAttribute("data-lp-visibles", String(affiches));
      document.documentElement.setAttribute("data-lp-correspondants", String(correspondants));
      document.documentElement.setAttribute("data-lp-apercu", String(apercu));
      document.documentElement.setAttribute("data-lp-pas", String(2 * colonnes));
      // Les cartes qui viennent d'apparaitre peuvent maintenant etre mesurees.
      mesures.forEach((mesurer) => mesurer());
    };

    puces.forEach((puce) => {
      puce.addEventListener("click", () => {
        categorie = puce.getAttribute("data-lp-filter");
        postsAffiches = POSTS_BASE; // un nouveau theme repart des 6 premiers posts
        appliquer();
      });
    });

    if (boutonPlus) {
      boutonPlus.addEventListener("click", () => {
        postsAffiches += 2 * compterColonnes(); // deux lignes de plus
        appliquer();
      });
    }
    if (boutonMoins) {
      boutonMoins.addEventListener("click", () => {
        postsAffiches = POSTS_BASE;
        appliquer();
        if (zonePlus) zonePlus.scrollIntoView({ block: "center" });
      });
    }

    // Le nombre de colonnes change avec la largeur : on relit la grille.
    window.addEventListener("resize", () => {
      window.clearTimeout(minuterie);
      minuterie = window.setTimeout(appliquer, 120);
    });

    cartes.forEach((carte) => {
      const texte = carte.querySelector(".lp-card-text");
      const plus = carte.querySelector("[data-lp-more]");
      const moins = carte.querySelector("[data-lp-moins]");
      if (!texte || !plus) return;
      let ouvert = false;

      const maj = () => {
        // Deplie : plus aucune limite de hauteur, tout le post est lisible.
        texte.classList.toggle("lp-ouvert", ouvert);
        texte.style.setProperty("--lp-lignes", String(LIGNES_BASE));
        carte.setAttribute("data-lp-ouvert", ouvert ? "true" : "false");
        // Carte masquee (filtre ou limite de posts) : aucune mesure fiable,
        // on garde l'etat courant plutot que de tout marquer « complet ».
        if (!carte.offsetHeight) return;
        const complet = texte.scrollHeight <= texte.clientHeight + 2;
        texte.classList.toggle("lp-complet", complet && !ouvert);
        plus.hidden = ouvert || complet;
        plus.setAttribute("aria-expanded", ouvert ? "true" : "false");
        if (moins) moins.hidden = !ouvert;
      };

      plus.addEventListener("click", () => {
        ouvert = true;
        maj();
      });
      if (moins) {
        moins.addEventListener("click", () => {
          ouvert = false;
          maj();
        });
      }
      mesures.push(maj);
      maj();
    });

    // Lien partageable : ressources.html?cat=energie
    const demandee = new URLSearchParams(window.location.search).get("cat");
    const connue = puces.some((p) => p.getAttribute("data-lp-filter") === demandee);
    if (connue) categorie = demandee;
    appliquer();
  }

})();
