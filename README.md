# arthurdelassus.com (site statique)

Site simple en **8 pages** :

- Accueil (`index.html`)
- Manifeste (`manifeste.html`)
- Agriculture (`agriculture.html`)
- Services (`services.html`)
- Ressources, billets masqués (`ressources.html`)
- Climatisation (`climatisation.html`) : plaidoyer « Pour un droit à la fraîcheur »
- Contact (`contact.html`)
- Confidentialité (`confidentialite.html`)

`fraicheur.html` est l'ancienne adresse du plaidoyer : la page redirige vers
`climatisation.html`.

## Prévisualiser en local

Option 1 (le plus simple) : double-cliquer sur `index.html`.

Option 2 (recommandé pour éviter les soucis de chemins) :

```bash
python -m http.server 5500
```

Puis ouvrir `http://localhost:5500`.

## À personnaliser

- Email et lien LinkedIn : `contact.html`
- Articles : section « Mes billets » de `ressources.html`, **masquée** le 25/09/2026
  (bloc entre `<!-- SECTION MASQUEE` et le `-->` suivant) : à réécrire avant réactivation

## Page Services (refonte du 25/09/2026, LOT 24)

Le bloc « Qui je suis » a été retiré : il faisait doublon avec `manifeste.html` et
l'accueil. La page décrit désormais **cinq offres**, chacune avec son logo, ses
références (logos des organisations) et un encadré « En pratique » (durée, effectif,
langues, tarif) :

| Offre | Ancre | Logo de l'offre |
| --- | --- | --- |
| Horizons Décarbonés | `#horizons-decarbones` | `Images/logo_HD_transparent.png` |
| La Fresque des frontières planétaires | `#frontieres-planetaires` | `Images/Logo_FdFP.png` |
| Conférences et interventions | `#conferences` | (aucun) |
| Cours et formation | `#cours` | (aucun) |
| Notes et expertise | `#notes` | (aucun) |

Les liens venant de `index.html` et `agriculture.html` pointent sur
`#horizons-decarbones`. Les bandes de logos des offres contiennent les
organisations les plus significatives.

Contrôles du lot (dans `_outils_siteperso/`) : `verif_lot24.py` (ancres, images,
résidus, équilibre des balises), `diag_largeur_services.py` (débordement horizontal
de 1440 à 390 px), `shot_lot24.py` (captures, à lancer via `lancer_shot.py` pour un
journal UTF-8 fiable).

## Page Services (retouches du 25/09/2026, LOT 25)

- Chaque atelier commence par un **bloc d'en-tête** : pastille (« Créateur » /
  « Cocréateur ») et titre à gauche, logo à droite (`.offer-head`).
- Logos des ateliers : `Images/logo_HD_transparent.png` pour Horizons Décarbonés,
  `Images/Logo_FdFP.png` pour la Fresque des frontières planétaires. Les anciens
  noms (`Horizons_Décarbonés.png`, `Fresque_des_frontières_planétaires.png`) ont
  été mis à jour partout, y compris sur `index.html`, `agriculture.html` et
  `ressources.html`.
- `Images/logo_HD.png` est le fichier fourni (fond bleu-gris opaque) : il est
  conservé tel quel, et `detourer_logo_hd.py` en dérive la version détourée
  utilisée par le site.
- Le **schéma des neuf frontières planétaires**
  (`Images/Frontières_planétaires.webp`) illustre la section de la fresque.
- Bandeaux de logos complétés : Quantis (fresque) ; CNFPT, UniLaSalle et CRÉDOC
  (conférences).
- « Mes conférences » devient **« Conférences et interventions »**, avec une
  intervention supplémentaire (« Pour une vision systémique de la transition
  écologique ! »). Les intitulés de conférences, de cours et de travaux passent en
  gras noir, la phrase de conclusion en gris (`.help`).
- Les encadrés « En pratique » sont alignés en bas de leur colonne
  (`.offer-facts`) : leur bouton tombe au niveau du bas du texte.
- Les sections **« Ils m'ont fait confiance »** et **« Pour qui ? »** sont
  supprimées, avec leur CSS (`.services-clients`, `.client-logos`,
  `.services-audience-grid`, `.audience-card`). ADEME, HEC et EDF ne sont plus
  affichés ; CNFPT est passé dans le bandeau des conférences.
- Alternance des fonds : Horizons (blanc) / Fresque (beige) / Conférences
  (blanc) / Cours (beige) / Notes (blanc).

Contrôles du lot : `verif_lot25.py` (logos présents, sections retirées, en-têtes
d'offre, tirets).

## Page Services (retouches du 25/09/2026, LOT 26)

- Les encadrés « En pratique » ne s'étirent plus sur toute la hauteur de la
  section : la carte ne fait que la hauteur de son contenu et reste collée au
  bas de la section (`.offer-side` + `justify-content:flex-end`).
- La colonne de droite de chaque offre accueille donc une **photo** au-dessus de
  l'encadré : `Images/HD_participants.jpg` pour Horizons Décarbonés (LOT 28,
  qui remplace `Images/HD_atelier.jpg`), `Images/Arthur_conference.jpg`
  (conférences) et, depuis le LOT 27, `Images/Arthur_FdFP.jpg` (fresque).
