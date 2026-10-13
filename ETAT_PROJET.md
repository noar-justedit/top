# TOP! : état du projet

Mis à jour le 13.10.2026.

## En une phrase

Outil de gestion du temps pour le direct (horloge de référence, timers,
chronomètres, décompte du média en cours dans OBS), en **un seul fichier
HTML**. **Version 2.9.0** (13.10.2026) : modèles de disposition façon Windows
(glisser une carte en haut de la fenêtre) et remplissage automatique des
cases vides de la grille.

Dépôt : `github.com/noar-justedit/top` · démo : `noar-justedit.github.io/top`
(GitHub Pages, servie depuis `main` : tout envoi sur GitHub met la démo à
jour aussitôt) · licence GPL-3.0.

## Ce que contient le dépôt

```
index.html              l'application entière (~330 Ko, dont ~123 Ko de tops vocaux en base64)
tests/regression.js     démarrage, timers, chronos, maximisation F1–F4, grille, cases vides,
                        modèles de disposition, horloge non coupée sur 9 résolutions,
                        localStorage bloqué, les 8 modes OBS
tests/screentest.js     second écran une carte : synchro, dérive, pause, presets, renommage…
tests/screentest2.js    second écran chrono / OBS Media / timer additionnel, deux écrans
tests/screentest3.js    écran projecteur (grille entière), y compris le modèle de disposition
tests/hero.js           régénère screenshot-v2.png (npm run hero)
tests/demo-screen.js    captures de démonstration du second écran (npm run demo)
scripts/push_github.bat       publication sur GitHub depuis Windows (lance push_github.ps1)
scripts/push_github.ps1       le script de publication Windows (PowerShell 5.1, UTF-8 avec BOM)
scripts/push_github.command   le même, pour le Mac
version.json            version publiée + adresse du dépôt (lu par le script de publication)
package.json            sert uniquement aux tests (Playwright)
```

Pas de build : le même `index.html` tourne sur Mac, Windows et Linux.

## Architecture en bref

- **Temps** : tout le chronométrage passe par `performance.now()`. Vérifié :
  aucune dérive, 60 fps avec 5 timers en marche. Ne pas remplacer par
  `Date.now()` dans les boucles de rendu.
- **Cartes** : `CARD_TPL` (clones vierges de timer / chrono), `SINGLE` (les
  quatre éléments d'origine du HTML). `makeCard(type, cfg)` crée,
  `detachCard(card)` retire sans question, `closeCard(card)` demande
  confirmation. Chaque carte porte `data-cid` (identifiant stable,
  sauvegardé). `prepareClone` **doit** retirer `data-wired` /
  `data-drag-wired`, sinon les boutons sont liés deux fois et un clic
  s'annule lui-même.
- **Grille** (module « GRID SIZE AND TRACK SIZES ») : forme colonnes × lignes
  par orientation (`topGridSize`), largeurs relatives des pistes par forme
  (`topGridTracks`). Chaque carte est placée explicitement
  (`grid-column` / `grid-row` en style inline) à partir d'une liste de
  **zones** `{c, r, cs, rs}` :
  1. le modèle choisi dans la barre (`cfg.zones`), utilisé tant qu'il y a
     exactement autant de cartes que de zones et que les zones couvrent
     toute la grille sans chevauchement ;
  2. sinon la grille simple remplie dans l'ordre de lecture, où la carte
     au-dessus d'une case vide la prend, et la dernière carte s'élargit dans
     les colonnes entièrement vides.
  Un `MutationObserver` replace les cartes dès qu'une carte est ajoutée,
  fermée ou déplacée, quel que soit le code qui l'a fait. Les séparateurs
  sont découpés en segments : ils s'arrêtent sur une carte qui couvre deux
  cases.
- **Modèles de disposition** (module « CARD ORDER ») : `layoutsFor(n)`
  fabrique les modèles pour n cartes (rangées égales, colonnes égales, une
  grande + une pile, une grande + une grille, 2/3–1/3, 1/4–1/2–1/4…), au plus
  8 × 6 comme le champ GRID, et ne garde que ceux où chaque carte garde une
  taille utilisable à l'écran (232 px de haut par ligne, 220 px de large par
  zone). La barre s'ouvre quand la carte glissée passe au-dessus de la grille
  (événement `dragover` sur le document). Le dépôt sur une zone réordonne les
  cartes puis appelle `window._topApplyLayout`.
