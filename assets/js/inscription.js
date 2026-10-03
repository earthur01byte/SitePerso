/**
 * Fenetre d'inscription du site (LOT 34).
 *
 * Deux usages partagent exactement le meme code :
 *   - « Me prevenir a la sortie » du livre a paraitre (index.html, ressources.html) ;
 *   - « Demander la note » : le PDF de la note IFRI s'ouvre apres l'inscription.
 *
 * Le visiteur laisse un prenom et un email. L'API (api.arthurdelassus.com)
 * enregistre l'inscription dans une liste et me previent par email : la liste
 * reste consultable, elle n'est pas perdue dans une boite de reception.
 * Le visiteur ne quitte pas la page qu'il lisait.
 *
 * Le formulaire porte « data-api-inscription » et non « data-api » : le
 * formulaire de contact (contact.js) selectionne « form.form[data-api] » et
 * ne doit pas prendre cette fenetre-ci pour le formulaire de la page.
 */
(() => {
  "use strict";

  const modale = document.getElementById("modaleInscription");
  if (!modale) return;

  const boite = modale.querySelector(".modale-boite");
  const formulaire = modale.querySelector("form");
  const api = (modale.getAttribute("data-api") || "").replace(/\/+$/, "");
  const titre = document.getElementById("inscriptionTitre");
  const intro = document.getElementById("inscriptionIntro");
  const bouton = formulaire.querySelector('button[type="submit"]');
  const actions = formulaire.querySelector(".hero-actions");
  const statut = formulaire.querySelector("[data-statut]");
  const champOrigine = formulaire.querySelector('[name="origine"]');
  const champDepart = formulaire.querySelector('[name="depart"]');
  const suite = modale.querySelector("[data-inscription-suite]");
  const suiteTexte = modale.querySelector("[data-inscription-suite-texte]");
  const suiteFichier = modale.querySelector("[data-inscription-fichier]");

  /** Ce que le visiteur lit, selon ce qu'il est venu chercher. */
  const TEXTES = {
    livre: {
      titre: "Me prévenir à la sortie",
      intro:
        "Laissez votre prénom et votre email : je vous écris le jour de la sortie de " +
        "« L’écologie sans les mythes ». C’est tout, et un mot suffit pour vous désinscrire.",
      action: "Prévenez-moi",
      merci: "C’est noté : vous serez prévenu dès la sortie du livre.",
    },
    "note-ifri": {
      titre: "Recevoir la note",
      intro:
        "Laissez votre prénom et votre email : le téléchargement de la note s’ouvre aussitôt. " +
        "Aucun email ne vous sera envoyé : votre adresse me dit simplement qui s’y intéresse.",
      action: "Recevoir la note",
      merci: "Merci ! La note est prête à être téléchargée ci-dessous.",
    },
  };

  const DEFAUT = "livre";
  const texteDe = (origine) => TEXTES[origine] || TEXTES[DEFAUT];

  let declencheur = null;

  const majDepart = () => {
    if (champDepart) champDepart.value = String(Math.floor(Date.now() / 1000));
  };

  const dire = (message, genre) => {
    if (!statut) return;
    statut.textContent = message;
    statut.classList.remove("aide-ok", "aide-souci");
    if (genre) statut.classList.add(genre);
  };

  /** Remet la fenetre dans son etat d'accueil (formulaire vierge, suite cachee). */
  const remettre = () => {
    formulaire.reset();
    majDepart();
    dire("");
    if (actions) actions.hidden = false;
    formulaire.querySelectorAll("input, button").forEach((champ) => {
      champ.disabled = false;
    });
    if (suite) suite.hidden = true;
    if (suiteFichier) {
      suiteFichier.hidden = true;
      suiteFichier.setAttribute("href", "#");
    }
  };

  const ouvrir = (origine, source) => {
    declencheur = source || null;
    const texte = texteDe(origine);
    if (champOrigine) champOrigine.value = TEXTES[origine] ? origine : DEFAUT;
    if (titre) titre.textContent = texte.titre;
    if (intro) intro.textContent = texte.intro;
    if (bouton) bouton.textContent = texte.action;
    remettre();
    modale.hidden = false;
    document.body.classList.add("modale-ouverte");
    const premier = formulaire.querySelector('input:not([type="hidden"])');
    if (premier) premier.focus();
  };

  const fermer = () => {
    modale.hidden = true;
    document.body.classList.remove("modale-ouverte");
    if (declencheur && declencheur.focus) declencheur.focus();
    declencheur = null;
  };

  const verifier = (donnees) => {
    const champs = [
      ["nom", (v) => v.trim().length >= 2, "Indiquez votre nom."],
      ["email", (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()),
        "Cette adresse email ne semble pas valide."],
    ];
    for (const [cle, valide, message] of champs) {
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

  formulaire.addEventListener("submit", async (evenement) => {
    evenement.preventDefault();
    const donnees = Object.fromEntries(new FormData(formulaire).entries());
    if (!verifier(donnees)) return;
    if (bouton) bouton.disabled = true;
    dire("Envoi en cours…");

    try {
      const reponse = await fetch(api + "/inscription.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(donnees),
      });
      const resultat = await reponse.json().catch(() => ({}));
      if (!reponse.ok || resultat.ok !== true) {
        throw new Error(
          typeof resultat.erreur === "string" ? resultat.erreur : "inscription refusee"
        );
      }
      const texte = texteDe(String(donnees.origine || DEFAUT));
      dire(texte.merci, "aide-ok");
      if (actions) actions.hidden = true;
      formulaire.querySelectorAll('input:not([type="hidden"])').forEach((champ) => {
        champ.disabled = true;
      });
      if (suite && suiteTexte) {
        suiteTexte.textContent = texte.merci;
        suite.hidden = false;
      }
      // Le fichier a telecharger vient du bouton clique : la fenetre sert
      // aussi bien le livre (aucun fichier) que la note IFRI (un PDF).
      const fichier = declencheur ? declencheur.getAttribute("data-fichier") : "";
      if (suiteFichier && fichier) {
        suiteFichier.setAttribute("href", fichier);
        suiteFichier.hidden = false;
      }
    } catch (erreur) {
      window.console.warn("Fenetre d'inscription : envoi impossible.", erreur);
      if (bouton) bouton.disabled = false;
      dire(
        "L’envoi automatique n’a pas abouti. Écrivez-moi à arthur@arthurdelassus.com " +
          "et je vous réponds personnellement.",
        "aide-souci"
      );
    }
  });

  document.addEventListener("click", (evenement) => {
    const ouverture = evenement.target.closest("[data-ouvrir-inscription]");
    if (!ouverture) return;
    evenement.preventDefault();
    ouvrir(ouverture.getAttribute("data-ouvrir-inscription") || DEFAUT, ouverture);
  });

  modale.addEventListener("click", (evenement) => {
    if (evenement.target.closest("[data-inscription-fermer]")) fermer();
  });
  window.addEventListener("keydown", (evenement) => {
    if (evenement.key === "Escape" && !modale.hidden) fermer();
  });

  // Le focus reste dans la fenetre tant qu'elle est ouverte (touche Tab).
  modale.addEventListener("keydown", (evenement) => {
    if (evenement.key !== "Tab") return;
    const focusables = Array.from(
      boite.querySelectorAll(
        'a[href], button:not([disabled]), input:not([type="hidden"]):not([disabled])'
      )
    ).filter((element) => !element.hidden && element.offsetParent !== null);
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
