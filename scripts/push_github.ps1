# TOP! - publish this folder to GitHub (Windows). Started by push_github.bat.
#
# GitHub becomes exactly the content of the unzipped folder: additions,
# changes AND files removed. Nothing is ever force-pushed.
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
#
# Written for Windows PowerShell 5.1 (built into Windows 10/11): no newer
# syntax. Saved as UTF-8 with BOM, otherwise 5.1 garbles the accents.

$ErrorActionPreference = 'Stop'
try { [Console]::OutputEncoding = [Text.Encoding]::UTF8 } catch {}
try { [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12 } catch {}

# ---- overridable for the tests only ------------------------------------------
$RepoUrlOverride = $env:TOP_PUSH_REPO_URL
$ApiOverride     = $env:TOP_PUSH_API

function Say($t)  { Write-Host $t }
function Fail($t) { Write-Host ''; Write-Host "ARRÊT : $t" -ForegroundColor Red; exit 1 }
function Confirm-Y($q) {
  Write-Host ''
  $a = Read-Host "$q (y = oui)"
  return ($a -eq 'y' -or $a -eq 'Y')
}
function Git-Run {
  # git writes progress to stderr: never let PowerShell treat that as an error
  $old = $ErrorActionPreference; $ErrorActionPreference = 'Continue'
  $out = & git @args 2>&1
  $code = $LASTEXITCODE
  $ErrorActionPreference = $old
  return @{ Code = $code; Out = ($out | ForEach-Object { "$_" }) }
}
function Read-Version($file) {
  if (-not (Test-Path -LiteralPath $file)) { return $null }
  try { return [string](Get-Content -LiteralPath $file -Raw -Encoding UTF8 | ConvertFrom-Json).version }
  catch { return $null }
}
function Is-Semver($v) { return ($v -match '^\d+\.\d+\.\d+$') }

# ---- where we are ------------------------------------------------------------
$Src = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
Say "Dossier à publier : $Src"
if (-not (Test-Path (Join-Path $Src 'index.html')) -or -not (Test-Path (Join-Path $Src 'package.json'))) {
  Fail "ce script doit rester dans le dossier scripts\ du projet TOP! décompressé."
}
if (-not (Test-Path (Join-Path $Src 'version.json'))) { Fail "version.json manque." }
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  Fail "git n'est pas installé. Installe Git for Windows (git-scm.com/download/win), puis relance."
}

$VJson = Read-Version (Join-Path $Src 'version.json')
$VPkg  = Read-Version (Join-Path $Src 'package.json')
$Repo  = ''
try { $Repo = [string](Get-Content -LiteralPath (Join-Path $Src 'version.json') -Raw -Encoding UTF8 | ConvertFrom-Json).repo } catch {}