- La fresque recevait `Images/Arthur_FdFP.jpg` dans sa colonne de texte, à
  l'emplacement libéré par le schéma ; le LOT 27 a inversé les deux (schéma à
  gauche, photo à droite).
- Bandeaux de logos ramenés à une seule ligne : Omexom et Vinci Énergies sont
  retirés du bandeau de la fresque (la mention reste dans le texte), CNFPT est
  retiré du bandeau des conférences.
- `optimize_services_photos.py` dérive les trois photos web depuis les fichiers
  fournis (JPEG qualité 82, largeur max 900 px, originaux conservés) : 4,4 Mo
  d'origine, 279 Ko au final.
- Sous 900 px, la colonne de droite repasse en simple empilement (photo puis
  encadré).

Contrôles du lot : `shot_lot26.py` (captures par section à 1440 px et mobile
390 px, à lancer via `lancer_shot.py`), `diag_largeur_services.py` (aucun
débordement horizontal de 1440 à 390 px).

## Page Services (retouches du 25/09/2026, LOT 27)

- Les deux visuels de la Fresque des frontières planétaires ont **changé de
  colonne** : le schéma des neuf frontières planétaires est désormais dans la
  colonne de texte de la fresque, à l'emplacement qu'occupait la photo, et
  `Images/Arthur_FdFP.jpg` passe dans la colonne de droite, au-dessus de
  l'encadré « En pratique » (comme les autres offres).
- Le schéma est réduit de moitié : `.offer-schema--inline img` plafonne à
  215 px de large (contre 430 px pour `.offer-schema`), centré, soit 215x208 px
  rendus au lieu de 430x415 px.
- `.offer-photo--inline` (la variante créée au LOT 26 pour la photo dans la
  colonne de texte) et `.offer-side .offer-schema` sont supprimées, plus rien ne
  les utilisant.

Contrôles du lot : `verif_lot27.py` (taille et position rendues des deux
visuels à 1440 px et sous 900 px), `shot_lot27.py` (capture de la section de la
fresque à 1440 px et mobile 390 px, via `lancer_shot.py`),
`diag_largeur_services.py` (aucun débordement horizontal de 1440 à 390 px).

## Logos et photo de l'atelier (retouches du 25/09/2026, LOT 28)

- La photo de l'offre Horizons Décarbonés devient `Images/HD_participants.jpg`
  (participants réunis autour de la table, écran « Créez votre persona »). Elle
  est dérivée du fichier fourni `Images/HD_participants.png` (1672x941, 2,2 Mo)
  par `optimize_hd_participants.py` : 900x507, JPEG qualité 82, 86 Ko, original
  conservé. `Images/HD_atelier.jpg` n'est plus référencé par le site.
- **Tous les logos du site ont désormais un fond transparent** : 17 fichiers
  dérivés en `Images/<nom>_transparent.png` par `detourer_logos.py`. Les
  originaux restent en place (quatre d'entre eux sont des JPEG, sans canal
  alpha) et les pages ne pointent plus que vers les versions détourées, via
  `remplacer_refs_logos.py` (33 références dans `index.html`,
  `ressources.html` et `services.html`).
- Méthode : le blanc **relié aux bords** devient transparent (parcours en largeur
  depuis les quatre bords sur les pixels quasi blancs), puis le premier anneau de
  pixels est mis en semi-transparence selon sa luminosité, ce qui efface le
  liseré d'anti-aliasing et le bruit des JPEG. Les blancs *intérieurs* au dessin
  sont préservés : contres-lettres (les trous des o et des D) et figures blanches
  (le Bibendum de Michelin, les lettres blanches de Quantis ou de Valence Romans
  Agglo) restent opaques, ce qui évite qu'elles disparaissent sur fond sombre.
- Cas particulier : le panneau blanc enfermé dans le cadre du logo ADEME n'était
  pas relié aux bords ; une graine de détourage explicite (`GRAINES` dans
  `detourer_logos.py`) le traite, soit 14,6 % de l'image en plus.
- Les logos qui portent leur propre aplat de couleur (Décathlon, EM Normandie)
  sont laissés tels quels : leur fond n'est pas blanc. `Images/Omexom_logo.png`
  et `Images/logo_HD.png` ne sont utilisés par aucune page.
- Les JPEG détourés sont enregistrés en PNG à palette (128 couleurs, alpha
  conservé) : sans cela le bruit de compression resterait encodé tel quel et le
  PNG pèserait cinq fois plus lourd que l'original.

