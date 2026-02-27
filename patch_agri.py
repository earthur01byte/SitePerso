# -*- coding: utf-8 -*-
with open('agriculture.html', 'r', encoding='utf-8') as f:
    c = f.read()

# Philosophy 1
c = c.replace(
    "Aucun pesticide de synthèse, aucun engrais chimique. Nous sommes certifiés bio depuis notre installation.\n                Ce n'est pas un label marketing, c'est notre point de départ.",
    "L'agriculture bio est associée à des baisses d'impacts écologiques et elle est bien identifiée par les consommateurs. C'est notre point de départ."
)

# Philosophy 2
c = c.replace(
    "Zéro labour, zéro travail du sol depuis 2020. La terre n'a jamais été retournée. Nous nourrissons le sol\n                par le dessus — paillage, compost, couverts végétaux — et la vie souterraine fait le reste.",
    "Il faut pousser le bio plus loin, notamment sur le travail du sol pour préserver le sol. Zéro travail du sol depuis 2020, même pas une grelinette. Nous nourrissons le sol avec du compost et la vie souterraine fait le reste."
)

# Philosophy 4
c = c.replace(
    "limites que la Terre peut supporter. Pas seulement « moins pire », mais\n                <strong>compatible</strong> avec un monde vivable.",
    "frontières que la Terre peut supporter. Pas seulement « moins pire », mais compatible avec un monde\n                vivable."
)

# Chiffres
c = c.replace(
    '<span class="chiffre-detail">Agriculture sur sol vivant</span>',
    '<span class="chiffre-detail">Agriculture sur sol vivant, les vers de terre travaillent le sol pour nous</span>'
)
c = c.replace(
    '<span class="chiffre-detail">Un rythme tenable, choisi</span>',
    '<span class="chiffre-detail">Un rythme tenable, choisi. Ma femme travaille 20h et moi 14h/semaine.</span>'
)
c = c.replace(
    "<span class=\"chiffre-detail\">Parce qu'un paysan a aussi droit au repos</span>",
    "<span class=\"chiffre-detail\">Parce qu'un paysan a aussi droit au repos. En janvier et février quand le soleil est au plus bas</span>"
)

# Cultures plein champ
c = c.replace(
    "Pommes de terre, carottes, betteraves, navets, radis, oignons, ail, courges, choux, haricots, petits\n                pois, épinards… Le plein champ accueille les légumes de pleine terre qui ont besoin d'espace. C'est là\n                que le sol vivant exprime tout son potentiel : la terre est souple, grouillante de vers, couverte en\n                permanence.",
    "Nous cultivons seulement des courges et des patates douces en grandes quantités en extérieur."
)

# Poules
c = c.replace(
    "Nos poules ne sont pas une activité annexe : elles font partie du système. Elles valorisent les déchets\n                de culture et les invendus, entretiennent les parcelles en rotation, fertilisent le sol et produisent\n                des œufs. Le cercle est bouclé : ce que la terre donne nourrit les poules, et ce que les poules donnent\n                nourrit la terre.",
    "Nos poules ne sont pas une activité annexe : elles font partie du système. Elles valorisent les déchets\n                de culture, après compostage nous pouvons utiliser leurs fientes et elles produisent des œufs. Le\n                cercle est bouclé : ce que la terre donne nourrit les poules, et ce que les poules donnent nourrit la\n                terre."
)

# Vente directe - remove intro paragraphs
c = c.replace(
    """          <h2 class="section-title">Tout en vente directe</h2>
          <p class="text-lead">
            Chaque légume, chaque œuf est vendu sans intermédiaire. Du champ à l'assiette, il n'y a que nous et vous.
          </p>
          <p>
            La vente directe, ce n'est pas juste un circuit court. C'est un choix de relation. On connaît nos clients,
            ils connaissent notre travail. On se rend visite, on partage des repas, on s'invite mutuellement. Certains
            viennent voir les poules avec leurs enfants, d'autres nous apportent du café le samedi matin au marché.
          </p>
          <p>
            Ce lien-là n'a pas de prix. Il donne du sens au travail. Il prouve que l'agriculture peut être autre chose
            qu'une chaîne logistique anonyme.
          </p>

          <div class="vente-points">""",
    """          <h2 class="section-title">Tout en vente directe</h2>
          <div class="vente-points">"""
)

# Visites
c = c.replace(
    "particuliers, familles, groupes scolaires, associations —",
    "particuliers, familles, entreprises et associations —"
)

# Microculteur
c = c.replace(
    "Pour les petits travaux de surface, on utilise un microculteur alimenté par une simple visseuse\n                électrique. Léger, silencieux, suffisant.",
    "Pour bien mélanger les engrais, on utilise un microculteur qui vient des USA alimenté par une simple visseuse électrique. Léger, silencieux, suffisant."
)

with open('agriculture.html', 'w', encoding='utf-8') as f:
    f.write(c)
print("agriculture.html updated")
