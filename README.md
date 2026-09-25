# arthurdelassus.fr (site statique)

Site simple en **7 pages** :

- Accueil (`index.html`)
- Manifeste (`manifeste.html`)
- Agriculture (`agriculture.html`)
- Services (`services.html`)
- Ressources, billets masqués (`ressources.html`)
- Climatisation (`climatisation.html`) : plaidoyer « Pour un droit à la fraîcheur »
- Contact (`contact.html`)

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
  l'encadré : `Images/HD_atelier.jpg` (Horizons Décarbonés),
  `Images/Arthur_conference.jpg` (conférences) et, depuis le LOT 27,
  `Images/Arthur_FdFP.jpg` (fresque).
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



## Ponctuation : plus de tiret cadratin

Le site n'utilise plus de tiret cadratin (—). Selon son rôle dans la phrase, il est
remplacé par un deux-points, une virgule ou des parenthèses ; les titres de page
utilisent la barre verticale (« Arthur de Lassus | Services »).
`nettoyer_tirets.py` applique et contrôle cette convention, `verif_lot25.py` la
vérifie page par page.