- **Second écran** : `?screen=1` (toute la grille, `body.screen-grid`) ou
  `?tool=<type>&screen=1&cid=<id>` (une carte seule). La régie envoie 8 fois
  par seconde, sur deux canaux : `postMessage` sur la poignée de
  `window.open` (marche en `file://`) et `BroadcastChannel` (fenêtre rouverte
  à la main). Ce qui circule n'est jamais le chiffre mais l'échéance en heure
  machine (`Date.now`), reconvertie dans l'horloge locale : < 10 ms d'écart.
  La forme envoyée comprend maintenant les zones et les largeurs de pistes.
  Un second écran **n'écrit jamais** dans le localStorage.
- **localStorage** : `topCards`, `topGridSize`, `topGridTracks`, `topObsWs`,
  `topMediaSrcFilter`, `topMediaSrcTypeFilter`, `topMasterVol`,
  `topMediaSound`, `topTimerSound`, `topWakeLock`. Accès uniquement via le
  wrapper `LS` : l'appli doit survivre à un navigateur qui bloque les données
  de site (testé).
- **OBS** : WebSocket v5. `ws://localhost` est autorisé depuis une page
  HTTPS, `ws://<IP LAN>` non (règle du navigateur). Une Browser Source OBS
  est un navigateur séparé : elle ne peut pas être synchronisée par le canal
  du second écran.

## Décisions prises (et pourquoi)

- **Cases vides remplies automatiquement** (Noar, 13.10.2026) plutôt qu'une
  poignée d'angle ou des boutons de taille : rien à faire, et c'est ce qu'il
  voulait dans son cas (3 cartes en 2 × 2). Conséquence : une case ne peut
  plus rester volontairement vide.
- **Modèles façon Windows en plus** (Noar, 13.10.2026), **adaptés au nombre
  de cartes** plutôt qu'un jeu fixe de 2 à 4 zones : jamais de zone vide, et
  ça marche avec 5 cartes et plus.
- **La barre ne s'ouvre qu'au bord haut** : dans un premier essai elle
  s'ouvrait dès qu'on attrapait la carte, sous le pointeur, et un lâcher
  rapide appliquait un modèle par erreur.
- **Ajouter une carte repasse en grille simple, la refermer ramène le
  modèle** ; taper une forme dans GRID efface le modèle. Le modèle est
  mémorisé par orientation, comme la forme.
- **Pas de script de build** : un fichier HTML unique n'a rien à compiler.
- **TOP! est géré depuis Windows** (Noar, 13.10.2026) : publication par
  `push_github.bat`. Le `.bat` ne fait que lancer `push_github.ps1` : un
  `.bat` seul ne sait ni lire le JSON, ni comparer des versions, ni
  interroger GitHub proprement, alors que PowerShell est fourni avec Windows.
  `push_github.command` est gardé pour le Mac ; les deux appliquent les mêmes
  règles et doivent rester alignés.
- **Publication par `scripts/push_github.command`** (règles ARNO DEV) :
  copie temporaire du dépôt, liste des changements, « y », jamais d'envoi
  forcé, `version.json` envoyé en dernier, une fois la Release publiée.
  TOP! n'a pas de binaire : la Release sert de repère de version (on peut y
  joindre `index.html`).

## Problèmes connus