Contrôles du lot : `inventaire_logos.py` (recensement des logos référencés, mode,
transparence, pages), `verif_lot28.py` (0 lien mort, 33 références basculées,
transparence réelle de chaque fichier, tirets), `_diag_interieurs.py` (zones
claires internes restantes), `shot_lot28.py` (planches « avant / après » des
17 logos à taille réelle et en zoom 2x, sur fond crème et fond sombre, bandeaux
de l'accueil et des services à 1440 px, mobile 390 px).

## Ponctuation : plus de tiret cadratin

Le site n'utilise plus de tiret cadratin (—). Selon son rôle dans la phrase, il est
remplacé par un deux-points, une virgule ou des parenthèses ; les titres de page
utilisent la barre verticale (« Arthur de Lassus | Services »).
`nettoyer_tirets.py` applique et contrôle cette convention, `verif_lot25.py` la
vérifie page par page.

## Domaine, compteur d'années et ménage (26/09/2026, LOT 30)

- **Le domaine du site est `arthurdelassus.com`**, le `.fr` n'existe pas. Les 54
  occurrences de `.fr` ont été basculées (canonical, `og:url`, `og:image`,
  `twitter:image` et identifiants JSON-LD des 8 pages, les 7 adresses de
  `sitemap.xml`, la ligne `Sitemap:` de `robots.txt`, le titre du README, un
  commentaire de `styles.css`). Conséquence concrète corrigée : les aperçus de
  partage sur LinkedIn, X ou WhatsApp pointaient vers un domaine inexistant et
  s'affichaient **sans image** ; Google était invité à indexer une adresse
  morte, en contradiction avec le `CNAME` du dépôt.
- **Adresse de contact publique : `arthur@arthurdelassus.com`** (11 occurrences
  de l'adresse Gmail remplacées : JSON-LD de `index.html` et `services.html`,
  liens `mailto:` de `ressources.html` et `contact.html`).
- **Compteur d'années d'expérience** : `index.html` remplace la statistique
  « 2020 début du maraîchage bio sur sol vivant » par « 7 années d'expérience
  agricole » (`id="annees-agri"`), et `agriculture.html` ajoute une entrée dans
  la liste de repères du héros (`.ferme-hero-facts`, `id="annees-maraichage"`,
  « 7 années de maraîchage »). La valeur se calcule en JavaScript avec
  `année courante - 2019` : 7 en 2026, 8 en 2027, 9 en 2028, sans intervention.
  Le nombre écrit dans le HTML n'est qu'un repli sans JavaScript et la valeur
  lue par les moteurs de recherche ; `verif_lot30.py` alerte quand il devient
  périmé. Les repères factuels « depuis 2020 » d'`agriculture.html` sont
  conservés (badge du héros, liste de repères, bande de chiffres), et la bande
  « La ferme en chiffres » reste à 8 cartes, donc équilibrée en 4x2.
- **Manifeste** : « Des canicules en série et **une** sécheresse inédite par son
  intensité et sa durée **ont** mis à genou le secteur agricole. »
- **Ménage** : les quatre sources lourdes non suivies par git
  (`Atelier_HD.jpg`, `HD_participants.png`, `Arthur_FdFP.png`,
  `Arthur_conférence.png`, 5,9 Mo au total) sont sorties du site et vivent
  désormais dans `C:\Users\earth\Desktop\Cursor_Cline\Sources_siteperso`, hors
  du dossier publié. Les trois restes de
  tests `_tmp_*.html` sont supprimés, et `Todo/` (deux captures d'écran) a été
  recopié dans `Sources_siteperso\_archive_Todo` puis supprimé du site. Le
  dépôt ne contient plus aucun fichier non suivi par git.

### Pièges consignés au LOT 30

1. **Fins de ligne** : un fichier lu en mode texte puis réécrit avec
   `newline="\n"` perd un octet par ligne s'il était en CRLF (`styles.css` a
   ainsi « maigri » de 3 183 octets sans que git ne voie rien, la normalisation
   automatique masquant le changement). Les remplacements de texte utilisent
   donc `newline=""` en lecture comme en écriture, et
   `restaurer_fins_de_ligne.py` remet les fichiers concernés en CRLF.
2. **Défilement et captures** : le site est en `scroll-behavior: smooth`, et en
   Chrome headless un défilement animé ne progresse pas dans le temps virtuel ;
   de plus `--screenshot` capture toujours le haut de la page. Les pages
   contenant des sections en `100vh`, une fenêtre très haute déforme tout.
   `shot_lot30.py` amène donc le bloc visé en haut par une transformation CSS
   (aucun reflow, le rendu reste celui d'une fenêtre réelle).
3. **Fenêtre minimale de Chrome** : la largeur ne descend pas sous 500 px, le
   rendu à 390 px passe par un cadre `iframe` de 390 px (même méthode qu'au
   LOT 28), avec un relevé du débordement horizontal dans le document interne.

Contrôles du lot : `verif_lot30.py` (résidus de domaine et d'adresse, cohérence
canonical/og/CNAME, phrase du manifeste, présence et valeur des deux compteurs,
ménage, liens d'images, tirets), `basculer_domaine.py` (bascule et contrôle des
adresses déclarées), `menage_lot30.py`, `diag_largeur_agriculture30.py`
(débordement de 1440 à 360 px), `shot_lot30.py` (captures du bandeau de
l'accueil et des repères du héros, zoom 2x, écran 390 px, et contrôle
fonctionnel du compteur lu dans le navigateur).


## Formulaire de contact et backend PHP (26/09/2026, LOT 31)

Le formulaire de `contact.html` n'ouvre plus de logiciel de messagerie : il
envoie la demande à une petite API PHP, qui expédie deux emails depuis
`arthur@arthurdelassus.com` (un pour Arthur, un accusé de réception pour le
visiteur). Le site reste entièrement statique.

**Côté site**

- Trois champs utiles (nom, email, type de demande, message) et deux champs
  techniques : un champ piège invisible (`site_web`) et l'heure d'arrivée sur la
  page (`depart`).
- L'envoi se fait en `fetch` vers `https://api.arthurdelassus.com/message.php`,
  adresse déclarée une seule fois dans l'attribut `data-api` du formulaire :
  changer de serveur = changer cet attribut.
- La logique vit dans `assets/js/main.js` (même endroit que le filtre des
  ressources), sous `// --- Formulaire de contact ---`, et les styles en fin de
  `styles.css` (champ piège, champs en erreur, messages de retour).
- Les messages de retour sont annoncés (`aria-live`), les champs fautifs
  reçoivent `aria-invalid="true"` et une bordure rouge, le bouton se désactive
  pendant l'envoi.
- Repli si l'API ne répond pas : le message du serveur est affiché, sinon un
  texte qui renvoie vers l'adresse email, et le bouton « Copier le message »
  reste disponible.
- Onze boutons de `index.html`, `services.html` et `agriculture.html` appellent
  désormais `contact.html?type=...#formulaire` : le type de demande arrive
  pré-choisi et la page défile jusqu'au formulaire (« Organiser cet atelier » →
  atelier, « Réserver une conférence » → conférence, « Construire mon séminaire
  au vert » → séminaire, etc.).

**Côté hébergement** (dossier hors du dépôt :
`C:\Users\earth\Desktop\Cursor_Cline\Backend_siteperso`)

```
api/       message.php + .htaccess        (racine du sous-domaine)
lib/       config, SMTP, validation, modeles d'emails + .htaccess « Require all denied »
outils/    diagnostic.php, test_envoi.php (proteges par une cle)
journal/   journaux et brouillons du mode test + .htaccess
```

- Client SMTP maison (`lib/smtp.php`) : `mail.infomaniak.com`, port 465 en SSL,
  authentification par mot de passe d'application. Aucune bibliothèque externe.
- `mode_test` à `true` par défaut : les emails sont écrits dans `journal/mails/`
  au lieu d'être envoyés, ce qui permet d'essayer le parcours complet sans rien
  expédier. `outils/diagnostic.php` et `outils/test_envoi.php` valident
  l'installation depuis le navigateur.
- Protection : validation serveur, champ piège, contrôle du temps de
  remplissage, cinq envois par heure et par adresse IP, journaux purgés au-delà
  de douze mois.
- Le mode d'emploi détaillé (sous-domaine, mot de passe d'application, dépôt
  FTP, dépannage) est dans `Backend_siteperso/README.md`.

