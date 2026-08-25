# Vision X

Portfolio de **Vision X** — studio à deux têtes porté par **Zukam** (développeur full-stack) et **Igor** (designer). Développement full-stack, UI/UX design, intégration IA, applications mobiles et jeux.

## Stack

Site statique en **HTML / CSS / JavaScript vanilla** — aucun build, aucune dépendance à installer.

- Vidéo de fond scroll-scrubbée, révélations au scroll, marquee de stack technique
- Section "Best Portfolio" avec 8 projets réels, vignettes en 16:9
- Panneau services interactif (survol/clic) avec illustrations dédiées par service
- Boutons de nav en verre translucide avec halo lumineux orbital (CSS `offset-path`)

## Lancer en local

Aucune installation nécessaire — servez le dossier avec n'importe quel serveur statique, par exemple :

```bash
python3 -m http.server 5173
```

Puis ouvrez [http://localhost:5173](http://localhost:5173).

## Structure

```
index.html       Contenu de la page
style.css        Styles (tokens, sections, responsive)
script.js        Interactions (reveal au scroll, panneau services, boutons)
images/          Captures d'écran des projets + illustrations services
```

## Contact

[zukam.fp@outlook.com](mailto:zukam.fp@outlook.com)