- **Test intermittent « timer dial maximized 1920x1080 »** (existait en
  2.8.0, reproduit sur la 2.8.0 d'origine, environ 1 fois sur 2) : le cadran
  du timer maximisé fait parfois défiler la page de 9 à 23 px. Non corrigé,
  en attente de l'accord de Noar.
- **Test intermittent « new card has a SCREEN button »** (vu une fois sur
  cinq en 2.8.0) : le test n'attend que 0,6 s après la création de la carte.
  Probablement un délai trop court, pas un bug de l'appli. Non modifié.
- **Cadran du timer / chrono en grille** : il ne descend pas sous 300 px.
  Dans une carte basse (modèle « 2 en haut, 1 large en bas », ou grille à 3
  lignes), il déborde et la carte défile à l'intérieur. Existait déjà avec
  une grille tapée à la main ; les modèles le rendent plus fréquent. La
  carte OBS Media, elle, lie son cadran à la hauteur (`--dialmax`) : piste
  pour une correction.
- **Hauteur minimale par piste (232 px)** : un modèle à 3 lignes choisi sur
  un grand écran fait défiler un écran projecteur plus petit (fenêtre de
  720 px par exemple). Même règle que pour une grille tapée à la main.
- **Glisser-déposer** : HTML5 natif, comme l'échange de cartes. Sur iPad,
  mêmes limites qu'avant. Dans les tests, le glisser-déposer simulé de
  Playwright ne reproduit pas tout (pas de `dragover` répété quand le
  pointeur est immobile ; un trajet vers le haut depuis la 2e ligne peut se
  bloquer) : les tests partent d'une carte de la 1re ligne.
- **Pièges déjà rencontrés** :
  - Ancres ambiguës : `/* ===== MASTER VOLUME ===== */` existe dans le CSS
    *et* dans le JS. Toute édition par script doit vérifier qu'une ancre
    n'apparaît qu'une fois.
  - Spécificité CSS des id : une règle avec un id bat une règle censée
    cacher l'élément. Soupçonner un id avant de doubler les `!important`.
  - Un `element.style.x = …` ne bat pas un `!important` de la feuille : il
    faut `setProperty(prop, v, 'important')`. Inversement, la carte
    maximisée annule le placement inline des zones par une règle
    `!important`.
  - Le voile anti-scintillement est levé au début de `buildLayout()`, avant
    tout `return` anticipé.
  - Tout ce qui se dimensionne en JS doit mesurer une boîte indépendante du
    résultat (les frères / sœurs, pas la carte), sinon la valeur oscille.
  - Un cadran étiré par `align-items: stretch` devient un ovale : les
    conteneurs de cadran centrent, ils n'étirent pas.
  - Le `<div id="snapBar">` est placé après le script dans la page : le
    chercher au moment de l'utiliser, pas au chargement du script.

## Prochaines étapes possibles (rien n'est décidé)

- Cadran du timer / chrono lié à la hauteur de la carte, comme celui d'OBS
  Media.
- Corriger le test intermittent du cadran maximisé.
- Confirmer le premier envoi réel avec `push_github.bat` sous Windows.

## Publication d'une version

1. Décompresser `TOP_vX.Y.Z.zip`, double-cliquer `scripts/push_github.bat`
   sous Windows (ou `push_github.command` sur Mac). Étape 1 : le code part,
   `version.json` reste.
2. Créer la Release `vX.Y.Z` sur GitHub (texte fourni à part).
3. Relancer le script. Étape 2 : `version.json` part.

**Windows** : il faut Git for Windows (git-scm.com). Au premier envoi, il
ouvre une fenêtre de connexion à GitHub dans le navigateur, puis retient la
connexion. Windows peut afficher « Windows a protégé votre ordinateur » sur
un `.bat` venu d'un ZIP téléchargé : « Informations complémentaires » →
« Exécuter quand même ». Particularités gérées par le script : copie
temporaire clonée sans conversion des fins de ligne (`core.autocrlf=false`
dès le clonage), droit d'exécution remis dans git sur les `.command` / `.sh`
(Windows ne le connaît pas, le Mac en a besoin), `.ps1` enregistré en UTF-8
avec BOM et `.bat` en fins de ligne Windows.

**Mac** : au premier envoi, git demande le nom GitHub et un **jeton**
(github.com/settings/tokens), pas le mot de passe ; le trousseau macOS le
garde ensuite. La première fois, macOS peut demander clic droit → Ouvrir.

Les deux scripts ont été testés contre une copie locale du dépôt GitHub
(le `.ps1` avec PowerShell 7 sous Linux, pas sur un vrai Windows) : envoi,
annulation, fichier supprimé retiré de GitHub, droit d'exécution conservé
(y compris en simulant Windows), version identique refusée, version.json et
package.json différents refusés, Release absente → version.json gardé.
**À vérifier au premier envoi réel sous Windows** (PowerShell 5.1).

## Emplacements de la version

1. `index.html` : `.brand-txt .sub` (« Live Event Time Control · vX.Y.Z »)
2. `package.json` : `"version"`
3. `package-lock.json` : les deux `"version"` de `top` en tête de fichier
4. `version.json` : `"version"`
5. `CHANGELOG.md` : titre de la nouvelle entrée en haut

Vérification après un bump :
`grep -rn "<ancienne version>" --exclude-dir=node_modules --exclude-dir=.git --exclude=CHANGELOG.md .`
ne doit rien renvoyer.