### Filet de sécurité tant que l'API n'est pas en place

Le site est publié par GitHub Pages, qui n'exécute aucun code : le backend vit
forcément ailleurs (voir `Backend_siteperso\CHOIX_HEBERGEMENT.md` pour les
chemins possibles et `INSTALLATION.md` pour la procédure). Tant qu'il n'existe
pas, l'envoi automatique échoue ; plutôt que de laisser le visiteur dans une
impasse, le formulaire révèle alors un troisième bouton, « Ouvrir mon logiciel de
messagerie », dont le lien `mailto:` est construit au moment du clic avec le
contenu déjà saisi (nom, email, type, message). Le message peut donc toujours
partir : par l'API, par le logiciel de messagerie du visiteur, ou par
copier-coller. Le bouton reste masqué dans tous les autres cas (scénarios 3 et 5
de `test_contact31.py`, et capture `formulaire-secours.png`).

### Architecture retenue : Netlify + SMTP Infomaniak

Le site étant publié par GitHub Pages (qui n'exécute aucun code), le backend vit
dans un dossier séparé, `C:\Users\earth\Desktop\Cursor_Cline\Backend_Netlify` :
des fonctions Netlify (offre gratuite, usage professionnel autorisé) qui envoient
par le **SMTP d'Infomaniak**, déjà aligné avec le SPF du domaine, ce qui évite de
toucher au DNS alors que le DMARC est en `p=reject`. `api.arthurdelassus.com`
s'obtient par un simple CNAME, sans déplacer le DNS ni toucher à GitHub Pages.

Les chemins publics restent `message.php`, `diagnostic.php` et `test_envoi.php` :
le site n'a donc rien à changer, et la version PHP écrite au même moment (dossier
`Backend_siteperso`, pour un hébergement Infomaniak) reste utilisable telle quelle
si l'architecture évolue un jour.

