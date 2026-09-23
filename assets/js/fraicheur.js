(() => {
  // --- LOT 12 : page « Pour un droit à la fraîcheur » -------------
  // Au defilement, la carte de Paris change de couches, le compteur de
  // stress thermique se met a jour et le panneau bascule d'un visuel a
  // l'autre (carte, schema de clim reversible, arbre, planete).
  // Sans JavaScript, chaque etape reste lisible dans sa colonne et le
  // panneau affiche l'etat de depart : rien n'est cache.
  const recit = document.querySelector("[data-fr-recit]");
  const panneau = document.querySelector("[data-fr-panneau]");
  const etapes = Array.prototype.slice.call(document.querySelectorAll("[data-fr-etape]"));
  if (!recit || !panneau || !etapes.length) return;

  const valeur = document.querySelector("[data-fr-compteur-valeur]");
  const sujet = document.querySelector("[data-fr-compteur-sujet]");
  const terres = document.querySelector(".fr-globe-terres");
  const finale = document.querySelector(".fr-etape-finale");
  const doux = window.matchMedia("(prefers-reduced-motion: reduce)");
  let courante = -1;
  let prevu = 0;

  // Le script tourne : on peut alors attenuer les etapes non actives (jamais
  // l'inverse, pour que la page reste lisible sans JavaScript).
  recit.classList.add("fr-recit-anime");

  const legendeDe = (vue) => {
    const boite = panneau.querySelector('[data-fr-vue-' + vue + "]");
    return boite ? boite.querySelector("[data-fr-legende]") : null;
  };

  const activer = (etape, index) => {
    const vue = etape.getAttribute("data-fr-vue") || "carte";
    const etat = etape.getAttribute("data-fr-etat") || "base";
    panneau.setAttribute("data-fr-vue", vue);
    panneau.setAttribute("data-fr-etat", etat);
    // Attention : ne pas nommer cet attribut data-fr-etape, il entrerait en
    // collision avec les sections du recit (selecteur [data-fr-etape]).
    panneau.setAttribute("data-fr-etape-active", String(index + 1));
    etapes.forEach((e) => e.classList.remove("fr-etape-active"));
    etape.classList.add("fr-etape-active");

    const mesure = etape.getAttribute("data-fr-mesure");
    const sousTitre = etape.getAttribute("data-fr-sujet");
    if (valeur && mesure) valeur.textContent = mesure;
    if (sujet && sousTitre) sujet.textContent = sousTitre;

    // La legende suit l'etape (titre + texte) quand elle en fournit une.
    const legende = legendeDe(vue);
    if (legende) {
      const titre = etape.getAttribute("data-fr-legende-titre");
      const texte = etape.getAttribute("data-fr-legende-texte");
      const noeudTitre = legende.querySelector(".fr-legende-titre");
      const noeudTexte = legende.querySelector("span:last-of-type");
      if (titre && noeudTitre) noeudTitre.textContent = titre;
      if (texte && noeudTexte) noeudTexte.textContent = texte;
    }

    // Reperes exposes pour les controles automatises.
    document.documentElement.setAttribute("data-fr-etat", etat);
    document.documentElement.setAttribute("data-fr-vue", vue);
    document.documentElement.setAttribute("data-fr-etape-courante", String(index + 1));
  };

  const etapeCourante = () => {
    const ligne = window.innerHeight * 0.55;
    let trouve = 0;
    etapes.forEach((etape, i) => {
      if (etape.getBoundingClientRect().top <= ligne) trouve = i;
    });
    return trouve;
  };

  // Activation d'une etape (idempotente) : appelee par l'ecoute du
  // defilement et par l'IntersectionObserver.
  const activerSiBesoin = (index) => {
    if (index === courante || index < 0 || index >= etapes.length) return;
    courante = index;
    activer(etapes[index], index);
    tourner();
  };

  // La planete tourne au rythme du defilement, dans la derniere etape.
  const tourner = () => {
    if (!terres || !finale) return;
    if (doux.matches) {
      terres.style.transform = "";
      return;
    }
    const r = finale.getBoundingClientRect();
    const course = Math.max(1, r.height + window.innerHeight * 0.6);
    const avance = Math.min(1, Math.max(0, (window.innerHeight * 0.7 - r.top) / course));
    terres.style.transform = "rotate(" + (avance * 330).toFixed(1) + "deg)";
  };

  const reagir = () => {
    prevu = 0;
    activerSiBesoin(etapeCourante());
    tourner();
  };

  const planifier = () => {
    // Throttle par minuterie plutot que par requestAnimationFrame : le rendu
    // est identique a l'oeil, et l'etat suit le defilement meme quand le
    // navigateur ne produit pas d'image (controles automatises, onglet caché).
    if (prevu) return;
    prevu = window.setTimeout(() => {
      prevu = 0;
      reagir();
    }, 16);
  };

  window.addEventListener("scroll", planifier, { passive: true });
  window.addEventListener("resize", planifier);
  if (doux.addEventListener) doux.addEventListener("change", planifier);

  // Filet de securite : l'IntersectionObserver repose sur la mise en page et
  // non sur les evenements de defilement, qui peuvent manquer (navigateur
  // sans rendu d'image, onglet en arriere-plan, defilement instantane). La
  // bande d'observation (5 % de la hauteur, sous le panneau) ne contient
  // qu'une etape a la fois : les etapes sont bien plus hautes que la bande.
  if ("IntersectionObserver" in window) {
    const observateur = new IntersectionObserver((entrees) => {
      entrees.forEach((entree) => {
        if (!entree.isIntersecting) return;
        activerSiBesoin(etapes.indexOf(entree.target));
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
    etapes.forEach((etape) => observateur.observe(etape));
  }

  reagir();
})();
