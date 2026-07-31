# tree-sitter-pasp

Tree-sitter grammar for PASP input/config files and `spin_exchange.dat` numeric
data files.

The grammar is intentionally syntax-focused. Use `paspconfig server` for PASP
diagnostics, completion, include navigation, document links, and spin-exchange
hover/code-lens features.

This repository keeps only the grammar, queries, parser sources, and corpus
tests. Generated language bindings are disabled and not included.

## Highlight coverage

The highlight queries mirror the token groups used by `paspconfig server` as
closely as a syntax-only grammar can:

- PASP input: comments, directives, include targets, block names, setting keys,
  string values, numeric values, boolean constants, and invalid directive
  arguments.
- `spin_exchange.dat`: count lines, enum-like IDs, element IDs, interaction
  parameters, vector components, comments, and fallback numeric data.

Some `spin_exchange.dat` rows are ambiguous without the LSP section parser. For
example, five-number rows can be SIA parameter lines or four-order headers, and
twelve-number rows can be DMI rows or type-3 four-order coordinate rows. The
grammar highlights unambiguous shapes more specifically and leaves ambiguous
shapes conservative.

## Helix

Use one grammar with two Helix languages:

```toml
[language-server.paspconfig]
command = "E:/llc/my_project/pasp-language/pasp_config/target/release/paspconfig"
args = ["server"]
config = { diagnosticLocale = "zh-CN" }

[[language]]
name = "pasp-input"
scope = "source.pasp"
language-id = "pasp-input"
file-types = [{ glob = "PASP.input" }, { glob = "*.input" }, { glob = "*.str" }]
roots = ["PASP.input"]
grammar = "pasp"
language-servers = ["paspconfig"]

[[language]]
name = "spin-exchange"
scope = "source.pasp"
language-id = "spin-exchange"
file-types = [{ glob = "spin_exchange.dat" }]
roots = ["PASP.input"]
grammar = "pasp"
language-servers = ["paspconfig"]

[[grammar]]
name = "pasp"
source = { path = "E:/llc/my_project/pasp-language/tree-sitter-pasp" }
```

After updating `languages.toml`, run:

```sh
hx --grammar build
hx --health pasp-input
hx --health spin-exchange
```

Helix loads queries by language name. If `pasp-input` and `spin-exchange` both
reuse `grammar = "pasp"`, copy the query files to both runtime query
directories:

```sh
mkdir -p ~/.config/helix/runtime/queries/pasp-input
mkdir -p ~/.config/helix/runtime/queries/spin-exchange

cp queries/highlights.scm ~/.config/helix/runtime/queries/pasp-input/highlights.scm
cp queries/folds.scm ~/.config/helix/runtime/queries/pasp-input/folds.scm
cp queries/highlights.scm ~/.config/helix/runtime/queries/spin-exchange/highlights.scm
cp queries/folds.scm ~/.config/helix/runtime/queries/spin-exchange/folds.scm
```

## Development

```sh
tree-sitter generate
tree-sitter test
```
