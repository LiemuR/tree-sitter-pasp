[CmdletBinding()]
param(
    [Alias('h')]
    [switch]$Help,

    [switch]$SkipGenerate,

    [switch]$SkipBuild
)

$ErrorActionPreference = 'Stop'

function Show-Usage {
    @'
Usage: .\install-helix.ps1 [-SkipGenerate] [-SkipBuild]

Build and install the local PASP Tree-sitter grammars for Helix.

Environment:
  XDG_CONFIG_HOME         Override the Helix config root.
                          Default: %APPDATA%

The Helix languages.toml file must already contain [[grammar]] entries whose
source.path values point to the pasp-input and spin-exchange subdirectories.

If your Helix config lives somewhere other than %APPDATA%\helix, set
XDG_CONFIG_HOME before running the script.
'@ | Write-Output
}

function Require-Command {
    param([string]$Name)

    if ($null -eq (Get-Command -Name $Name -ErrorAction SilentlyContinue)) {
        throw "Required command not found: $Name"
    }
}

function Copy-Queries {
    param(
        [string]$RuntimeDirectory,
        [string]$RepositoryRoot,
        [string[]]$LanguageNames,
        [string[]]$GrammarDirectories
    )

    for ($index = 0; $index -lt $LanguageNames.Count; $index++) {
        $languageName = $LanguageNames[$index]
        $grammarDirectory = $GrammarDirectories[$index]
        $queryDirectory = Join-Path $RuntimeDirectory "queries\$languageName"

        New-Item -ItemType Directory -Force -Path $queryDirectory | Out-Null
        Get-ChildItem -Path (Join-Path $RepositoryRoot "$grammarDirectory\queries") -Filter '*.scm' -File |
            Copy-Item -Destination $queryDirectory -Force

        Write-Output "Installed queries for $languageName -> $queryDirectory"
    }
}

if ($Help) {
    Show-Usage
    exit 0
}

$repositoryRoot = $PSScriptRoot
$configHome = if ($env:XDG_CONFIG_HOME) { $env:XDG_CONFIG_HOME } else { $env:APPDATA }
$helixConfigDirectory = Join-Path $configHome 'helix'
$helixRuntimeDirectory = Join-Path $helixConfigDirectory 'runtime'
$languageNames = @('pasp-input', 'spin-exchange')
$grammarNames = @('pasp_input', 'spin_exchange')
$grammarDirectories = @('pasp-input', 'spin-exchange')

New-Item -ItemType Directory -Force -Path (Join-Path $helixRuntimeDirectory 'grammars') | Out-Null

if (-not $SkipGenerate) {
    Require-Command 'tree-sitter'

    foreach ($grammarDirectory in $grammarDirectories) {
        Write-Output "Generating parser sources in $grammarDirectory..."
        Push-Location (Join-Path $repositoryRoot $grammarDirectory)
        try {
            & tree-sitter generate
        }
        finally {
            Pop-Location
        }
    }
}

if (-not $SkipBuild) {
    Require-Command 'hx'

    foreach ($grammarName in $grammarNames) {
        Write-Output "Building Helix grammar: $grammarName"
        & hx --grammar build $grammarName
    }
}

Copy-Queries -RuntimeDirectory $helixRuntimeDirectory -RepositoryRoot $repositoryRoot -LanguageNames $languageNames -GrammarDirectories $grammarDirectories

Write-Output 'Done.'
Write-Output 'Check with: hx --health pasp-input; hx --health spin-exchange'
