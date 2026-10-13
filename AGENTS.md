# AGENTS.md — règles pour toute IA qui travaille sur TOP!

Ce fichier est lu par n'importe quel assistant de code (Claude, Codex, Cursor,
Copilot, Gemini…). `CLAUDE.md` renvoie ici. L'état du projet, l'architecture
et les problèmes connus sont dans **`ETAT_PROJET.md`** : à lire avant toute
modification.

## Contexte

- Le propriétaire du projet, Noar, est monteur et technicien vidéo, **pas
  développeur**. Il travaille sur Mac, mais **TOP! est géré depuis Windows** :
  la publication se fait par `scripts/push_github.bat`.
- TOP! est **un seul fichier HTML** (`index.html`), sans dépendance ni build.
  Il doit tourner sur Mac, Windows et Linux, dans tout navigateur récent.
- Noar publie lui-même sur GitHub, à partir du ZIP fourni, et crée lui-même
  les Releases.

## 1. Périmètre : rien en dehors de la demande

- Ne modifier que ce qui est demandé.
- Pour tout le reste (outillage, dépendances, organisation des fichiers,
  comportements par défaut) : proposer, expliquer l'impact, puis attendre un
  « oui » explicite. Jamais d'initiative silencieuse.

## 2. Communication

- Répondre en français, simplement, sans jargon.
- Expliquer en quelques phrases ce que fait le code et pourquoi cette méthode
  plutôt qu'une autre.
- Signaler les conséquences concrètes : ce qui peut casser plus tard, ce qui
  sera difficile à modifier, les limites de la solution, les impacts sur le
  coût, la sécurité, la maintenance et les performances.
- Pas de flatterie. Si Noar se trompe, le lui dire et expliquer pourquoi.
- Sur l'audiovisuel, lui parler d'égal à égal : c'est son métier.

## 3. Builds

TOP! n'a rien à compiler : le même `index.html` est la version Mac, Windows
et Linux. Il n'y a donc pas de script `build_*.command`. Si un jour le projet
en a besoin (application de bureau, par exemple), les scripts doivent
permettre de tout builder depuis le Mac, et dire clairement quand un build
Windows ou Linux depuis le Mac n'est pas réaliste.

## 4. Versions

- Aucun bump sans que Noar ait confirmé explicitement le numéro.
- Procédure : proposer un numéro, attendre la confirmation, mettre à jour
  **tous** les emplacements listés dans `ETAT_PROJET.md` (section
  « Emplacements de la version »), puis vérifier qu'aucun n'a été oublié.
- Format : X.Y.Z.

## 5. Livraison : le ZIP

- À chaque bump, fournir `TOP_vX.Y.Z.zip`.
- Une fois décompressé, le ZIP correspond exactement à ce que Noar pousse
  sur GitHub : sources, tests, scripts, documentation et fichiers de suivi.
- Le ZIP ne contient pas : les dossiers générés (`node_modules`…), la note
  de Release (fournie à part), aucun secret.
- Le ZIP doit suffire à lui seul pour qu'une autre IA reprenne le
  développement.

## 6. Fichiers de suivi (à jour à chaque bump)

- `README.md` : ce que fait l'app et comment la tester / publier (en anglais,
  comme l'interface).
- `AGENTS.md` : ces règles. `CLAUDE.md` renvoie vers `AGENTS.md`.
- `ETAT_PROJET.md` : état actuel, architecture en bref, décisions prises et
  leurs raisons, problèmes connus, prochaines étapes, emplacements de la
  version.
- `CHANGELOG.md` : historique des versions (en anglais), entrée ajoutée en
  haut.

## 7. Publication : `scripts/push_github.bat` (Windows) ou `.command` (Mac)

- Sous Windows, `push_github.bat` lance `push_github.ps1` (PowerShell, fourni
  avec Windows) ; sur Mac, `push_github.command` fait la même chose. Les deux
  appliquent exactement les mêmes règles : toute modification de l'un doit
  être reportée dans l'autre.
- Noar décompresse le ZIP et double-clique le script dans le dossier obtenu :
  GitHub devient exactement le contenu du dossier (ajouts, modifications et
  fichiers retirés). Jamais d'envoi par l'upload web de GitHub (il ne
  supprime rien et perd les droits d'exécution).
- Le script travaille dans une copie temporaire du dépôt, affiche la liste
  des changements et attend « y ». Jamais d'envoi forcé.
- Il refuse d'envoyer si la version de `version.json` n'est pas strictement
  supérieure à celle publiée sur GitHub, ou si `version.json` et
  `package.json` ne disent pas le même numéro.
- `version.json` part en dernier : tant que la Release `vX.Y.Z` n'est pas
  publiée, le script garde l'ancien sur GitHub ; on le relance ensuite pour
  l'envoyer.
- Aucune IA ne fait `git push` : c'est la décision de Noar.

## 8. Tests

- `npm install` une fois, puis `npm test` : quatre suites Playwright +
  Chromium dans `tests/`. Les faire tourner **avant toute livraison**. Si un
  test casse, le dire, ne pas le contourner.
- Écrire un test pour chaque correction et chaque fonction : c'est ce qui
  permet de modifier un fichier de 330 Ko sans rien casser.

## 9. Style de code

Pas de framework, pas de bundler, pas de dépendance à l'exécution.
JavaScript simple, un module par IIFE, commentaires en anglais qui expliquent
**pourquoi** (le code dit déjà quoi). Icônes : Lucide, tracés inline.
Interface en anglais.
