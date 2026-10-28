# tree-sitter-pasp

Tree-sitter grammars for PASP input/config files and `spin_exchange.dat`
numeric data files.

The grammars are intentionally syntax-focused. Use `paspconfig server` for PASP
diagnostics, completion, include navigation, document links, and spin-exchange
hover/code-lens features.

This repository is a small monorepo with two independent grammar packages:

- `pasp-input/`: PASP input/config files such as `PASP.input`, `*.input`, and
  included `.str` files.
- `spin-exchange/`: `spin_exchange.dat` numeric data files.

The split keeps PASP input syntax and spin-exchange numeric rows from matching
each other's subtree shapes. Both languages can still use the same
`paspconfig server` for diagnostics, completion, hover, navigation, and other
semantic features.

## Highlight coverage

The highlight queries mirror the token groups used by `paspconfig server` as
closely as a syntax-only grammar can:

- PASP input: comments, directives, include targets, block names, setting keys,
  string values, numeric values, boolean constants, and invalid directive
  arguments.
- `spin_exchange.dat`: numeric fields, invalid fields, and comments. Section
  roles (counts, IDs, interactions and vectors) are provided by LSP semantics.

Some `spin_exchange.dat` rows are ambiguous without the LSP section parser. For
example, five-number rows can be SIA parameter lines or four-order headers, and
twelve-number rows can be DMI rows or type-3 four-order coordinate rows. The
grammar preserves rows and fields without inferring section roles from column
counts. Every invalid atom retains its field position, including `1bad` and
incomplete exponents such as `1e+`.

Version 0.2 changes the spin node contract to `row -> field -> number | invalid_atom`.
Consumers of the old `spin_*_line` nodes must migrate. The grammar does not define
fold regions; editor performance must be measured separately from parse throughput.

## Rust bindings

The workspace provides `tree-sitter-pasp-input` and `tree-sitter-spin-exchange`.
Each exports `LANGUAGE`, `NODE_TYPES`, `HIGHLIGHTS_QUERY` and `GRAMMAR_VERSION`;
PASP also exports `FOLDS_QUERY`. Generated parser, node types and queries are
versioned together. Use a fixed Git revision when depending on this repository.

```rust
let mut parser = tree_sitter::Parser::new();
parser.set_language(&tree_sitter_pasp_input::LANGUAGE.into())?;
let tree = parser.parse("Model 1\n", None).unwrap();
```

```sh
npm ci
npm run typecheck
npm run generate
npm test
cargo fmt --all --check
cargo test --workspace --locked
git diff --exit-code
```

C compilation uses the `cc` crate. Windows requires the MSVC C toolchain;
cross-compilation requires a target C compiler/sysroot in addition to Rust's
target libraries. CI builds GNU x86_64/aarch64 and musl x86_64 libraries.

## Helix

Use two grammars with two Helix languages:

```toml
[language-server.paspconfig]
command = "/path/to/pasp_config/target/release/paspconfig"
args = ["server"]
config = { diagnosticLocale = "zh-CN" }

[[language]]
name = "pasp-input"
scope = "source.pasp"
language-id = "pasp-input"
file-types = [{ glob = "PASP.input" }, { glob = "*.input" }, { glob = "*.str" }]
roots = ["PASP.input"]
grammar = "pasp_input"
language-servers = ["paspconfig"]

[[language]]
name = "spin-exchange"
scope = "source.pasp"
language-id = "spin-exchange"
file-types = [{ glob = "spin_exchange.dat" }]
roots = ["PASP.input"]
grammar = "spin_exchange"
language-servers = ["paspconfig"]

[[grammar]]
name = "pasp_input"
source = { path = "/path/to/tree-sitter-pasp/pasp-input" }

[[grammar]]
name = "spin_exchange"
source = { path = "/path/to/tree-sitter-pasp/spin-exchange" }
```

After updating `languages.toml`, run:

```sh
hx --grammar build
hx --health pasp-input
hx --health spin-exchange
```

To install the grammar and copy the query files in one step, run:

```sh
bash scripts/install-helix.sh
```

On Windows, run from PowerShell:

```powershell
.\scripts\install-helix.ps1
```

Helix loads queries by language name. The script copies each grammar's own
`queries/*.scm` files into the matching runtime query directory.

## Development

```sh
(cd pasp-input && tree-sitter generate && tree-sitter test)
(cd spin-exchange && tree-sitter generate && tree-sitter test)
```