if (-not (Is-Semver $VJson)) { Fail "version.json : version illisible (« $VJson »)." }
if ($VJson -ne $VPkg) { Fail "version.json dit $VJson mais package.json dit $VPkg. Les deux doivent être identiques." }
if (-not $Repo) { Fail "version.json ne donne pas l'adresse du dépôt (clé `"repo`")." }

$Repo = $Repo.TrimEnd('/')
if ($Repo.EndsWith('.git')) { $Repo = $Repo.Substring(0, $Repo.Length - 4) }
$Slug = $Repo -replace '^https://github\.com/', ''
$RepoUrl = if ($RepoUrlOverride) { $RepoUrlOverride } else { "$Repo.git" }
$Api     = if ($ApiOverride) { $ApiOverride } else { 'https://api.github.com' }
$Version = $VJson
Say "Version du dossier : $Version"
Say "Dépôt GitHub       : $Repo"

# ---- temporary copy of the repository ---------------------------------------
$Tmp = Join-Path ([IO.Path]::GetTempPath()) ('top-push-' + [Guid]::NewGuid().ToString('N').Substring(0, 8))
New-Item -ItemType Directory -Path $Tmp | Out-Null
$Clone = Join-Path $Tmp 'repo'
try {
  Say ''
  Say 'Récupération de GitHub…'
  # autocrlf off from the very first checkout: files go up exactly as they are
  $r = Git-Run -c core.autocrlf=false clone --quiet $RepoUrl $Clone
  if ($r.Code -ne 0) { $r.Out | ForEach-Object { Say $_ }; Fail "impossible de récupérer $RepoUrl (connexion, adresse ?)." }
  Set-Location -LiteralPath $Clone
  Git-Run config core.autocrlf false | Out-Null
  Git-Run config core.safecrlf false | Out-Null

  $PubVJson = Read-Version (Join-Path $Clone 'version.json')
  $PubPkg   = Read-Version (Join-Path $Clone 'package.json')
  $shown = if ($PubVJson) { $PubVJson } else { 'absent' }
  Say "Sur GitHub         : code $PubPkg, version.json $shown"

  if ($PubVJson -and -not ([version]$Version -gt [version]$PubVJson)) {
    Fail "la version $Version n'est pas supérieure à celle publiée sur GitHub ($PubVJson). Rien n'a été envoyé."
  }

  # ---- mirror everything except version.json ----------------------------------
  # empty the copy (but keep .git and version.json), then copy the folder in:
  # whatever is no longer in the folder disappears from GitHub
  $skip = @('.git', 'version.json', 'node_modules', 'release-notes', '.DS_Store')
  Get-ChildItem -LiteralPath $Clone -Force | Where-Object { $skip -notcontains $_.Name } |
    Remove-Item -Recurse -Force
  Get-ChildItem -LiteralPath $Src -Force | Where-Object { $skip -notcontains $_.Name } |
    ForEach-Object { Copy-Item -LiteralPath $_.FullName -Destination $Clone -Recurse -Force }
  Get-ChildItem -LiteralPath $Clone -Recurse -Force -Filter '.DS_Store' | Remove-Item -Force

  Git-Run add -A | Out-Null
  # Windows has no "executable" flag: set it in git so the Mac scripts still
  # open with a double-click once on GitHub
  $exe = (Git-Run ls-files -- '*.command' '*.sh').Out
  foreach ($f in $exe) { if ($f) { Git-Run update-index --chmod=+x -- $f | Out-Null } }

  $changed = (Git-Run diff --cached --quiet).Code -ne 0

  if ($changed) {
    # ---- run 1: the code ------------------------------------------------------
    if (-not ([version]$Version -gt [version]$PubPkg)) {
      Fail "le code a changé mais la version ($Version) n'est pas supérieure à celle du code sur GitHub ($PubPkg). Chaque envoi doit porter une nouvelle version. Rien n'a été envoyé."
    }
    Say ''
    Say "=== Étape 1 sur 2 : le code de la version $Version ==="
    Say 'Changements (A = ajouté, M = modifié, D = supprimé, R = renommé) :'
    (Git-Run status --short).Out | ForEach-Object { Say $_ }
    Say ''
    Say "version.json n'est PAS envoyé maintenant : il partira à l'étape 2,"
    Say "une fois la Release v$Version publiée sur GitHub."
    if (-not (Confirm-Y 'Envoyer ces changements sur GitHub ?')) { Say "Annulé. Rien n'a été envoyé."; exit 0 }
    $r = Git-Run commit --quiet -m "TOP! v$Version"
    if ($r.Code -ne 0) { $r.Out | ForEach-Object { Say $_ }; Fail 'commit impossible.' }
    $r = Git-Run push --quiet origin HEAD
    if ($r.Code -ne 0) {
      $r.Out | ForEach-Object { Say $_ }
      Say ''
      Say "L'envoi a été refusé. Causes possibles :"
      Say ' - GitHub a reçu d''autres changements entre-temps : relance le script ;'
      Say ' - connexion GitHub : au premier envoi, Git for Windows ouvre une fenêtre'
      Say '   de connexion à GitHub dans le navigateur.'
      Fail "rien n'a été envoyé."
    }
    Say ''
    Say "Code de la version $Version envoyé."
    Say "Prochaine étape : publie la Release v$Version sur GitHub"
    Say "($Repo/releases/new), puis relance ce script pour envoyer version.json."
    exit 0
  }

  # ---- run 2: version.json, once the Release exists --------------------------
  if ($PubPkg -ne $Version) {
    Fail "le code sur GitHub est en $PubPkg, pas en $Version. Situation inattendue : rien n'a été envoyé."
  }
  Say ''
  Say "=== Étape 2 sur 2 : version.json ($Version) ==="
  Say "Le code de la version $Version est déjà sur GitHub."
  $found = $null
  foreach ($tag in @("v$Version", $Version)) {
    try {
      $resp = Invoke-WebRequest -UseBasicParsing -Uri "$Api/repos/$Slug/releases/tags/$tag" `
              -Headers @{ 'User-Agent' = 'top-push' } -TimeoutSec 20
      if ($resp.StatusCode -eq 200) { $found = $tag; break }
    } catch {}
  }
  if (-not $found) {
    Say "La Release v$Version n'est pas (encore) publiée sur GitHub,"
    Say "ou GitHub n'a pas répondu."
    Say "Publie-la ($Repo/releases/new), puis relance ce script."
    if ($PubVJson) { Say "version.json reste en $PubVJson sur GitHub en attendant." }
    else { Say 'version.json reste absent de GitHub en attendant.' }
    exit 0
  }
  Say "Release trouvée : $found"
  Copy-Item -LiteralPath (Join-Path $Src 'version.json') -Destination (Join-Path $Clone 'version.json') -Force
  Git-Run add version.json | Out-Null
  (Git-Run status --short).Out | ForEach-Object { Say $_ }
  if (-not (Confirm-Y "Envoyer version.json ($Version) sur GitHub ?")) { Say "Annulé. Rien n'a été envoyé."; exit 0 }
  $r = Git-Run commit --quiet -m "version.json $Version"
  if ($r.Code -ne 0) { $r.Out | ForEach-Object { Say $_ }; Fail 'commit impossible.' }
  $r = Git-Run push --quiet origin HEAD
  if ($r.Code -ne 0) { $r.Out | ForEach-Object { Say $_ }; Fail "envoi refusé (relance le script). Rien n'a été envoyé." }
  Say ''
  Say "Terminé : GitHub est en version $Version."
  exit 0
}
finally {
  Set-Location -LiteralPath $Src
  Remove-Item -LiteralPath $Tmp -Recurse -Force -ErrorAction SilentlyContinue
}
