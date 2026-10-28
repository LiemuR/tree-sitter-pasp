# tree-sitter-pasp

Tree-sitter grammars for PASP configuration files, providing syntax parsing and
highlight queries.

| Directory | Grammar name | File types |
| --- | --- | --- |
| `pasp-input/` | `pasp_input` | `PASP.input`, `*.input`, `*.str` |
| `spin-exchange/` | `spin_exchange` | `spin_exchange.dat` |

`pasp_input` recognizes directives, include paths, blocks, keys and values,
strings, numbers, booleans, and comments. `spin_exchange` parses rows into
numeric and invalid fields without inferring section semantics. Its node
structure is `row → field → number | invalid_atom`.

## Helix installation

Install Helix, the Tree-sitter CLI, and a C toolchain. On Windows, use the MSVC
toolchain.

### 1. Configure the languages

Add the following to Helix's `languages.toml`. Replace both `source.path` values
with the absolute paths to the grammar directories in this repository. On
Windows, paths can use forward slashes, for example `E:/path/to/...`.

```toml
[[language]]
name = "pasp-input"
scope = "source.pasp"
language-id = "pasp-input"
file-types = [{ glob = "PASP.input" }, { glob = "*.input" }, { glob = "*.str" }]
roots = ["PASP.input"]
grammar = "pasp_input"

[[language]]
name = "spin-exchange"
scope = "source.pasp"
language-id = "spin-exchange"
file-types = [{ glob = "spin_exchange.dat" }]
roots = ["PASP.input"]
grammar = "spin_exchange"

[[grammar]]
name = "pasp_input"
source = { path = "/path/to/tree-sitter-pasp/pasp-input" }

[[grammar]]
name = "spin_exchange"
source = { path = "/path/to/tree-sitter-pasp/spin-exchange" }
```

The default Helix config directory is `~/.config/helix` on Linux and macOS,
and `%APPDATA%\helix` on Windows. The install scripts support `XDG_CONFIG_HOME`
for overriding the config root; the Helix config is stored in its `helix`
subdirectory.

### 2. Run the installer

Run the script from the repository root. It generates the parsers, builds both
Helix grammars, and copies the query files to
`runtime/queries/<language-name>/` under the Helix config directory.

Linux/macOS:

```sh
bash scripts/install-helix.sh
```

Windows PowerShell:

```powershell
.\scripts\install-helix.ps1
```

| Action | Bash option | PowerShell option |
| --- | --- | --- |
| Skip parser generation | `--skip-generate` | `-SkipGenerate` |
| Skip grammar build | `--skip-build` | `-SkipBuild` |
| Show help | `--help` | `-Help` |

### 3. Check the installation

```sh
hx --health pasp-input
hx --health spin-exchange
```

## Rust bindings

The workspace contains the `tree-sitter-pasp-input` and
`tree-sitter-spin-exchange` crates. Both export `LANGUAGE`, `NODE_TYPES`,
`HIGHLIGHTS_QUERY`, and `GRAMMAR_VERSION`; the former also exports
`FOLDS_QUERY`.

```rust
let mut parser = tree_sitter::Parser::new();
parser.set_language(&tree_sitter_pasp_input::LANGUAGE.into())?;
let tree = parser.parse("Model 1\n", None).unwrap();
```

## Development

```sh
npm ci
npm run typecheck
npm run generate
npm test
cargo fmt --all --check
cargo test --workspace --locked
```

After changing a grammar, run `npm run generate` and commit the regenerated
parser and node type files with the grammar changes.

## References

- F. Lou, X. Y. Li, J. Y. Ji, H. Y. Yu, J. S. Feng, X. G. Gong, and H. J. Xiang, PASP: Property analysis and simulation package for materials, J. Chem. Phys. 154, 114103 (2021). [https://doi.org/10.1063/5.0043703](https://doi.org/10.1063/5.0043703)
- PASP documentation: [https://www.hzwtech.com/PASP/2023A/build/html/index.html](https://www.hzwtech.com/PASP/2023A/build/html/index.html)
