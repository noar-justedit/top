#!/bin/bash
# TOP! — publish this folder to GitHub (macOS).
#
# Double-click this file inside the unzipped release folder. GitHub then
# becomes exactly the content of the folder: additions, changes AND files
# removed. Nothing is ever force-pushed.
#
# Two runs per version:
#   1. everything except version.json is sent;
#   2. once the GitHub Release for that version is published, run it again:
#      version.json is sent on its own.
# The script finds out by itself which of the two runs this is.
#
# Rules it enforces:
#   - version.json and package.json must carry the same X.Y.Z;
#   - that version must be strictly higher than the one published on GitHub;
#   - it works in a temporary copy of the repository, shows the list of
#     changes and waits for "y" before sending anything.

# ---- overridable for the tests only ------------------------------------------
REPO_URL_OVERRIDE="${TOP_PUSH_REPO_URL:-}"
API_OVERRIDE="${TOP_PUSH_API:-}"
NO_PAUSE="${TOP_PUSH_NO_PAUSE:-}"

pause_and_exit() {
  echo
  if [ -z "$NO_PAUSE" ]; then read -r -p "Appuie sur Entrée pour fermer cette fenêtre." _; fi
  exit "$1"
}
fail() { echo; echo "ARRÊT : $*"; pause_and_exit 1; }

# ---- where we are ------------------------------------------------------------
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SRC="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$SRC" || fail "dossier introuvable."
echo "Dossier à publier : $SRC"

[ -f "$SRC/index.html" ] && [ -f "$SRC/package.json" ] || \
  fail "ce script doit rester dans le dossier scripts/ du projet TOP! décompressé."
[ -f "$SRC/version.json" ] || fail "version.json manque."

command -v git  >/dev/null 2>&1 || fail "git n'est pas installé. Tape « xcode-select --install » dans le Terminal, puis relance."
command -v curl >/dev/null 2>&1 || fail "curl est introuvable."
command -v rsync >/dev/null 2>&1 || fail "rsync est introuvable."