- Procédure de mise en ligne : `Backend_Netlify\INSTALLATION_NETLIFY.md`.
- Comparaison des quatre architectures possibles (coûts, effort, réservation) :
  `Backend_siteperso\CHOIX_HEBERGEMENT.md`.
- Vérifications : `Backend_Netlify\outils\essai_local.js` (banc Node, 47
  contrôles, aucun envoi réseau), `test_contact31_js.py` (le vrai navigateur
  envoie au vrai backend, cinq scénarios) et `verif_lot31b.py` (tour complet).

### Pièges consignés au LOT 31

1. **PHP n'est pas installé sur la machine** : impossible de lancer le moindre
   `php -l`. Le backend est donc contrôlé par `verifier_php.py` (en-tête des
   fichiers, équilibre des délimiteurs hors chaînes et commentaires, fichiers
   inclus, fonctions maison appelées mais non définies, doublons), et le
   **contrat de l'API est reproduit en Python** dans `test_contact31.py` : même
   URL, mêmes codes (200/422/503), même forme de réponse. Chrome remplit alors
   vraiment le formulaire et l'on vérifie ce qui est envoyé et ce qui s'affiche.
   La validation définitive reste à faire sur Infomaniak avec
   `outils/diagnostic.php`.
2. **Positions de remplacement** : parcourir `finditer` sur une chaîne que l'on
   modifie au fil de la boucle décale les positions suivantes et produit des
   remplacements corrompus (c'est ainsi que `services.html` s'est retrouvé avec
   une balise ouverte en trop, `</a></li>` orphelins et une accolade en
   désordre). Le script corrigé parcourt les correspondances **de la fin vers le
   début** et refuse toute correspondance dont le contenu dépasse 200 caractères
   ou contient un `<a `. Leçon : relancer `check_html.py` après toute retouche
   d'HTML par expression régulière, il détecte la casse.
3. **Page de contrôle** : `check_html.py` a signalé les deux balises orphelines
   avec leurs numéros de ligne, ce qui a permis de localiser le dégât en une
   minute. Les captures, elles, ne l'auraient pas montré.
4. **Fins de ligne** : l'éditeur écrit en CRLF, `normaliser_backend.py` remet
   les fichiers du backend en LF pour qu'ils restent comparables d'une fois sur
   l'autre.
5. **Le contrôle du style se fait dans le navigateur** : à l'œil, le vert et le
   rouge des messages paraissaient identiques sur une petite capture ;
   `controle_couleurs31.py` lit la couleur calculée par Chrome
   (`rgb(28, 124, 74)`, `rgb(179, 38, 30)`) et confirme aussi que le champ piège
   reste hors écran.

Contrôles du lot : `verif_lot31.py` (formulaire sans mailto, sept types
identiques côté site et côté backend, onze liens pré-remplis, équilibre de
`main.js` et de `styles.css`, contrôles statiques du backend, absence de renvoi
vers `reservation.html`), `verifier_php.py`, `test_contact31.py` (quatre
scénarios joués dans Chrome), `controle_couleurs31.py`, `shot_lot31.py`
(captures du formulaire vierge, après envoi, en erreur, avec type pré-rempli, et
en 390 px). Résultats : `TOUT EST OK` pour les trois vérifications de la série
(`verif_lot31.py`, `check_html.py`, `check_site.py`).


## Contact dans le pied de page et en fenêtre (LOT 33, 27/09/2026)

Le lien « Contact » a quitté le menu du haut : il figure maintenant **à droite du
pied de page de chaque page**, et les boutons du site (`Organiser un atelier`,
`Réserver une conférence`, `Demander une note`, `Me contacter`…) ouvrent une
**fenêtre** par-dessus la page en cours, sans changer d'adresse.

| Élément | Où | Rôle |
| --- | --- | --- |
| `assets/js/contact.js` | les 7 pages | formulaire partagé et fenêtre |
| `#modaleContact` | 6 pages (hors `contact.html`) | la fenêtre et son formulaire |
| `.footer-contact` | les 7 pages | le lien, à droite du pied de page |

Points de conception :

- **Un seul code pour les deux emplacements** : `contact.js` branche tout
  formulaire portant `data-api` — celui de `contact.html` comme celui de la
  fenêtre. L'ancien bloc a été retiré de `main.js`.
- **Le type de demande suit le bouton** : `data-ouvrir-contact="note"` règle le
  menu déroulant à l'ouverture. Le `href` vers `contact.html?type=...` est
  conservé : sans JavaScript, le visiteur arrive sur la page de contact.
