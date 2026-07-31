#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
config_home="${XDG_CONFIG_HOME:-$HOME/.config}"
export XDG_CONFIG_HOME="$config_home"
helix_config_dir="$config_home/helix"
helix_runtime_dir="$helix_config_dir/runtime"
language_names=("pasp-input" "spin-exchange")
grammar_names=("pasp_input" "spin_exchange")
grammar_dirs=("pasp-input" "spin-exchange")

usage() {
  cat <<'USAGE'
Usage: bash install-helix.sh [--skip-generate] [--skip-build]

Build and install the local PASP Tree-sitter grammars for Helix.

Environment:
  XDG_CONFIG_HOME         Override the Helix config root.
                          Default: ~/.config

The Helix languages.toml file must already contain [[grammar]] entries whose
source.path values point to the pasp-input and spin-exchange subdirectories.

If your Helix config lives somewhere other than ~/.config, set XDG_CONFIG_HOME
before running the script.
USAGE
}

skip_generate=0
skip_build=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --help|-h)
      usage
      exit 0
      ;;
    --skip-generate)
      skip_generate=1
      ;;
    --skip-build)
      skip_build=1
      ;;
    *)
      echo "Unknown option: $1" >&2
      usage >&2
      exit 2
      ;;
  esac
  shift
done

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Required command not found: $1" >&2
    exit 127
  fi
}

copy_queries() {
  local language_name grammar_dir query_dir query_file index

  for index in "${!language_names[@]}"; do
    language_name="${language_names[$index]}"
    grammar_dir="${grammar_dirs[$index]}"
    query_dir="$helix_runtime_dir/queries/$language_name"
    mkdir -p "$query_dir"
    for query_file in "$repo_root/$grammar_dir"/queries/*.scm; do
      [[ -e "$query_file" ]] || continue
      cp "$query_file" "$query_dir/$(basename "$query_file")"
    done
    echo "Installed queries for $language_name -> $query_dir"
  done
}

mkdir -p "$helix_runtime_dir/grammars"

if [[ "$skip_generate" -eq 0 ]]; then
  require_command tree-sitter
  for grammar_dir in "${grammar_dirs[@]}"; do
    echo "Generating parser sources in $grammar_dir..."
    (cd "$repo_root/$grammar_dir" && tree-sitter generate)
  done
fi

if [[ "$skip_build" -eq 0 ]]; then
  require_command hx
  for grammar_name in "${grammar_names[@]}"; do
    echo "Building Helix grammar: $grammar_name"
    hx --grammar build "$grammar_name"
  done
fi

copy_queries

echo "Done."
echo "Check with: hx --health pasp-input && hx --health spin-exchange"