# ---- reading versions (no JSON tool needed) ---------------------------------
json_field() {  # json_field <file> <key> : first "key": "value" of the file
  grep -m1 "\"$2\"[[:space:]]*:" "$1" 2>/dev/null | sed -E "s/.*\"$2\"[[:space:]]*:[[:space:]]*\"([^\"]*)\".*/\1/"
}
is_semver() { echo "$1" | grep -Eq '^[0-9]+\.[0-9]+\.[0-9]+$'; }
ver_gt() {      # ver_gt A B : true if A > B (X.Y.Z)
  local IFS=.
  local a=($1) b=($2) i x y
  for i in 0 1 2; do
    x=$((10#${a[$i]:-0})); y=$((10#${b[$i]:-0}))
    [ "$x" -gt "$y" ] && return 0
    [ "$x" -lt "$y" ] && return 1
  done
  return 1
}

V_JSON="$(json_field "$SRC/version.json" version)"
V_PKG="$(json_field "$SRC/package.json" version)"
REPO="$(json_field "$SRC/version.json" repo)"

is_semver "$V_JSON" || fail "version.json : version illisible (« $V_JSON »)."
[ "$V_JSON" = "$V_PKG" ] || fail "version.json dit $V_JSON mais package.json dit $V_PKG. Les deux doivent être identiques."
[ -n "$REPO" ] || fail "version.json ne donne pas l'adresse du dépôt (clé \"repo\")."

REPO="${REPO%/}"; REPO="${REPO%.git}"
SLUG="${REPO#https://github.com/}"
REPO_URL="${REPO_URL_OVERRIDE:-$REPO.git}"
API="${API_OVERRIDE:-https://api.github.com}"
VERSION="$V_JSON"
echo "Version du dossier : $VERSION"
echo "Dépôt GitHub       : $REPO"

# ---- temporary copy of the repository ---------------------------------------
TMP="$(mktemp -d "${TMPDIR:-/tmp}/top-push.XXXXXX")" || fail "impossible de créer un dossier temporaire."
trap 'rm -rf "$TMP"' EXIT
echo
echo "Récupération de GitHub…"
git clone --quiet "$REPO_URL" "$TMP/repo" || fail "impossible de récupérer $REPO_URL (connexion, adresse ?)."
cd "$TMP/repo" || fail "copie temporaire introuvable."
git config core.autocrlf false
git config core.fileMode true

PUB_VJSON=""
[ -f version.json ] && PUB_VJSON="$(json_field version.json version)"
PUB_PKG="$(json_field package.json version)"

echo "Sur GitHub         : code $PUB_PKG, version.json ${PUB_VJSON:-absent}"

if [ -n "$PUB_VJSON" ] && ! ver_gt "$VERSION" "$PUB_VJSON"; then
  fail "la version $VERSION n'est pas supérieure à celle publiée sur GitHub ($PUB_VJSON). Rien n'a été envoyé."
fi

# ---- mirror everything except version.json ----------------------------------
# --delete removes from the copy what is no longer in the folder; files matched
# by --exclude are neither copied nor deleted.
rsync -a --delete \
  --exclude '.git' --exclude 'version.json' \
  --exclude 'node_modules' --exclude '.DS_Store' --exclude 'release-notes' \
  "$SRC/" "$TMP/repo/" || fail "copie des fichiers impossible."
git add -A

confirm() {
  echo
  read -r -p "$1 (y = oui) : " ans
  [ "$ans" = "y" ] || [ "$ans" = "Y" ]
}

if ! git diff --cached --quiet; then
  # ---- run 1: the code ------------------------------------------------------
  if ! ver_gt "$VERSION" "$PUB_PKG"; then
    fail "le code a changé mais la version ($VERSION) n'est pas supérieure à celle du code sur GitHub ($PUB_PKG). Chaque envoi doit porter une nouvelle version. Rien n'a été envoyé."
  fi
  echo
  echo "=== Étape 1 sur 2 : le code de la version $VERSION ==="
  echo "Changements (A = ajouté, M = modifié, D = supprimé, R = renommé) :"
  git status --short
  echo
  echo "version.json n'est PAS envoyé maintenant : il partira à l'étape 2,"
  echo "une fois la Release v$VERSION publiée sur GitHub."
  confirm "Envoyer ces changements sur GitHub ?" || { echo "Annulé. Rien n'a été envoyé."; pause_and_exit 0; }
  git commit --quiet -m "TOP! v$VERSION" || fail "commit impossible."
  if ! git push --quiet origin HEAD; then
    echo
    echo "L'envoi a été refusé. Causes possibles :"
    echo " - GitHub a reçu d'autres changements entre-temps : relance le script ;"
    echo " - identifiants manquants : au premier envoi, le Terminal demande ton nom"
    echo "   GitHub et un jeton (github.com/settings/tokens), pas ton mot de passe."
    fail "rien n'a été envoyé."
  fi
  echo
  echo "Code de la version $VERSION envoyé."
  echo "Prochaine étape : publie la Release v$VERSION sur GitHub"
  echo "($REPO/releases/new), puis relance ce script pour envoyer version.json."
  pause_and_exit 0
fi

# ---- run 2: version.json, once the Release exists --------------------------
if [ "$PUB_PKG" != "$VERSION" ]; then
  fail "le code sur GitHub est en $PUB_PKG, pas en $VERSION. Situation inattendue : rien n'a été envoyé."
fi
echo
echo "=== Étape 2 sur 2 : version.json ($VERSION) ==="
echo "Le code de la version $VERSION est déjà sur GitHub."
release_ok=""
for tag in "v$VERSION" "$VERSION"; do
  code="$(curl -s -o /dev/null -w '%{http_code}' "$API/repos/$SLUG/releases/tags/$tag")"
  if [ "$code" = "200" ]; then release_ok="$tag"; break; fi
done
if [ -z "$release_ok" ]; then
  echo "La Release v$VERSION n'est pas (encore) publiée sur GitHub,"
  echo "ou GitHub n'a pas répondu."
  echo "Publie-la ($REPO/releases/new), puis relance ce script."
  if [ -n "$PUB_VJSON" ]; then echo "version.json reste en $PUB_VJSON sur GitHub en attendant."
  else echo "version.json reste absent de GitHub en attendant."; fi
  pause_and_exit 0
fi
echo "Release trouvée : $release_ok"
cp "$SRC/version.json" "$TMP/repo/version.json" || fail "copie de version.json impossible."
git add version.json
git status --short
confirm "Envoyer version.json ($VERSION) sur GitHub ?" || { echo "Annulé. Rien n'a été envoyé."; pause_and_exit 0; }
git commit --quiet -m "version.json $VERSION" || fail "commit impossible."
git push --quiet origin HEAD || fail "envoi refusé (relance le script). Rien n'a été envoyé."
echo
echo "Terminé : GitHub est en version $VERSION."
pause_and_exit 0