- **Le lien du pied de page** ouvre la fenêtre ; sur `contact.html`, qui n'en a
  pas, il conduit le curseur au formulaire de la page.
- **Le message de succès annonce l'accusé de réception** — « Un accusé de
  réception vient d'être envoyé à … ». Cet accusé existe déjà côté backend
  (`lib/emails.js`, fonction `emailAccuse`) ; il est désormais visible pour le
  visiteur.
- **Accessibilité** : `role="dialog"`, `aria-modal`, fermeture par Échap, par la
  croix ou par le fond assombri, focus placé dans la fenêtre puis rendu au
  bouton d'origine, défilement de la page bloqué pendant l'ouverture.
- Sur téléphone (≤ 640 px), la fenêtre occupe tout l'écran et les boutons
  s'empilent.

Contrôles du lot : `_lot33_modale.py` (transformations, idempotentes),
`test_contact33.py` (Chrome : deux pages, ouverture, type pré-rempli, envoi,
message affiché, fermeture, captures dont le pied de page), `test_contact31.py`
(non-régression du formulaire en page), `check_html.py`, `check_site.py`.

Pièges consignés :

1. Assembler un fichier JavaScript par morceaux a consommé la fermeture de
   l'IIFE dans `contact.js` : `node --check` l'a signalé tout de suite —
   contrôler la syntaxe après tout assemblage.
2. L'ordre des attributs des boutons varie d'une page à l'autre (`class` avant ou
   après `href`) : la détection porte donc sur la balise entière, jamais sur une
   suite d'attributs.
3. Le type pré-rempli par l'adresse (`contact.html?type=conference`) était porté
   par l'ancien bloc de `main.js` : sa suppression l'a fait disparaître, et
   `test_contact31.py` l'a vu aussitôt. Comportement rétabli dans `contact.js`.


## Page « Confidentialité » (LOT 32, 28/09/2026)

`confidentialite.html` a été créée pour **deux raisons** : le RGPD — le site
collecte déjà des données, et les rendez-vous du LOT 32 en collecteront d'autres —
et la **validation du branding Google**, qui exige une page de règles de
confidentialité hébergée sur le domaine du site et liée depuis celui-ci. Le champ
des règles de confidentialité pointait jusqu'ici vers `index.html`, ce que Google
a refusé (« ne contient pas suffisamment de contenu »).

- La page reprend le gabarit des pages de contenu :
  `.container.container-narrow.article`, titre `.section-title`, listes `ul.clean`,
  `.article-foot` en fin de page.
- Elle est liée depuis le **pied de page des 7 autres pages**, avant
  « Me contacter ». `.footer-contact` devient une ligne souple (`display:flex`,
  `gap`) pour que les deux liens s'espacent et passent à la ligne sur téléphone.
- Elle est déclarée dans `sitemap.xml` (priorité 0.3) et ajoutée aux listes `PAGES`
  de `check_html.py` et `check_site.py` : elle est contrôlée comme les autres.
- Elle porte la **fenêtre de contact** et charge `contact.js`, comme les autres
  pages.
- Elle est liée depuis le **pied de page de chaque page**, dont la nouvelle page
  « Prendre rendez-vous » (voir plus bas).

Ce qu'elle déclare, pour mémoire : responsable de traitement ; données collectées
(contact, rendez-vous, journaux techniques) ; finalités et bases légales ; durées
de conservation ; sous-traitants (Netlify, Infomaniak, Google) et transferts hors
Union européenne ; le point sur Google Agenda — **aucun compte Google demandé au
visiteur**, accès limité à mon seul agenda, avec la clause *Limited Use* exigée par
Google ; et l'absence totale de cookie, en signalant honnêtement que **Google Fonts**
reçoit l'adresse IP du visiteur sur chaque page.

> À vérifier de votre côté : les durées de conservation et la liste des
> prestataires. Si elles ne correspondent pas à votre pratique, dites-le moi et je
> corrige — c'est le seul endroit de la page où je ne peux pas trancher à votre
> place.

Contrôles du lot : `_lot32_confidentialite.py` (lien de pied de page sur les
7 pages, `sitemap.xml`, listes des vérificateurs — idempotent), `shot_lot32.py`
lancé par `lancer_shot.py` (mesure de la page, capture complète en 1440 px, pied de
page isolé en 1280 px et sur 390 px), `_diag_entete32.py` (comparaison de l'en-tête
avec celui de `index.html`), `check_html.py`, `check_site.py`, `test_contact33.py`.
Résultats : `TOUT EST OK` partout ; page mesurée à 1424 px de large pour une fenêtre
de 1440, donc aucun débordement horizontal.

### Page « Prendre rendez-vous » (LOT 32, suite)

La validation du branding a été refusée pour deux motifs nouveaux, sans rapport
avec la page de confidentialité : « votre page d'accueil n'explique pas
l'objectif de votre application » et « le nom d'application *Site
arthurdelassus.com* ne correspond pas à celui qui figure sur votre page
d'accueil ». Google demande que la page déclarée **identifie l'application ou la
marque** et **décrive ce qu'elle fait** (elle ne peut pas être une simple page de
connexion), et que le lien des règles de confidentialité y soit présent.

