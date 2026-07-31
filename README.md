# tree-sitter-pasp

Tree-sitter grammar for PASP input/config files and `spin_exchange.dat` numeric
data files.

The grammar is intentionally syntax-focused. Use `paspconfig server` for PASP
diagnostics, completion, include navigation, document links, and spin-exchange
hover/code-lens features.

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

## Development

```sh
tree-sitter generate
tree-sitter test
```
