# CLAUDE.md — TOP!

Ce fichier est lu automatiquement au début de chaque session Claude Code.
Il décrit le projet, les règles de travail, et les pièges déjà rencontrés.

---

## Le projet

**TOP!** — outil de gestion du temps pour le direct : horloge de référence,
timers, chronomètres, décompte du média en cours dans OBS.

- **Un seul fichier** : `index.html`. Pas de build, pas de dépendance, pas de
  serveur. Tout est embarqué, y compris ~123 Ko de tops vocaux en base64.
- Fonctionne hors ligne, ouvert en `file://` ou servi en HTTP.
- Licence GPL-3.0 · dépôt `github.com/noar-justedit/top` · démo GitHub Pages.
- Version actuelle : voir `.brand-txt .sub` dans `index.html`.

## Qui je suis

Je suis monteur et technicien vidéo, **pas développeur**. Je ne cherche pas à
apprendre à coder.

- Donne-moi directement la solution qui fonctionne.
- Explique en quelques phrases simples, sans jargon, **ce que fait le code et
  pourquoi cette méthode plutôt qu'une autre**.
- Signale ce qui aura un impact concret : ce qui peut casser plus tard, ce qui
  sera difficile à modifier, les limites de la solution.
- Ne me flatte pas, n'acquiesce pas par défaut. Si j'ai tort, dis-le et
  explique pourquoi.
- Pas de formules de politesse ni de remplissage.
- Sur l'audiovisuel : parle-moi d'égal à égal, pas de vulgarisation.

## Règles de travail — non négociables

1. **Ne bump JAMAIS la version sans ma confirmation explicite.** Demande-moi de
   confirmer le numéro à chaque fois, même si le changement est évident.
2. **Ne touche pas à git sans me le demander.** Pas de commit, pas de push.
3. **À chaque mise à jour, fournis les quatre :**
   - `index.html`
   - `CHANGELOG.md` (entrée ajoutée en haut)
   - `README.md` (mis à jour)
   - la note de release GitHub (fichier séparé, non committé)
   Le screenshot du README s'appelle `screenshot-v2.png`.
4. **Fais tourner toute la batterie de tests avant de me livrer quoi que ce
   soit.** Si un test casse, dis-le, ne le contourne pas.

## Tests

```bash
npm test          # les 4 suites : ~140 tests
npm run hero      # régénère screenshot-v2.png
npm run demo      # régénère les captures de démonstration du second écran
```

Les suites, dans `tests/` :

| Fichier | Couvre |
|---|---|
| `regression.js` | démarrage, timers, chronos, maximisation F1–F4, grille, ajout de carte, horloge non coupée sur 9 résolutions, nom de scène dans l'anneau, localStorage bloqué, les 8 modes OBS |
| `screentest.js` | second écran une carte : synchro, dérive, pause, presets, renommage, couleur, vue, fenêtre orpheline, fermeture |
| `screentest2.js` | second écran chrono / OBS Media / timer additionnel, deux écrans simultanés |
| `screentest3.js` | écran projecteur (grille entière) : absence de commandes, synchro, forme de grille, ajout/fermeture de carte, vues numérique/cadran |

Playwright + Chromium. Si Chromium manque : `npx playwright install chromium`.

**Écris un test pour chaque correction et chaque fonction.** C'est ce qui fait
qu'on peut modifier un fichier de 320 Ko sans rien casser.

## Architecture — les points qui comptent

### Temps
Tout le chronométrage passe par `performance.now()`. Vérifié : aucune dérive,
60 fps avec 5 timers en marche. Ne remplace pas par `Date.now()` dans les
boucles de rendu.

### Cartes
- `CARD_TPL` : clones vierges de timer/chrono. `SINGLE` : les quatre éléments
  d'origine du HTML. `makeCard(type, cfg)` crée, `detachCard(card)` retire sans
  question, `closeCard(card)` demande confirmation.
- Chaque carte porte `data-cid` (identifiant stable, sauvegardé).
- `prepareClone` **doit** retirer les marqueurs `data-wired` / `data-drag-wired`,
  sinon les boutons sont liés deux fois et un clic s'annule lui-même.

### Second écran
Deux modes, tous deux en display-only :
- `?screen=1` → toute la grille (`body.screen-grid`)
- `?tool=<type>&screen=1&cid=<id>` → une carte seule (réutilise la mise en page OBS)

La fenêtre de régie envoie 8 fois par seconde, sur **deux canaux** : `postMessage`
sur la poignée de `window.open` (marche même en `file://`) et un `BroadcastChannel`
(pour une fenêtre rouverte à la main). Ce qui circule n'est **jamais le chiffre**
mais l'échéance en heure machine (`Date.now`), reconvertie à l'arrivée dans
l'horloge locale. C'est ce qui garantit les <10 ms.

La carte OBS Media fait exception : ses valeurs déjà rendues sont recopiées
telles quelles (elle se lit à la seconde, donc c'est exact et trivial).

Un second écran **n'écrit jamais** dans le localStorage (`saveCards` sort
immédiatement si `body.screen-mode`).

### localStorage
`topCards`, `topGridSize`, `topGridTracks`, `topObsWs`, `topMediaSrcFilter`,
`topMediaSrcTypeFilter`, `topMasterVol`, `topMediaSound`, `topTimerSound`,
`topWakeLock`. Accès uniquement via le wrapper `LS` — l'appli doit survivre à un
navigateur qui bloque les données de site (il y a un test pour ça).

### OBS
WebSocket v5. `ws://localhost` est autorisé depuis une page HTTPS, `ws://<IP LAN>`
non (SecurityError) — vérifié empiriquement, c'est une règle du navigateur, pas
un bug. Une Browser Source OBS est un navigateur séparé : elle ne peut pas être
synchronisée par le canal du second écran.

## Pièges déjà rencontrés — ne pas y retomber

- **Ancres ambiguës.** `/* ===== MASTER VOLUME ===== */` existe dans le CSS *et*
  dans le JS. J'ai tronqué le fichier deux fois en découpant sur la mauvaise
  occurrence. Toute édition par script doit vérifier `count(ancre) == 1`.
- **Spécificité CSS des id.** `#mediaCard .flat-view{display:flex !important}`
  battait la règle censée le cacher en mode OBS : la Browser Source affichait ses
  panneaux de texte pendant plusieurs versions. Quand une règle ne prend pas,
  soupçonne un sélecteur avec un id avant de doubler les `!important`.
- **`!important` et style inline.** Un `element.style.fontSize = …` ne bat pas un
  `!important` de la feuille de style. Il faut
  `setProperty('font-size', v, 'important')`.
- **Le voile anti-scintillement.** Il est levé au début de `buildLayout()`, avant
  tout `return` anticipé. En 2.6.2 il était levé à la fin : le chemin
  `?tool=xtimer` sortait avant, et la Browser Source restait une page blanche.
- **Mesures qui se courent après.** Tout ce qui dimensionne en JS (cadran de
  l'horloge, chiffres du second écran, cadrans maximisés) doit mesurer une boîte
  **indépendante du résultat**, sinon la valeur oscille. Le motif utilisé
  partout : mesurer les frères/sœurs, pas la carte elle-même.
- **Flex et `aspect-ratio`.** Un cadran étiré par `align-items: stretch` devient
  un ovale. Les conteneurs de cadran doivent centrer, pas étirer.

## Style de code

Pas de framework, pas de bundler, pas de dépendance runtime. JavaScript simple,
IIFE par module, commentaires en anglais qui expliquent **pourquoi** (le code dit
déjà quoi). Icônes : Lucide, tracés inline. Interface en anglais.
