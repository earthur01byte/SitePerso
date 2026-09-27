/**
 * Formulaire de contact du site (LOT 33).
 *
 * Deux emplacements partagent exactement le meme code :
 *   - le formulaire en page de contact.html ;
 *   - la fenetre de contact (pop-up) presente sur les autres pages, ouverte par
 *     les boutons « Me contacter », « Demander une note », ... et par le lien du
 *     pied de page.
 *
 * Le message part directement vers l'API (api.arthurdelassus.com) : le visiteur
 * ne quitte pas la page et recoit un accuse de reception par email.
 */
(() => {
  "use strict";

  const ADRESSE = "arthur@arthurdelassus.com";

  /** Horodatage en secondes, comme le controle anti-robot du serveur. */
  const majDepart = (formulaire) => {
    const champ = formulaire.querySelector('[name="depart"]');
    if (champ) champ.value = String(Math.floor(Date.now() / 1000));
  };

  /** Lit les champs du formulaire. */
  const lire = (formulaire) => Object.fromEntries(new FormData(formulaire).entries());

  /** Libelles des types de demande, lus dans le select du formulaire. */
  const libelles = (formulaire) => {
    const sortie = {};
    const select = formulaire.querySelector('select[name="type"]');
    if (select) {
      Array.from(select.options).forEach((option) => {
        sortie[option.value] = option.textContent.trim();
      });
    }
    return sortie;
  };

  const libelle = (dictionnaire, valeur) => dictionnaire[valeur] || "Demande";

  const corpsMessage = (donnees, dictionnaire) => [
    "Nom : " + (donnees.nom || ""),
    "Email : " + (donnees.email || ""),
    "Demande : " + libelle(dictionnaire, donnees.type),
    "",
    donnees.message || "",
  ].join("\n");

  /** Branche un formulaire (celui de la page ou celui de la fenetre). */
  function brancherFormulaire(formulaire) {
    const api = (formulaire.getAttribute("data-api") || "").replace(/\/+$/, "");
    const statut = formulaire.querySelector("[data-statut]");
    const boutonEnvoi = formulaire.querySelector('button[type="submit"]');
    const boutonCopie = formulaire.querySelector("[data-copier-message]");
    const boutonMail = formulaire.querySelector("[data-ouvrir-messagerie]");
    const dictionnaire = libelles(formulaire);

    majDepart(formulaire);

    const montrerSecours = () => {
      if (boutonMail) boutonMail.hidden = false;
    };
    if (!api) montrerSecours();

    const dire = (message, genre) => {
      if (!statut) return;
      statut.textContent = message;
      statut.classList.remove("aide-ok", "aide-souci");
      if (genre) statut.classList.add(genre);
    };

    const verifier = (donnees) => {
      const regles = [
        ["nom", (v) => v.trim().length >= 2, "Indiquez votre nom."],
        ["email", (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()),
          "Cette adresse email ne semble pas valide."],
        ["message", (v) => v.trim().length >= 10,
          "Décrivez votre demande en quelques mots (10 caractères minimum)."],
      ];
      for (const [cle, valide, message] of regles) {
        const champ = formulaire.elements[cle];
        const valeur = String(donnees[cle] || "");
        const bon = valide(valeur);
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

    formulaire.addEventListener("submit", async (evenement) => {
      evenement.preventDefault();
      const donnees = lire(formulaire);
      if (!verifier(donnees)) return;
      if (boutonEnvoi) boutonEnvoi.disabled = true;
      dire("Envoi en cours…");
      let messageServeur = "";
      try {
        const reponse = await fetch(api + "/message.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(donnees),
        });
        const resultat = await reponse.json().catch(() => ({}));
        if (!reponse.ok || resultat.ok !== true) {
          messageServeur = typeof resultat.erreur === "string" ? resultat.erreur : "";
          throw new Error("envoi refuse");
        }
        const pourLeVisiteur = String(donnees.email || "").trim();
        formulaire.reset();
        majDepart(formulaire);
        dire((resultat.message || "Message envoyé. Je vous réponds sous 48 heures.") +
          (pourLeVisiteur
            ? " Un accusé de réception vient d’être envoyé à " + pourLeVisiteur + "."
            : ""), "aide-ok");
      } catch (erreur) {
        window.console.warn("Formulaire de contact : envoi impossible.", erreur);
        montrerSecours();
        dire(messageServeur ||
          "L’envoi automatique n’a pas abouti. Utilisez « Ouvrir mon logiciel de messagerie » " +
          "ou « Copier le message », ou écrivez à " + ADRESSE + ".", "aide-souci");
      } finally {
        if (boutonEnvoi) boutonEnvoi.disabled = false;
      }
    });

    // Bouton de secours : le lien mailto est construit au moment du clic, avec le
    // contenu deja saisi, pour que le visiteur retrouve son message ecrit.
    if (boutonMail) {
      boutonMail.addEventListener("click", () => {
        const donnees = lire(formulaire);
        boutonMail.href = "mailto:" + ADRESSE
          + "?subject=" + encodeURIComponent(libelle(dictionnaire, donnees.type))
          + "&body=" + encodeURIComponent(corpsMessage(donnees, dictionnaire));
      });
    }

    if (boutonCopie) {
      boutonCopie.addEventListener("click", async () => {
        try {
          const donnees = lire(formulaire);
          await navigator.clipboard.writeText(
            "À : " + ADRESSE + "\n\n" + corpsMessage(donnees, dictionnaire));
          boutonCopie.textContent = "Message copié !";
          dire("Collez-le dans un email adressé à " + ADRESSE + ".");
          window.setTimeout(() => {
            boutonCopie.textContent = "Copier le message";
          }, 2500);
        } catch (erreur) {
          boutonCopie.textContent = "Copie impossible";
        }
      });
    }

    return { preparer: () => majDepart(formulaire), dire };
  }

  // --- La fenetre de contact -------------------------------------------------
  const modale = document.getElementById("modaleContact");
  const formulairePage = document.querySelector("form.form[data-api]");

  if (modale) {
    const boite = modale.querySelector(".modale-boite");
    const formulaireModale = modale.querySelector("form");
    const outils = brancherFormulaire(formulaireModale);
    let declencheur = null;

    const ouvrir = (type, source) => {
      declencheur = source || null;
      const select = formulaireModale.querySelector('select[name="type"]');
      if (type && select && Array.from(select.options).some((o) => o.value === type)) {
        select.value = type;
      }
      outils.preparer();
      modale.hidden = false;
      document.body.classList.add("modale-ouverte");
      const premier = formulaireModale.querySelector(
        'input:not([type="hidden"]), select, textarea');
      if (premier) premier.focus();
    };

    const fermer = () => {
      modale.hidden = true;
      document.body.classList.remove("modale-ouverte");
      if (declencheur && declencheur.focus) declencheur.focus();
      declencheur = null;
    };

    // Ouverture : boutons du site et lien du pied de page.
    // Un type demande dans l'adresse (services.html?type=note) n'ouvre pas la
    // fenetre tout seul : il la reglera si le visiteur l'ouvre lui-meme.
    const demandeAdresse = new URLSearchParams(window.location.search).get("type") || "";
    document.addEventListener("click", (evenement) => {
      const bouton = evenement.target.closest("[data-ouvrir-contact]");
      if (!bouton) return;
      evenement.preventDefault();
      ouvrir(bouton.getAttribute("data-ouvrir-contact") || demandeAdresse, bouton);
    });

    // Fermeture : croix, fond assombri, touche Echap.
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
        'a[href], button:not([disabled]), input:not([type="hidden"]), select, textarea'));
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

    // Arrivee depuis un lien d'une autre page : le type demande dans l'adresse
    // reglera la fenetre des que le visiteur l'ouvrira (voir le clic ci-dessus).
  } else if (formulairePage) {
    // Page de contact : le formulaire est deja la. Le lien du pied de page y
    // conduit le curseur, sans recharger la page.
    brancherFormulaire(formulairePage);

    // contact.html?type=conference : le type vient du bouton clique ailleurs.
    const demande = new URLSearchParams(window.location.search).get("type");
    const select = formulairePage.querySelector('select[name="type"]');
    if (demande && select && Array.from(select.options).some((o) => o.value === demande)) {
      select.value = demande;
    }

    document.addEventListener("click", (evenement) => {
      const lien = evenement.target.closest(".site-footer [data-ouvrir-contact]");
      if (!lien) return;
      evenement.preventDefault();
      formulairePage.scrollIntoView({ behavior: "smooth", block: "center" });
      const premier = formulairePage.querySelector(
        'input:not([type="hidden"]), select, textarea');
      if (premier) premier.focus();
    });
  }

})();


