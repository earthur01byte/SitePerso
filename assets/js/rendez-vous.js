/**
 * Fenetre de prise de rendez-vous du site (LOT 32).
 *
 * Elle lit les creneaux libres de l'agenda (creneaux.php), laisse le visiteur
 * choisir le jour puis l'heure au quart d'heure, et reserve (reserver.php). Le
 * rendez-vous s'inscrit dans mon agenda avec un lien Google Meet, et la
 * confirmation part par email, le fichier .ics en piece jointe.
 *
 * Trois etats se suivent dans la meme fenetre : le creneau, les coordonnees, la
 * confirmation. Aucun compte n'est demande au visiteur, et la liste est relue
 * avant chaque choix long : un creneau pris entre temps est donc refus par le
 * serveur, qui le dit, et la liste se rafraichit.
 */
(() => {
  "use strict";

  const ADRESSE = "arthur@arthurdelassus.com";
  const JOURS_AFFICHES = 10;     // jours demandes d'un coup a l'API
  const PEREMPTION = 120000;     // au-dela, la liste des creneaux est relue

  const modale = document.getElementById("modaleRendezVous");
  if (!modale) return;

  const racine = modale.querySelector("[data-rdv]");
  const api = (racine.getAttribute("data-api") || "").replace(/\/+$/, "");
  const boite = modale.querySelector(".modale-boite");
  const statut = racine.querySelector("[data-rdv-statut]");
  const blocJours = racine.querySelector("[data-rdv-jours]");
  const blocHeures = racine.querySelector("[data-rdv-heures]");
  const zoneHeures = racine.querySelector("[data-rdv-heures-zone]");
  const formulaire = racine.querySelector("[data-rdv-form]");
  const resume = racine.querySelector("[data-rdv-resume]");
  const blocConfirme = racine.querySelector("[data-rdv-confirme]");
  const boutonChanger = racine.querySelector("[data-rdv-changer]");
  const boutonSecours = racine.querySelector("[data-rdv-secours]");
  const boutonEnvoi = formulaire.querySelector('button[type="submit"]');

  let groupes = [];          // les jours proposes, tels que rendus par l'API
  let jourChoisi = "";
  let creneauChoisi = null;
  let lueLe = 0;             // date de la derniere lecture des creneaux
  let declencheur = null;    // bouton qui a ouvert la fenetre

  const dire = (message, genre) => {
    if (!statut) return;
    statut.textContent = message || "";
    statut.classList.remove("aide-ok", "aide-souci");
    if (genre) statut.classList.add(genre);
  };

  /** Horodatage en secondes, comme le controle anti-robot du serveur. */
  const majDepart = () => {
    const champ = formulaire.querySelector('[name="depart"]');
    if (champ) champ.value = String(Math.floor(Date.now() / 1000));
  };

  /** « 2026-10-06 » -> « Mardi 6 octobre », sans decalage de fuseau. */
  const joliJour = (jour) => {
    const [annee, mois, numero] = jour.split("-").map(Number);
    const date = new Date(annee, mois - 1, numero, 12, 0, 0);
    const texte = date.toLocaleDateString("fr-FR",
      { weekday: "long", day: "numeric", month: "long" });
    return texte.charAt(0).toUpperCase() + texte.slice(1);
  };

  const joliCreneau = (jour, creneau) =>
    joliJour(jour) + ", de " + creneau.heure + " à " + creneau.finHeure;

  /** Un bouton de jour : le nom du jour, et le nombre de creneaux libres. */
  const boutonJour = (groupe) => {
    const bouton = document.createElement("button");
    bouton.type = "button";
    bouton.className = "rdv-jour";
    bouton.setAttribute("aria-pressed", "false");
    bouton.dataset.jour = groupe.jour;

    const titre = document.createElement("strong");
    titre.textContent = joliJour(groupe.jour);
    const compte = document.createElement("small");
    compte.textContent = groupe.creneaux.length === 1
      ? "1 créneau libre"
      : groupe.creneaux.length + " créneaux libres";
    bouton.append(titre, compte);
    bouton.addEventListener("click", () => choisirJour(groupe.jour, bouton));
    return bouton;
  };

  /** Une pastille d'heure. */
  const boutonHeure = (creneau) => {
    const bouton = document.createElement("button");
    bouton.type = "button";
    bouton.className = "rdv-heure";
    bouton.setAttribute("aria-pressed", "false");
    bouton.textContent = creneau.heure;
    bouton.title = "Rendez-vous de " + creneau.heure + " à " + creneau.finHeure;
    bouton.addEventListener("click", () => choisirCreneau(creneau, bouton));
    return bouton;
  };

  /** Un seul element actif a la fois, dans une liste de boutons. */
  const marquer = (conteneur, actif) => {
    Array.from(conteneur.children).forEach((enfant) => {
      enfant.setAttribute("aria-pressed", enfant === actif ? "true" : "false");
    });
  };

  const vider = (conteneur) => {
    while (conteneur.firstChild) conteneur.removeChild(conteneur.firstChild);
  };

  // --- Le choix du creneau ---------------------------------------------------

  /** Relit les creneaux libres. @param {boolean} forcer ignore la peremption */
  async function charger(forcer = false) {
    if (!api) {
      dire("La prise de rendez-vous n’est pas reliée sur cette page. Écrivez-moi à " +
        ADRESSE + " : je vous propose un créneau.", "aide-souci");
      return;
    }
    if (!forcer && groupes.length > 0 && Date.now() - lueLe < PEREMPTION) return;

    dire("Lecture des créneaux libres…");
    try {
      const reponse = await fetch(api + "/creneaux.php?jours=" + JOURS_AFFICHES);
      const resultat = await reponse.json().catch(() => ({}));
      if (!reponse.ok || resultat.ok !== true) {
        throw new Error(typeof resultat.erreur === "string" ? resultat.erreur : "lecture refusee");
      }
      groupes = Array.isArray(resultat.jours) ? resultat.jours : [];
      lueLe = Date.now();
      afficherJours(resultat);
    } catch (erreur) {
      window.console.warn("Rendez-vous : créneaux illisibles.", erreur);
      vider(blocJours);
      zoneHeures.hidden = true;
      formulaire.hidden = true;
      dire("Les créneaux ne sont pas lisibles à l’instant. Réessayez dans un moment, " +
        "ou écrivez-moi à " + ADRESSE + ".", "aide-souci");
      montrerSecours(null);
    }
  }

  function afficherJours(resultat) {
    vider(blocJours);
    vider(blocHeures);
    zoneHeures.hidden = true;
    formulaire.hidden = true;
    jourChoisi = "";
    creneauChoisi = null;

    if (groupes.length === 0 || !groupes.some((g) => g.creneaux.length > 0)) {
      dire("Aucun créneau libre dans les prochains jours : mon agenda est plein. " +
        "Écrivez-moi à " + ADRESSE + ", je vous proposerai une date.", "aide-souci");
      montrerSecours(null);
      return;
    }

    const total = groupes.reduce((somme, groupe) => somme + groupe.creneaux.length, 0);
    dire(total + (total === 1 ? " créneau libre" : " créneaux libres") + " — " +
      (resultat.duree || 30) + " minutes par rendez-vous" +
      (resultat.suite ? ", d’autres jours suivent." : "."), "aide-ok");

    groupes.filter((groupe) => groupe.creneaux.length > 0).forEach((groupe) => {
      blocJours.append(boutonJour(groupe));
    });
  }

  function choisirJour(jour, bouton) {
    jourChoisi = jour;
    creneauChoisi = null;
    marquer(blocJours, bouton);
    vider(blocHeures);
    formulaire.hidden = true;

    const groupe = groupes.find((g) => g.jour === jour);
    if (!groupe || groupe.creneaux.length === 0) return;
    groupe.creneaux.forEach((creneau) => blocHeures.append(boutonHeure(creneau)));
    zoneHeures.hidden = false;
    dire("Jour choisi : " + joliJour(jour) + ". Choisissez maintenant l’heure.", "aide-ok");
    const premier = blocHeures.querySelector("button");
    if (premier) premier.focus();
  }

  function choisirCreneau(creneau, bouton) {
    creneauChoisi = creneau;
    marquer(blocHeures, bouton);
    formulaire.hidden = false;
    formulaire.elements.debut.value = creneau.debut;
    resume.textContent = "Créneau choisi : " + joliCreneau(jourChoisi, creneau);
    majDepart();
    dire("Encore vos coordonnées, et le rendez-vous est pris.", "aide-ok");
    montrerSecours(creneau);
    const premier = formulaire.querySelector('input[name="nom"]');
    if (premier) premier.focus();
  }

  // --- La reservation ---------------------------------------------------------

  const verifier = (donnees) => {
    const regles = [
      ["nom", (v) => v.trim().length >= 2, "Indiquez votre nom."],
      ["email", (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()),
        "Cette adresse email ne semble pas valide."],
    ];
    for (const [cle, valide, message] of regles) {
      const champ = formulaire.elements[cle];
      const bon = valide(String(donnees[cle] || ""));
      if (champ) {
        if (bon) champ.removeAttribute("aria-invalid");
        else champ.setAttribute("aria-invalid", "true");
      }
      if (!bon) {
        dire(message, "aide-souci");
        if (champ && champ.focus) champ.focus();
        return false;
      }
    }
    return true;
  };

  /** Champs fautifs annonces par le serveur (reponse 422). */
  const signalerChamps = (champs) => {
    const libelles = { nom: "nom", email: "email", telephone: "téléphone" };
    const noms = Object.keys(champs || {});
    noms.forEach((cle) => {
      const champ = formulaire.elements[cle];
      if (champ) champ.setAttribute("aria-invalid", "true");
    });
    return noms.map((cle) => libelles[cle] || cle);
  };

  formulaire.addEventListener("submit", async (evenement) => {
    evenement.preventDefault();
    const donnees = Object.fromEntries(new FormData(formulaire).entries());
    if (!verifier(donnees)) return;
    if (!donnees.debut) {
      dire("Choisissez d’abord un créneau dans la liste.", "aide-souci");
      return;
    }

    if (boutonEnvoi) boutonEnvoi.disabled = true;
    dire("Réservation en cours…");
    try {
      const reponse = await fetch(api + "/reserver.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(donnees),
      });
      const resultat = await reponse.json().catch(() => ({}));
      if (reponse.ok && resultat.ok === true) {
        confirmer(resultat["rendez-vous"] || {}, String(donnees.email || "").trim());
        return;
      }
      if (reponse.status === 409) {
        // Le creneau a ete pris entre l'affichage et la validation : la liste
        // est relue tout de suite, pour que le visiteur en choisisse un autre.
        dire(resultat.erreur || "Ce créneau vient d’être pris. Choisissez-en un autre.",
          "aide-souci");
        await charger(true);
        return;
      }
      if (reponse.status === 422) {
        const fautifs = signalerChamps(resultat.champs);
        dire((resultat.erreur || "Quelques champs demandent une correction.") +
          (fautifs.length > 0 ? " (" + fautifs.join(", ") + ")" : ""), "aide-souci");
        return;
      }
      dire(resultat.erreur || "La réservation n’a pas abouti. Réessayez dans un moment, " +
        "ou écrivez-moi à " + ADRESSE + ".", "aide-souci");
      montrerSecours(creneauChoisi);
    } catch (erreur) {
      window.console.warn("Rendez-vous : réservation impossible.", erreur);
      dire("La réservation n’a pas abouti. Écrivez-moi à " + ADRESSE +
        " : le créneau est dans le message déjà préparé.", "aide-souci");
      montrerSecours(creneauChoisi);
    } finally {
      if (boutonEnvoi) boutonEnvoi.disabled = false;
    }
  });

  /** L'ecran de confirmation : quand, la visio, le .ics, l'annulation. */
  function confirmer(rdv, courriel) {
    vider(blocConfirme);

    const titre = document.createElement("h3");
    titre.textContent = "C’est réservé";

    const quand = document.createElement("p");
    const fort = document.createElement("strong");
    fort.textContent = joliJour(rdv.quand || jourChoisi) + ", de " + rdv.heure +
      " à " + rdv.finHeure;
    quand.append("Votre rendez-vous est posé : ", fort, ".");
    blocConfirme.append(titre, quand);

    if (rdv.visio) {
      const visio = document.createElement("p");
      visio.append("Il se tiendra en visioconférence : ");
      const lien = document.createElement("a");
      lien.href = rdv.visio;
      lien.target = "_blank";
      lien.rel = "noopener";
      lien.textContent = "ouvrir le lien Google Meet";
      visio.append(lien, ".");
      blocConfirme.append(visio);
    }

    if (courriel) {
      const confirmation = document.createElement("p");
      confirmation.textContent = "La confirmation part à " + courriel +
        ", avec le fichier .ics pour l’ajouter à votre propre agenda.";
      blocConfirme.append(confirmation);
    }

    if (rdv.annulation) {
      const annulation = document.createElement("p");
      annulation.append("Un empêchement ? ");
      const lien = document.createElement("a");
      lien.href = rdv.annulation;
      lien.textContent = "Annulez ce rendez-vous";
      annulation.append(lien, " : le lien reste valable " +
        (rdv.joursAnnulation || 90) + " jours, et le créneau redevient libre.");
      blocConfirme.append(annulation);
    }

    const actions = document.createElement("div");
    actions.className = "hero-actions";
    const close = document.createElement("button");
    close.type = "button";
    close.className = "btn btn-primary";
    close.setAttribute("data-modale-fermer", "");
    close.textContent = "Fermer";
    actions.append(close);
    blocConfirme.append(actions);

    // Le choix du creneau laisse la place a la confirmation.
    const etape = racine.querySelector("[data-rdv-etape]");
    if (etape) etape.hidden = true;
    formulaire.hidden = true;
    zoneHeures.hidden = true;
    blocConfirme.hidden = false;
    dire("Rendez-vous réservé. À bientôt !", "aide-ok");

    // La liste sera relue a la prochaine ouverture : ce creneau n'y est plus.
    groupes = [];
    lueLe = 0;
    close.focus();
  }

  /** Sortie de secours : un email deja rempli, si la reservation echoue. */
  function montrerSecours(creneau) {
    if (!boutonSecours) return;
    const quand = creneau && jourChoisi
      ? joliCreneau(jourChoisi, creneau)
      : "un créneau à convenir";
    const donnees = formulaire.hidden ? {} : Object.fromEntries(new FormData(formulaire).entries());
    boutonSecours.href = "mailto:" + ADRESSE
      + "?subject=" + encodeURIComponent("Prendre rendez-vous")
      + "&body=" + encodeURIComponent(
        "Bonjour,\n\nJe souhaite un rendez-vous : " + quand + ".\n\n" +
        (donnees.message ? donnees.message + "\n\n" : "") +
        "Nom : " + (donnees.nom || "") + "\nEmail : " + (donnees.email || ""));
    boutonSecours.hidden = false;
  }

  // --- La fenetre -------------------------------------------------------------

  /** Revenir au choix du creneau, apres un changement d'avis. */
  function revenir() {
    creneauChoisi = null;
    formulaire.hidden = true;
    vider(blocHeures);
    zoneHeures.hidden = true;
    if (resume) resume.textContent = "";
    marquer(blocJours, null);
    dire("Choisissez un autre jour, puis l’heure qui vous convient.", "aide-ok");
    const premier = blocJours.querySelector("button");
    if (premier) premier.focus();
  }

  const ouvrir = (source) => {
    declencheur = source || null;
    modale.hidden = false;
    document.body.classList.add("modale-ouverte");
    if (boite) boite.focus();
    // La liste arrive apres la reponse de l'API : le focus y glisse ensuite,
    // seulement si le visiteur n'a pas deja commence a naviguer.
    charger().then(() => {
      const premier = blocJours.querySelector("button");
      if (premier && document.activeElement === boite) premier.focus();
    });
  };

  const fermer = () => {
    modale.hidden = true;
    document.body.classList.remove("modale-ouverte");
    if (declencheur && declencheur.focus) declencheur.focus();
    declencheur = null;
  };

  if (boutonChanger) boutonChanger.addEventListener("click", revenir);

  // Ouverture : le bouton de cette page (« Choisir un créneau ») et, si le site
  // en ajoute ailleurs un jour, tout element portant data-ouvrir-rendez-vous.
  document.addEventListener("click", (evenement) => {
    const bouton = evenement.target.closest("[data-ouvrir-rendez-vous]");
    if (!bouton) return;
    evenement.preventDefault();
    ouvrir(bouton);
  });

  // Fermeture : croix, fond assombri, bouton « Fermer », touche Echap.
  modale.addEventListener("click", (evenement) => {
    if (evenement.target.closest("[data-modale-fermer]")) fermer();
  });
  window.addEventListener("keydown", (evenement) => {
    if (evenement.key === "Escape" && !modale.hidden) fermer();
  });

  // Le focus reste dans la fenetre tant qu'elle est ouverte (touche Tab).
  modale.addEventListener("keydown", (evenement) => {
    if (evenement.key !== "Tab") return;
    const focusables = Array.from(boite.querySelectorAll(
      "a[href], button:not([disabled]), input:not([type=\"hidden\"]), select, textarea"))
      .filter((element) => !element.hidden && element.offsetParent !== null);
    if (focusables.length === 0) return;
    const premier = focusables[0];
    const dernier = focusables[focusables.length - 1];
    if (evenement.shiftKey && document.activeElement === premier) {
      evenement.preventDefault();
      dernier.focus();
    } else if (!evenement.shiftKey && document.activeElement === dernier) {
      evenement.preventDefault();
      premier.focus();
    }
  });
})();

