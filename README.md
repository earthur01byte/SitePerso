# arthurdelassus.fr (site statique)

Site simple en **7 pages** :

- Accueil (`index.html`)
- À propos (`about.html`)
- Agriculture (`agriculture.html`)
- Services (`services.html`)
- ressources (+ blog intégré) (`ressources.html`)
- La climatisation (`climatisation.html`) — plaidoyer « Pour un droit à la fraîcheur »
- Contact (`contact.html`)

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
| Horizons Décarbonés | `#horizons-decarbones` | `Images/Horizons_Décarbonés.png` |
| La Fresque des frontières planétaires | `#frontieres-planetaires` | `Images/Fresque_des_frontières_planétaires.png` |
| Mes conférences | `#conferences` | — |
| Cours et formation | `#cours` | — |
| Notes et expertise | `#notes` | — |

Les liens venant de `index.html` et `agriculture.html` pointent sur
`#horizons-decarbones`. Les bandes de logos des offres contiennent les
organisations les plus significatives ; le bandeau « Ils m'ont fait confiance »
en fin de page garde les quatre structures non citées plus haut (ADEME, HEC, CNFPT,
EDF).

Contrôles du lot (dans `_outils_siteperso/`) : `verif_lot24.py` (ancres, images,
résidus, équilibre des balises), `diag_largeur_services.py` (débordement horizontal
de 1440 à 390 px), `shot_lot24.py` (captures, à lancer via `lancer_shot.py` pour un
journal UTF-8 fiable).
