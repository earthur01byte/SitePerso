/**
 * Fenetre de prise de rendez-vous du site (LOT 32).
 *
 * Elle reprend la disposition des outils de reservation : une colonne de
 * presentation a gauche, un calendrier mensuel au centre, les creneaux libres a
 * droite. Le visiteur choisit un jour, puis une heure, la pastille « Continuer »
 * apparait sous le creneau retenu, et un second panneau lui demande ses
 * coordonnees, le recapitulatif restant sous les yeux, a gauche.
 *
 * Les creneaux viennent de creneaux.php (les occupations de l'agenda Google,
 * lues par freeBusy), la reservation part vers reserver.php. Le rendez-vous
 * s'inscrit dans l'agenda avec un lien Google Meet, et la confirmation arrive
 * par email, le fichier .ics en piece jointe.
 *
 * La fenetre s'ouvre sur un sujet : « Discussion ouverte » par defaut, ou celui
 * du bouton qui a mene ici (data-ouvrir-rendez-vous, ou ?rdv= dans l'adresse).
 */
(() => {
  "use strict";

  const ADRESSE = "arthur@arthurdelassus.com";
  const JOURS_AFFICHES = 31;     // jours demandes d'un coup a l'API (maximum)
  const PEREMPTION = 120000;     // au-dela, la liste des creneaux est relue
  const NOTE_MAX = 1000;

  const MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet",
                "août", "septembre", "octobre", "novembre", "décembre"];
  const SEMAINE = ["lun", "mar", "mer", "jeu", "ven", "sam", "dim"];

  /**
   * Le sujet annonce a gauche, selon le bouton clique avant d'arriver ici.
   * Les textes reprennent les mots des pages du site : le visiteur retrouve ce
   * qu'il vient de lire.
   */
  const SUJETS = {
    discussion: {
      titre: "Discussion ouverte",
      texte: "30 minutes pour voir ce que mes ateliers, mes conférences ou mes notes " +
        "peuvent apporter à vos équipes, et comment entrer dans la transition sans se " +
        "raconter d’histoires.",
    },
    "atelier-hd": {
      titre: "Atelier Horizons Décarbonés",
      texte: "Cocréé en 2022 avec Amaury Lethu, animé pour des milliers de personnes : " +
        "les leviers et les ordres de grandeur du CO₂ et de l’énergie, expliqués " +
        "simplement. Voyons ce qu’il devient dans vos équipes.",
    },
    "atelier-fdfp": {
      titre: "La Fresque des frontières planétaires",
      texte: "Relier les neuf sujets environnementaux importants (pas seulement le " +
        "climat) et repérer les deux moteurs qui expliquent l’essentiel de nos impacts. " +
        "Voyons ce que cela donne chez vous.",
    },
    atelier: {
      titre: "Atelier de sensibilisation",
      texte: "Un atelier pour comprendre les leviers de la transition et repartir avec " +
        "l’envie d’agir, plutôt qu’avec la sidération.",
    },
    conference: {
      titre: "Conférence",
      texte: "Un propos clair et documenté sur la transition écologique : keynote, table " +
        "ronde, événement interne, de 20 à 60 minutes.",
    },
    cours: {
      titre: "Cours et formation",
      texte: "Des cours qui partent de cas concrets et d’ordres de grandeur, adaptés au " +
        "niveau des étudiants et à la durée du module.",
    },
    note: {
      titre: "Note ou rapport",
      texte: "Une note de fond pour éclairer une décision, un débat public ou une " +
        "stratégie sectorielle.",
    },
    visite: {
      titre: "Visite de la ferme",
      texte: "La ferme maraîchère en bio, ses panneaux solaires, sa chambre froide et sa " +
        "recharge de véhicule : le terrain, et ce qu’il enseigne.",
    },
    seminaire: {
      titre: "Séminaire au vert",
      texte: "Une journée ou une demi-journée à la ferme, entre atelier et visite " +
        "apprenante, pour une équipe complète.",
    },
    clim: {
      titre: "Climatisation et adaptation",
      texte: "Conférence, atelier ou intervention sur la climatisation et " +
        "l’adaptation : on reprend vos questions de vive voix, avec les ordres de " +
        "grandeur et le cas de votre bâtiment.",
    },
  };

  /**
   * Le bloc de reglages montre selon le sujet du bouton : les trois ateliers
   * partagent les memes questions, et une demande « autre » n'en pose aucune.
   */
  const REGLAGES = {
    "atelier-hd": "atelier",
    "atelier-fdfp": "atelier",
    atelier: "atelier",
    conference: "conference",
    cours: "cours",
    note: "note",
    visite: "visite",
    seminaire: "seminaire",
    discussion: "discussion",
    clim: "clim",
  };

  /**
   * Les reglages facultatifs envoyes avec la demande. Meme liste que la liste
   * blanche du serveur : ce qui n'y est pas n'est ni lu ni enregistre.
   */
  const CHAMPS_REGLAGES = ["organisme", "nombre", "format", "budget", "public", "duree",
    "niveau", "echeance", "formatNote", "age", "transport", "sejours", "ateliers",
    "urgence", "cas", "attente"];

  const modale = document.getElementById("modaleRendezVous");
  if (!modale) return;

  const racine = modale.querySelector("[data-rdv]");
  const api = (racine.getAttribute("data-api") || "").replace(/\/+$/, "");
  const boite = modale.querySelector(".modale-boite");

  const elSujet = racine.querySelector("[data-rdv-sujet]");
  const elTexte = racine.querySelector("[data-rdv-texte]");
  const elDuree = racine.querySelector("[data-rdv-duree]");
  const elQuand = racine.querySelector("[data-rdv-repere-quand]");
  const elQuandJour = racine.querySelector("[data-rdv-quand-jour]");
  const elQuandHeure = racine.querySelector("[data-rdv-quand-heure]");
  const elFuseau = racine.querySelector("[data-rdv-fuseau]");
  const elHeureLocale = racine.querySelector("[data-rdv-heure-locale]");
  const elMois = racine.querySelector("[data-rdv-mois]");
  const boutonPrecedent = racine.querySelector("[data-rdv-mois-precedent]");
  const boutonSuivant = racine.querySelector("[data-rdv-mois-suivant]");
  const elGrille = racine.querySelector("[data-rdv-grille]");
  const elJourTitre = racine.querySelector("[data-rdv-jour-titre]");
  const elListe = racine.querySelector("[data-rdv-liste]");
  const formulaire = racine.querySelector("[data-rdv-form]");
  const elCompteur = racine.querySelector("[data-rdv-compteur]");
  const zoneParticipant = racine.querySelector("[data-rdv-participant-zone]");
  const boutonAjout = racine.querySelector("[data-rdv-ajout]");
  const boutonRetirer = racine.querySelector("[data-rdv-ajout-retirer]");
  const boutonEnvoi = formulaire.querySelector('button[type="submit"]');
  // La ligne d'etat est sous la grille, donc hors de `racine` : on la cherche
  // dans la fenetre entiere, sinon les messages resteraient invisibles.
  const statut = modale.querySelector("[data-rdv-statut]");
  const blocConfirme = racine.querySelector("[data-rdv-confirme]");
  const boutonRetour = racine.querySelector("[data-rdv-retour]");
  const boutonSecours = racine.querySelector("[data-rdv-secours]");
  const zoneReglages = racine.querySelector("[data-rdv-reglages]");
  const blocsReglages = Array.from(racine.querySelectorAll("[data-rdv-type]"));
  const elNoteTitre = racine.querySelector("[data-rdv-note-titre]");

  let groupes = [];               // les jours rendus par l'API
  let ouverts = new Map();        // « 2026-10-07 » -> nombre de creneaux libres
  let mois = [];                  // les mois a parcourir, du premier au dernier jour
  let moisAffiche = "";
  let jourChoisi = "";
  let creneauChoisi = null;
  let lueLe = 0;
  let declencheur = null;
  let minuteur = 0;

  const dire = (message, genre) => {
    if (!statut) return;
    statut.textContent = message || "";
    statut.classList.remove("aide-ok", "aide-souci");
    if (genre) statut.classList.add(genre);
  };

  /**
   * L'attente, montree dans la grille elle-meme : lire les creneaux demande un
   * aller-retour vers Google Agenda, et un calendrier vide laisse croire que rien
   * ne se passe. Le bloc est retire des que la reponse arrive (ou en cas d'erreur).
   */
  const patiente = (message) => {
    racine.setAttribute("aria-busy", "true");
    if (boutonPrecedent) boutonPrecedent.disabled = true;
    if (boutonSuivant) boutonSuivant.disabled = true;
    if (elGrille) {
      vider(elGrille);
      const bloc = document.createElement("div");
      bloc.className = "rdv-attente";
      const molette = document.createElement("span");
      molette.className = "rdv-attente-molette";
      molette.setAttribute("aria-hidden", "true");
      const mot = document.createElement("span");
      mot.className = "rdv-attente-mot";
      mot.textContent = message;
      bloc.append(molette, mot);
      elGrille.append(bloc);
    }
    if (elListe) {
      vider(elListe);
      const vide = document.createElement("p");
      vide.className = "rdv-liste-vide";
      vide.textContent = "Les heures apparaîtront dès que les créneaux seront connus.";
      elListe.append(vide);
    }
  };

  const finPatiente = () => racine.removeAttribute("aria-busy");

  /** Horodatage en secondes, comme le controle anti-robot du serveur. */
  const majDepart = () => {
    const champ = formulaire.querySelector('[name="depart"]');
    if (champ) champ.value = String(Math.floor(Date.now() / 1000));
  };

  /** « 2026-10-07 » -> une date locale, sans decalage de fuseau. */
  const duJour = (jour) => {
    const [annee, numeroMois, numero] = jour.split("-").map(Number);
    return new Date(annee, numeroMois - 1, numero, 12, 0, 0);
  };

  /** « 2026-10-07 » -> « 7 octobre » (titre du panneau des heures). */
  const joliJour = (jour) => duJour(jour).toLocaleDateString("fr-FR",
    { day: "numeric", month: "long" });

  /** « 2026-10-07 » -> « Mercredi 7 octobre 2026 » (recapitulatif). */
  const joliJourLong = (jour) => {
    const texte = duJour(jour).toLocaleDateString("fr-FR",
      { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    return texte.charAt(0).toUpperCase() + texte.slice(1);
  };

  const cleMois = (jour) => jour.slice(0, 7);

  /** « 2026-10 » -> « Octobre 2026 ». */
  const joliMois = (cle) => {
    const numero = Number(cle.split("-")[1]);
    const nom = MOIS[numero - 1] || "";
    return nom.charAt(0).toUpperCase() + nom.slice(1) + " " + cle.split("-")[0];
  };

  /** Les 42 cases du mois, du lundi de la premiere semaine au dimanche de la derniere. */
  const casesDuMois = (cle) => {
    const [annee, numeroMois] = cle.split("-").map(Number);
    const premier = new Date(annee, numeroMois - 1, 1, 12, 0, 0);
    const decalage = (premier.getDay() + 6) % 7;      // lundi = 0
    const cases = [];
    for (let i = 0; i < 42; i += 1) {
      const date = new Date(annee, numeroMois - 1, 1 - decalage + i, 12, 0, 0);
      const jour = date.getFullYear() + "-" +
        String(date.getMonth() + 1).padStart(2, "0") + "-" +
        String(date.getDate()).padStart(2, "0");
      cases.push({ jour, mois: cleMois(jour), numero: date.getDate() });
    }
    return cases;
  };

  const vider = (conteneur) => {
    while (conteneur.firstChild) conteneur.removeChild(conteneur.firstChild);
  };

  // --- Les creneaux libres ---------------------------------------------------

  /** Relit les creneaux libres et reconstruit le calendrier. */
  async function charger(forcer = false) {
    if (!api) {
      dire("La prise de rendez-vous n’est pas reliée sur cette page. Écrivez-moi à " +
        ADRESSE + ".", "aide-souci");
      return;
    }
    if (!forcer && groupes.length > 0 && Date.now() - lueLe < PEREMPTION) return;

    dire("Lecture des créneaux libres…");
    patiente("Recherche des créneaux disponibles…");
    try {
      const reponse = await fetch(api + "/creneaux.php?jours=" + JOURS_AFFICHES);
      const resultat = await reponse.json().catch(() => ({}));
      if (!reponse.ok || resultat.ok !== true) {
        throw new Error(typeof resultat.erreur === "string" ? resultat.erreur : "lecture refusee");
      }
      groupes = Array.isArray(resultat.jours) ? resultat.jours : [];
      lueLe = Date.now();
      preparer(resultat);
      finPatiente();
    } catch (erreur) {
      window.console.warn("Rendez-vous : créneaux illisibles.", erreur);
      finPatiente();
      vider(elGrille);
      vider(elListe);
      dire("Les créneaux ne sont pas lisibles à l’instant. Réessayez dans un moment, " +
        "ou écrivez-moi à " + ADRESSE + ".", "aide-souci");
      montrerSecours(null);
    }
  }

  /** Installe les jours libres, les mois a parcourir, la duree et le fuseau. */
  function preparer(resultat) {
    ouverts = new Map();
    groupes.forEach((groupe) => {
      if (groupe && groupe.jour &&
          Array.isArray(groupe.creneaux) && groupe.creneaux.length > 0) {
        ouverts.set(groupe.jour, groupe.creneaux.length);
      }
    });

    const duree = resultat.duree || 30;
    const fuseau = resultat.fuseau || "Europe/Paris";
    if (elDuree) elDuree.textContent = duree + " min";
    if (elFuseau) elFuseau.textContent = fuseau;
    majHeureLocale(fuseau);

    jourChoisi = "";
    creneauChoisi = null;
    vider(elListe);
    if (elJourTitre) elJourTitre.textContent = "";
    if (elQuand) elQuand.hidden = true;
    formulaire.hidden = true;
    racine.dataset.etape = "creneaux";

    const jours = Array.from(ouverts.keys()).sort();
    if (jours.length === 0) {
      vider(elGrille);
      dire("Aucun créneau libre dans les prochaines semaines : mon agenda est plein. " +
        "Écrivez-moi à " + ADRESSE + ", je vous proposerai une date.", "aide-souci");
      montrerSecours(null);
      return;
    }

    // Les mois a parcourir : du mois du premier jour libre a celui du dernier.
    const premier = cleMois(jours[0]);
    const dernier = cleMois(jours[jours.length - 1]);
    mois = [];
    let cle = premier;
    while (cle <= dernier && mois.length < 6) {
      mois.push(cle);
      const [annee, numero] = cle.split("-").map(Number);
      const suivant = new Date(annee, numero, 1, 12, 0, 0);
      cle = suivant.getFullYear() + "-" + String(suivant.getMonth() + 1).padStart(2, "0");
    }
    moisAffiche = mois.indexOf(cleMois(jourChoisi)) >= 0 ? cleMois(jourChoisi) : premier;
    afficherMois();

    const total = jours.reduce((somme, jour) => somme + ouverts.get(jour), 0);
    dire(total + (total === 1 ? " créneau libre" : " créneaux libres") + " : " +
      duree + " minutes par rendez-vous. Choisissez un jour.", "aide-ok");
  }

  /** Le mois affiche : jours libres en pastilles, les autres en clair. */
  function afficherMois() {
    if (!elMois || !elGrille) return;
    elMois.textContent = joliMois(moisAffiche);
    vider(elGrille);

    casesDuMois(moisAffiche).forEach((caisse) => {
      const dansLeMois = caisse.mois === moisAffiche;
      if (!dansLeMois || !ouverts.has(caisse.jour)) {
        const rien = document.createElement("span");
        rien.className = "rdv-case-vide";
        rien.textContent = dansLeMois ? String(caisse.numero) : "";
        elGrille.append(rien);
        return;
      }
      const bouton = document.createElement("button");
      bouton.type = "button";
      bouton.className = "rdv-case";
      bouton.dataset.jour = caisse.jour;
      bouton.textContent = String(caisse.numero);
      bouton.setAttribute("aria-pressed", caisse.jour === jourChoisi ? "true" : "false");
      const combien = ouverts.get(caisse.jour);
      bouton.title = joliJourLong(caisse.jour) + " : " + combien +
        (combien === 1 ? " créneau libre" : " créneaux libres");
      bouton.setAttribute("aria-label", bouton.title);
      bouton.addEventListener("click", () => choisirJour(caisse.jour));
      elGrille.append(bouton);
    });

    const rang = mois.indexOf(moisAffiche);
    if (boutonPrecedent) boutonPrecedent.disabled = rang <= 0;
    if (boutonSuivant) boutonSuivant.disabled = rang >= mois.length - 1;
  }

  /** L'heure qu'il est dans le fuseau de l'agenda, sous le calendrier. */
  function majHeureLocale(fuseau) {
    if (!elHeureLocale) return;
    const heure = new Date().toLocaleTimeString("fr-FR",
      { timeZone: fuseau, hour: "2-digit", minute: "2-digit" }).replace(":", "h");
    elHeureLocale.textContent = fuseau + " : " + heure;
  }

  /** Un jour retenu : ses heures s'affichent dans le panneau de droite. */
  function choisirJour(jour) {
    jourChoisi = jour;
    creneauChoisi = null;
    vider(elListe);
    if (elJourTitre) elJourTitre.textContent = joliJourLong(jour);
    if (elQuand) elQuand.hidden = true;

    const groupe = groupes.find((element) => element.jour === jour);
    const creneaux = (groupe && groupe.creneaux) || [];
    creneaux.forEach((creneau) => elListe.append(boutonCreneau(creneau)));

    Array.from(elGrille.children).forEach((caisse) => {
      caisse.setAttribute("aria-pressed", caisse.dataset.jour === jour ? "true" : "false");
    });

    const combien = creneaux.length;
    dire("Jour choisi : " + joliJourLong(jour) + ", " + combien +
      (combien === 1 ? " créneau libre" : " créneaux libres") +
      ". Choisissez l’heure.", "aide-ok");
    const premier = elListe.querySelector("button");
    if (premier) premier.focus();
  }

  const boutonCreneau = (creneau) => {
    const bouton = document.createElement("button");
    bouton.type = "button";
    bouton.className = "rdv-creneau";
    bouton.textContent = creneau.heure;
    bouton.setAttribute("aria-pressed", "false");
    bouton.title = "Rendez-vous de " + creneau.heure + " à " + creneau.finHeure;
    bouton.addEventListener("click", () => choisirCreneau(creneau, bouton));
    return bouton;
  };

  /** Un creneau retenu : la pastille « Continuer » apparait juste sous lui. */
  function choisirCreneau(creneau, bouton) {
    creneauChoisi = creneau;
    const ancien = elListe.querySelector(".rdv-continuer");
    if (ancien) ancien.remove();
    Array.from(elListe.querySelectorAll(".rdv-creneau")).forEach((element) => {
      element.setAttribute("aria-pressed", element === bouton ? "true" : "false");
    });

    const continuer = document.createElement("button");
    continuer.type = "button";
    continuer.className = "btn btn-primary rdv-continuer";
    continuer.textContent = "Continuer";
    continuer.addEventListener("click", passerAuxInformations);
    bouton.after(continuer);

    if (elQuandJour) elQuandJour.textContent = joliJourLong(jourChoisi);
    if (elQuandHeure) elQuandHeure.textContent = creneau.heure + " - " + creneau.finHeure;
    if (elQuand) elQuand.hidden = false;
    dire("Créneau retenu : " + creneau.heure + ". Cliquez sur « Continuer ».", "aide-ok");
    continuer.focus();
  }

  // --- Les coordonnees -------------------------------------------------------

  /** Le creneau est retenu : place aux coordonnees, recapitulatif a gauche. */
  function passerAuxInformations() {
    if (!creneauChoisi || !jourChoisi) {
      dire("Choisissez d’abord un jour, puis une heure.", "aide-souci");
      return;
    }
    racine.dataset.etape = "formulaire";
    formulaire.hidden = false;
    vider(blocConfirme);
    blocConfirme.hidden = true;
    if (elQuandJour) elQuandJour.textContent = joliJourLong(jourChoisi);
    if (elQuandHeure) {
      elQuandHeure.textContent = creneauChoisi.heure + " - " + creneauChoisi.finHeure;
    }
    if (elQuand) elQuand.hidden = false;
    formulaire.elements.debut.value = creneauChoisi.debut;
    majDepart();
    majCompteur();
    dire("Encore vos coordonnées, et le rendez-vous est pris.", "aide-ok");
    const premier = formulaire.querySelector('[name="prenom"]');
    if (premier) premier.focus();
  }

  /** Retour au calendrier, sans perdre le creneau deja retenu. */
  function revenir() {
    racine.dataset.etape = "creneaux";
    formulaire.hidden = true;
    dire("Choisissez un autre jour, ou une autre heure.", "aide-ok");
    const choisi = elListe.querySelector('.rdv-creneau[aria-pressed="true"]');
    if (choisi) choisi.focus();
  }

  /** Le compte des caracteres de la note, comme dans la reference. */
  function majCompteur() {
    if (!elCompteur) return;
    const note = formulaire.querySelector('[name="message"]');
    elCompteur.textContent = String((note && note.value.length) || 0) + " / " + NOTE_MAX;
  }

  // --- L'envoi ---------------------------------------------------------------

  const ADRESSE_VALIDE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  const marquer = (champ, bon) => {
    if (!champ) return;
    if (bon) champ.removeAttribute("aria-invalid");
    else champ.setAttribute("aria-invalid", "true");
  };

  const refuser = (champ, message) => {
    marquer(champ, false);
    dire(message, "aide-souci");
    if (champ && champ.focus) champ.focus();
    return false;
  };

  /** Les champs du visiteur, avant l'envoi : les memes regles que le serveur. */
  function verifier(donnees) {
    const obligatoires = [
      ["prenom", (v) => v.trim().length >= 2, "Indiquez votre prénom."],
      ["nom", (v) => v.trim().length >= 2, "Indiquez votre nom."],
      ["email", (v) => ADRESSE_VALIDE.test(v.trim()),
        "Cette adresse email ne semble pas valide."],
    ];
    for (const [cle, valide, message] of obligatoires) {
      const champ = formulaire.elements[cle];
      if (!valide(String(donnees[cle] || ""))) return refuser(champ, message);
      marquer(champ, true);
    }

    const telephone = formulaire.elements.telephone;
    if (telephone && telephone.value.trim() &&
        !/^[0-9+ ().-]{6,32}$/.test(telephone.value.trim())) {
      return refuser(telephone, "Ce numéro de téléphone ne semble pas valide.");
    }
    marquer(telephone, true);

    const participant = formulaire.elements.participant;
    if (participant && participant.value.trim() &&
        !ADRESSE_VALIDE.test(participant.value.trim())) {
      return refuser(participant, "L’adresse de l’autre participant ne semble pas valide.");
    }
    marquer(participant, true);

    const note = formulaire.elements.message;
    if (note && note.value.length > NOTE_MAX) {
      return refuser(note, "Votre note dépasse " + NOTE_MAX + " caractères.");
    }

    const accord = formulaire.elements.accord;
    if (accord && !accord.checked) {
      return refuser(accord, "Merci de cocher l’accord pour que je puisse enregistrer " +
        "le rendez-vous.");
    }
    return true;
  }

  /** Champs fautifs annonces par le serveur (reponse 422). */
  const signalerChamps = (champs) => {
    const libelles = {
      nom: "nom", email: "email", telephone: "téléphone",
      organisme: "structure ou organisation", nombre: "nombre de personnes",
      format: "format", budget: "budget", echeance: "pour quand",
    };
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
      dire("Choisissez d’abord un créneau dans le calendrier.", "aide-souci");
      return;
    }

    // L'API attend un nom et un email : le prenom et le nom sont reunis ici.
    const envoi = {
      debut: donnees.debut,
      nom: (String(donnees.prenom || "") + " " + String(donnees.nom || "")).trim(),
      email: String(donnees.email || "").trim(),
      telephone: String(donnees.telephone || "").trim(),
      participant: String(donnees.participant || "").trim(),
      message: String(donnees.message || "").trim(),
      type: String(donnees.type || "").trim(),
      depart: donnees.depart,
      site_web: donnees.site_web,
    };
    // Les reglages facultatifs partent tels quels : le serveur garde ceux qu'il
    // connait, et les questions cachees sont desactivees, donc absentes ici.
    CHAMPS_REGLAGES.forEach((cle) => {
      const valeur = String(donnees[cle] || "").trim();
      if (valeur) envoi[cle] = valeur;
    });

    if (boutonEnvoi) {
      boutonEnvoi.disabled = true;
      // Le libellé du bouton porte l'attente : l'enregistrement passe par Google
      // Agenda puis par le SMTP, ce qui prend quelques secondes.
      boutonEnvoi.dataset.libelle = boutonEnvoi.dataset.libelle || boutonEnvoi.textContent;
      boutonEnvoi.textContent = "Enregistrement…";
    }
    dire("Réservation en cours…");
    try {
      const reponse = await fetch(api + "/reserver.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(envoi),
      });
      const resultat = await reponse.json().catch(() => ({}));
      if (reponse.ok && resultat.ok === true) {
        confirmer(resultat["rendez-vous"] || {}, envoi.email);
        return;
      }
      if (reponse.status === 409) {
        // Le creneau a ete pris entre l'affichage et la validation : la liste est
        // relue tout de suite, et le visiteur revient au calendrier.
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
      if (boutonEnvoi) {
        boutonEnvoi.disabled = false;
        if (boutonEnvoi.dataset.libelle) boutonEnvoi.textContent = boutonEnvoi.dataset.libelle;
      }
    }
  });

  /** L'ecran de confirmation : quand, la visio, le .ics, l'annulation. */
  function confirmer(rdv, courriel) {
    vider(blocConfirme);
    racine.dataset.etape = "confirme";
    formulaire.hidden = true;
    blocConfirme.hidden = false;

    const titre = document.createElement("h3");
    titre.textContent = "C’est réservé";

    const quand = document.createElement("p");
    quand.className = "rdv-confirme-quand";
    quand.textContent = joliJourLong(rdv.quand || jourChoisi) + ", de " +
      rdv.heure + " à " + rdv.finHeure;
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
      const suite = document.createElement("p");
      suite.textContent = "La confirmation part à " + courriel +
        ", avec le fichier .ics pour l’ajouter à votre propre agenda.";
      blocConfirme.append(suite);
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
    actions.className = "rdv-actions";
    const fin = document.createElement("button");
    fin.type = "button";
    fin.className = "btn btn-primary";
    fin.setAttribute("data-modale-fermer", "");
    fin.textContent = "Fermer";
    actions.append(fin);
    blocConfirme.append(actions);

    dire("Rendez-vous réservé. À bientôt !", "aide-ok");
    // La liste sera relue a la prochaine ouverture : ce creneau n'y est plus.
    groupes = [];
    lueLe = 0;
    fin.focus();
  }

  /** Sortie de secours : un email deja rempli, si la reservation echoue. */
  function montrerSecours(creneau) {
    if (!boutonSecours) return;
    const quand = creneau && jourChoisi
      ? joliJourLong(jourChoisi) + ", de " + creneau.heure + " à " + creneau.finHeure
      : "un créneau à convenir";
    const donnees = formulaire.hidden
      ? {}
      : Object.fromEntries(new FormData(formulaire).entries());
    const nom = [donnees.prenom, donnees.nom].filter(Boolean).join(" ");
    // La demande et ses reperes partent aussi : c'est ce que je lis avant de
    // rappeler le visiteur qui a prefere ecrire plutot que reserver.
    const reglages = [
      ["Organisation", donnees.organisme],
      ["Nombre", donnees.nombre],
      ["Format", donnees.format],
      ["Budget", donnees.budget],
      ["Public", donnees.public],
      ["Durée", donnees.duree],
      ["Niveau", donnees.niveau],
      ["Pour quand", donnees.echeance],
      ["Format attendu", donnees.formatNote],
      ["Groupe", donnees.age],
      ["Transport", donnees.transport],
      ["Durée du séjour", donnees.sejours],
      ["Ateliers", donnees.ateliers],
      ["Urgence", donnees.urgence],
      ["Cas", donnees.cas],
      ["Attentes", donnees.attente],
    ].filter((ligne) => ligne[1])
      .map((ligne) => ligne[0] + " : " + ligne[1]).join("\n");
    boutonSecours.href = "mailto:" + ADRESSE
      + "?subject=" + encodeURIComponent("Prendre rendez-vous")
      + "&body=" + encodeURIComponent(
        "Bonjour,\n\nJe souhaite un rendez-vous : " + quand + ".\n\n" +
        (donnees.type && SUJETS[donnees.type] ? "Motif : " + SUJETS[donnees.type].titre + "\n" : "") +
        (reglages ? reglages + "\n" : "") +
        (donnees.message ? "\n" + donnees.message + "\n" : "") +
        "\nNom : " + nom + "\nEmail : " + (donnees.email || "") +
        (donnees.telephone ? "\nTéléphone : " + donnees.telephone : ""));
    boutonSecours.hidden = false;
  }

  // --- La fenetre -------------------------------------------------------------

  /**
   * Les reglages montres : ceux du sujet du bouton, et seulement eux.
   *
   * Un bloc cache est aussi desactive, et les navigateurs n'envoient pas les
   * champs desactives : aucune reponse a une question invisible ne part, meme si
   * le visiteur avait clique avant de changer de sujet.
   */
  function montrerReglages(cle) {
    const voulu = REGLAGES[cle] || "";
    blocsReglages.forEach((bloc) => {
      const montre = bloc.dataset.rdvType === voulu;
      bloc.hidden = !montre;
      bloc.querySelectorAll("input").forEach((champ) => { champ.disabled = !montre; });
    });
  }

  /** L'intitule de la note libre : on ne demande pas la meme chose partout. */
  function majNote(cle) {
    if (!elNoteTitre) return;
    elNoteTitre.textContent = cle === "note"
      ? "La question posée, en une phrase"
      : "Ce que je dois savoir pour arriver préparé";
  }

  /**
   * Le sujet affiche a gauche : celui du bouton qui a mene ici. Le meme sujet
   * part avec la demande, dans le champ cache « type » : c'est ce qui manquait
   * pour savoir ce que le visiteur vient chercher.
   */
  function appliquerSujet(cle) {
    const connu = Object.hasOwn(SUJETS, cle) ? cle : "discussion";
    const sujet = SUJETS[connu];
    if (elSujet) elSujet.textContent = sujet.titre;
    if (elTexte) elTexte.textContent = sujet.texte;
    if (formulaire.elements.type) formulaire.elements.type.value = connu;
    montrerReglages(connu);
    majNote(connu);
  }

  const ouvrir = (source, cle) => {
    declencheur = source || null;
    appliquerSujet(cle || "");
    modale.hidden = false;
    document.body.classList.add("modale-ouverte");
    if (boite) boite.focus();
    // La liste des creneaux arrive apres la reponse de l'API : le focus y glisse
    // ensuite, seulement si le visiteur n'a pas deja commence a naviguer.
    charger().then(() => {
      const premier = elGrille.querySelector("button");
      if (premier && document.activeElement === boite) premier.focus();
    });
    if (!minuteur) {
      minuteur = window.setInterval(() => {
        majHeureLocale(elFuseau && elFuseau.textContent
          ? elFuseau.textContent : "Europe/Paris");
      }, 60000);
    }
  };

  const fermer = () => {
    modale.hidden = true;
    document.body.classList.remove("modale-ouverte");
    if (minuteur) {
      window.clearInterval(minuteur);
      minuteur = 0;
    }
    if (declencheur && declencheur.focus) declencheur.focus();
    declencheur = null;
  };

  if (boutonPrecedent) {
    boutonPrecedent.addEventListener("click", () => {
      const rang = mois.indexOf(moisAffiche);
      if (rang > 0) {
        moisAffiche = mois[rang - 1];
        afficherMois();
      }
    });
  }
  if (boutonSuivant) {
    boutonSuivant.addEventListener("click", () => {
      const rang = mois.indexOf(moisAffiche);
      if (rang >= 0 && rang < mois.length - 1) {
        moisAffiche = mois[rang + 1];
        afficherMois();
      }
    });
  }
  const champNote = formulaire.querySelector('[name="message"]');
  if (champNote) champNote.addEventListener("input", majCompteur);
  if (boutonAjout) {
    boutonAjout.addEventListener("click", () => {
      if (!zoneParticipant) return;
      zoneParticipant.hidden = false;
      boutonAjout.hidden = true;
      const champ = formulaire.elements.participant;
      if (champ && champ.focus) champ.focus();
    });
  }
  if (boutonRetirer) {
    boutonRetirer.addEventListener("click", () => {
      if (!zoneParticipant) return;
      zoneParticipant.hidden = true;
      if (boutonAjout) boutonAjout.hidden = false;
      const champ = formulaire.elements.participant;
      if (champ) champ.value = "";
    });
  }
  if (boutonRetour) boutonRetour.addEventListener("click", revenir);

  // Ouverture : le bouton de la page, et tout element portant l'attribut. Les
  // pages d'offres y mettent leur sujet : data-ouvrir-rendez-vous="atelier-hd".
  document.addEventListener("click", (evenement) => {
    const bouton = evenement.target.closest("[data-ouvrir-rendez-vous]");
    if (!bouton) return;
    evenement.preventDefault();
    ouvrir(bouton, bouton.getAttribute("data-ouvrir-rendez-vous") || "");
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

  // Arrivee depuis un bouton d'une autre page (prendre-rendez-vous.html?rdv=…) :
  // la fenetre s'ouvre d'elle-meme, sur le bon sujet.
  const demande = new URLSearchParams(window.location.search);
  const cle = demande.get("rdv") || demande.get("type") || "";
  appliquerSujet(cle);
  if (cle) window.setTimeout(() => ouvrir(null, cle), 120);
})();