Une section avait d'abord été ajoutée à l'accueil pour y répondre. Arthur n'en a
pas voulu sur sa page d'accueil : elle est devenue la page
**`prendre-rendez-vous.html`**, qu'il déclarera dans la console Google comme page
d'accueil de l'application (le champ pointait jusque-là sur `index.html`).

- Elle reprend le gabarit des pages de contenu : `.container.container-narrow.article`,
  titre `.section-title`, chapô `.article-meta`, listes `ol.clean`, `.article-foot`
  pour les deux boutons. Aucune règle CSS nouvelle n'a été nécessaire : la classe
  `.hero-actions-centre`, posée pour la section, est retirée avec elle.
- Elle **nomme l'application** — `arthurdelassus.com`, dont le nom est « Arthur de
  Lassus » — et **décrit son objet** : créneaux libres lus dans Google Agenda,
  rendez-vous inscrit dans l'agenda, confirmation par email, aucun accès au compte
  Google du visiteur. Elle déroule la marche à suivre en quatre étapes et renvoie
  aux règles de confidentialité.
- Elle est liée depuis le **pied de page des huit autres pages**, avant « Me
  contacter » (trois liens : Confidentialité, Prendre rendez-vous, Me contacter),
  et déclarée dans `sitemap.xml` (priorité 0.6).
- Le bouton « Choisir un créneau » ouvre la **fenêtre de réservation** (voir la
  section « Fenêtre de rendez-vous » plus bas) ; le lien vers
  `contact.html#formulaire` reste posé à côté, pour les visiteurs sans JavaScript.

Reste à faire dans la console Google : *Nom de l'application* = **Arthur de
Lassus** (le libellé écrit sur cette page, comme `arthurdelassus.com`) et
*Page d'accueil de l'application* =
`https://arthurdelassus.com/prendre-rendez-vous.html`, puis resoumettre.

Contrôles : `_lot32_page_rdv.py` (idempotent : retrait de la section de l'accueil
et de sa règle CSS — les deux fichiers sont alors comparés **octet à octet** aux
sauvegardes prises avant, ce qui prouve que le retour en arrière est exact —,
lien de pied de page sur huit pages, `sitemap.xml`, listes des vérificateurs, puis
9 contrôles sur la page écrite : 9/9 au vert), `shot_lot32_rdv.py` lancé par
`lancer_shot.py` (page en 1440 px et sur 390 px, pied de page à trois liens en
1280 et 390 px ; document mesuré à 1424 px pour une fenêtre de 1440),
`check_live_branding32.py` (contrôle du site publié), `check_html.py` (9 pages),
`check_classes.py` (les deux nouvelles pages : 29 classes, toutes définies) et
`check_site.py`.

## Fenêtre de rendez-vous : la disposition de référence (LOT 32, 29/09/2026)

La fenêtre reprend la disposition des outils de réservation — celle d'un agenda
en ligne — dans les couleurs du site : terre cuite, crème, Lora.

| Colonne | Contenu |
| --- | --- |
| à gauche | le portrait, « Arthur de Lassus », le **sujet du rendez-vous** et son
  texte de présentation, puis les repères : visio envoyée par email, durée,
  jour et heure choisis, fuseau horaire |
| au centre | le **calendrier mensuel** : les jours où un créneau est libre
  portent une pastille, les autres restent en clair ; deux flèches parcourent
  les mois proposés, et l'heure du fuseau de l'agenda s'affiche dessous |
| à droite | les **heures libres du jour retenu**. Un clic sur une heure fait
  apparaître « Continuer » juste sous elle ; un second clic ouvre le panneau
  des informations |
| à droite, ensuite | « **Vos informations** » prend la place du calendrier et
  des heures (le récapitulatif reste à gauche) : prénom, nom, adresse email,
  téléphone facultatif, note de 1000 caractères avec son compteur, autre
  participant éventuel, accord de confidentialité, puis « Réserver maintenant » |

Le **sujet change selon le bouton cliqué avant** : les trois pages d'offres
portent la fenêtre et l'ouvrent **sur place**, sans quitter la page
(`data-ouvrir-rendez-vous="atelier-hd"`, `-fdfp`, `conference`, `cours`,
`note`, `visite`, `seminaire`) ; sans clé, c'est « Discussion ouverte ». Onze
boutons sont équipés de la sorte (`index.html` 3, `services.html` 5,
`agriculture.html` 3) : ils gardent leur libellé et leur lien vers
`prendre-rendez-vous.html?rdv=…`, utile sans JavaScript, et perdent
`data-ouvrir-contact`, sans quoi la fenêtre de contact prendrait le clic. Le
lien du pied de page, lui, continue de mener à la page : c'est elle qui décrit
l'application déclarée à Google.

