# Posts LinkedIn — sauvegarde et affichage sur le site

Ce dossier contient la **copie locale de tous les posts LinkedIn** d'Arthur
de Lassus (texte intégral, mesures d'engagement, date, image) et sert de source
au bloc « Mes posts LinkedIn » de `productions.html`.

Objectif : ne rien perdre si LinkedIn ferme ou change, et afficher les posts sur
le site sans iframe LinkedIn, avec un lien qui ouvre le post dans un nouvel onglet.

## Contenu du dossier

| Fichier | Rôle |
|---|---|
| `Liste URL posts Linkedin.txt` | une URL publique de post par ligne (source de la collecte) |
| `Liste URL posts Linkedin_old.txt` | ancienne liste (URL d'analyse, conservée par précaution) |
| `posts-linkedin.json` | **source de vérité** : un enregistrement par post |
| `posts-linkedin.csv` | **tableau** : n°, URL, accroche, likes, commentaires, corps du texte, image, catégories, date |
| `categories.json` | catalogue des catégories + étiquettes attribuées à chaque post |
| `texte-integral/NNN-*.txt` | un fichier lisible par post (sauvegarde brute) |
| `_rapport_posts.txt` | posts en échec et champs manquants après une collecte |

Les images sont dans `../Images/posts/<id du post>.jpg` (max 1000 px de large).

## Rafraîchir les posts (nouvelle collecte)

```powershell
cd C:\Users\earth\Desktop\Cursor_Cline\_outils_siteperso
$env:PYTHONIOENCODING='utf-8'
python fetch_posts_linkedin.py --reprend     # collecte (reprend ce qui est deja fait)
python build_posts_linkedin.py               # CSV + section HTML de productions.html
python maj_texte_lot10.py                    # categories dans les sauvegardes .txt
```

- `--reprend` réutilise les posts déjà présents dans `posts-linkedin.json`
  (sinon tout est recollecté).
- `--probe 8` teste 8 posts sans rien écrire, `--sans-image` saute les images.
- Le script pilote **Chrome headless** (`--dump-dom`) : c'est le seul client qui
  obtient la variante complète des pages invitées LinkedIn (un simple `curl`
  reçoit une page de connexion vide).
- Après la collecte, relire `_rapport_posts.txt` pour les posts à compléter.

## Catégories

`categories.json` (12 catégories, 60 posts étiquetés) :

```json
{
  "catalogue": { "energie": "Énergie", "mythes": "Ordres de grandeur & mythes" },
  "posts": { "7500973229793071104": ["energie"] }
}
```

- la clé (`energie`) est utilisée dans le HTML (`data-lp-cats`, `data-lp-filter`),
- la valeur du catalogue est le libellé affiché dans les puces de filtre et le CSV.
  Une puce n'apparaît que si au moins un post porte la catégorie.
- Après modification : relancer `build_posts_linkedin.py` (le CSV et la page sont
  régénérés, aucun autre fichier n'est touché).

## État de la collecte (23 septembre 2026)

- 61 URL dans la liste du dossier, **60 posts affichés** sur le site : un post
  dont le texte n'est pas récupérable est écarté de la section et du CSV.
- `7011963795879165952` (23/12/2022) : LinkedIn ne sert plus le texte à un
  visiteur non connecté (mur de connexion). Date, compteurs, URL et image
  restent dans `texte-integral/061-post.txt` et `Images/posts/`.
- `7391392257167216642` (04/11/2025) : texte présent, mais likes et
  commentaires non servis ; la carte affiche alors la date seule plutôt qu'un
  « 0 » trompeur.
- Les autres écarts (compteurs manquants sur quelques posts) sont listés dans
  `_rapport_posts.txt`.

## Côté site

- `productions.html` : la section est encadrée par `<!-- LP:START -->` et
  `<!-- LP:END -->` ; **ne pas l'éditer à la main**, elle est régénérée.
- `assets/css/styles.css` : bloc « LOT 10 » (classes `.lp-*`).
- `assets/js/main.js` : filtre par catégorie + « Voir plus » (+3 lignes) /
  « Voir moins ». Lien partageable : `productions.html?cat=energie-climat`.
- Contrôles : `python check_html.py`, `check_classes.py`, `check_site.py`,
  `test_lot10_posts.py` (auto-test du filtre et du dépliage),
  `shot_lot10_posts.py` (captures 1440 / 1024 / 390 px).