- `assets/js/rendez-vous.js` (753 lignes) lit `creneaux.php` (31 jours d'un
  coup), dessine le mois, gère les trois états de la fenêtre (`data-etape` =
  `creneaux`, `formulaire`, `confirme`), les erreurs 409 / 422 / 429 / 503, et
  la sortie de secours par email prérempli.
- La fenêtre est posée dans `prendre-rendez-vous.html` **et** dans les trois
  pages d'offres (même bloc `#modaleRendezVous`, script chargé après
  `contact.js`) : le visiteur ne quitte jamais la page qu'il lisait, et le
  bouton « précédent » de son navigateur reste celui du site.
- `assets/css/styles.css` : le bloc `.rdv-…` (fenêtre de 1060 px, trois
  colonnes, calendrier, créneaux, formulaire) ; à 900 px et moins, tout
  s'empile dans une colonne.
- L'invité supplémentaire est un vrai champ : `lib/validation.js` le vérifie,
  `lib/agenda.js` l'ajoute aux participants de l'événement Google avec le
  visiteur (doublons retirés), et `lib/emails.js` le rappelle dans la fiche des
  trois emails de rendez-vous.

Contrôles : `outils/essai_reservation.js` (backend, tout OK, quatre contrôles de
plus pour l'invité), `shot_fenetre_rdv32.py` — la page servie en local, Chrome
sans interface, **35 contrôles** du calendrier au formulaire, captures dans
`_shots_lot32/rdv-fenetre-calendrier.png` et `rdv-fenetre-formulaire.png` — et
les sept vérifications du site (`check_html`, `check_classes`, `check_site`,
`diag_largeur_lot10`, `test_lot10_posts`, `test_climatisation`,
`test_climatisation_mobile`), toutes vertes.

Trois points hors du site, pour le prochain déploiement du backend Netlify (un
seul suffit : `netlify deploy --prod` dans `Backend_Netlify`) : le champ « autre
participant », et le pas des rendez-vous porté **toutes les 30 minutes**
(`RDV_PAS_MINUTES`, 15 auparavant) — les deux sont prêts et vérifiés en local,
mais l'API en ligne annonce encore `pas: 15` ; et le mot de passe d'application
SMTP Infomaniak, à reposer : `diagnostic.php` affiche encore « 535 Invalid login
or password » alors que la variable est présente et que le mode est « envoi
réel ». Le reste du diagnostic est vert (SPF, DMARC, DKIM, Blobs, Google
Agenda).

## Troisieme bandeau de logos et passages media (LOT 38, 9 octobre 2026)

L'accueil gagne une **troisieme rangee de logos**, sous les etablissements puis les
organisations : les medias ou j'ai pris la parole. Elle porte l'intitule
« Ils m'ont invité à parler » et glisse vers la gauche, plus lentement que la
premiere (`defilement-rangee-lente`, 82 s), pour que les trois mouvements restent
distincts. Dix logos : LCI, BFM TV, France Inter, Le Monde, The New York Times,
RMC, LCP – Assemblée nationale, L'Express, Révolution Énergétique et
« Et si l'économie sauvait l'écologie ? ».

La page Ressources gagne une section **« Mes passages média »** (`#passages-media`,
cinquieme bouton du sommaire), placee **avant** le repere `<!-- LP:START -->` : la
generation des posts LinkedIn ne peut donc pas l'effacer. Elle se compose d'une
frise de logos qui defile, puis d'une carte par passage, de la plus recente (LCI,
6 septembre 2026) a la plus ancienne (Révolution Énergétique, 3 juillet 2025) :
media, support, date, titre, citation verifiee ou resume, et le lien vers l'extrait,
la page du media ou l'article. Le debat de France Inter porte deux liens : la page
Radio France et la video de la grande matinale.

Les dix logos sont dans `Images/`, sous la forme `<Nom>_logo_transparent.png`
(200 px de haut au plus, 6 a 23 Ko chacun, 140 Ko au total). `lot38_logos.py` les
fabrique depuis `_cache/lot38` : les vectoriels (France Inter, Le Monde, The New
York Times, BFM TV, RMC, L'Express, Révolution Énergétique, LCP) sont rendus en PNG
transparent par Chrome headless, les autres (LCI, LCP, l'avatar de l'emission) sont
detoures. Deux retouches sont documentees : le carre de BFM TV garde un liseré blanc
opaque apres rendu, il est donc detoure a son tour ; et le logo de Révolution
Énergétique est concu pour un fond sombre, ses gris passent donc en encre claire du
site pour rester lisibles sur le fond creme, glyphe colore intact. La planche de
controle sur damier est `_controle_logos_medias.png`.

Controles : `verif_lot38.py` (76 controles : logos, bandeau, sommaire, cartes,
liens, feuille de style, equilibre des balises) et `shot_lot38.py` (captures dans
`_shots_lot38`, accueil et section, 1440 et 390 px). Les sept controles du site
restent verts.

