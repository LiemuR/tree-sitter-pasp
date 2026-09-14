//! Lossless spin-exchange rows; section roles belong to semantic analysis.

use tree_sitter_language::LanguageFn;

unsafe extern "C" {
    fn tree_sitter_spin_exchange() -> *const ();
}

pub const LANGUAGE: LanguageFn = unsafe { LanguageFn::from_raw(tree_sitter_spin_exchange) };
pub const NODE_TYPES: &str = include_str!("../../src/node-types.json");
pub const HIGHLIGHTS_QUERY: &str = include_str!("../../queries/highlights.scm");
pub const GRAMMAR_VERSION: &str = env!("CARGO_PKG_VERSION");

#[cfg(test)]
mod tests {
    use super::*;

    fn fields(text: &str) -> Vec<Vec<(String, String)>> {
        let mut parser = tree_sitter::Parser::new();
        parser.set_language(&LANGUAGE.into()).unwrap();
        let tree = parser.parse(text, None).unwrap();
        assert!(
            !tree.root_node().has_error(),
            "{}",
            tree.root_node().to_sexp()
        );
        let mut cursor = tree.walk();
        tree.root_node()
            .named_children(&mut cursor)
            .filter(|node| node.kind() == "row")
            .map(|row| {
                let mut cursor = row.walk();
                row.named_children(&mut cursor)
                    .filter(|node| node.kind() == "field")
                    .map(|field| {
                        let atom = field.named_child(0).unwrap();
                        (
                            atom.kind().to_owned(),
                            atom.utf8_text(text.as_bytes()).unwrap().to_owned(),
                        )
                    })
                    .collect()
            })
            .collect()
    }

    #[test]
    fn invalid_atoms_preserve_column_and_line_boundaries() {
        let rows = fields("1 bad 2 3\r\n1bad 1e+ 1+2 # comment\r\n-1 .5 1.e2");
        assert_eq!(
            rows,
            vec![
                vec![
                    ("number".into(), "1".into()),
                    ("invalid_atom".into(), "bad".into()),
                    ("number".into(), "2".into()),
                    ("number".into(), "3".into())
                ],
                vec![
                    ("invalid_atom".into(), "1bad".into()),
                    ("invalid_atom".into(), "1e+".into()),
                    ("invalid_atom".into(), "1+2".into())
                ],
                vec![
                    ("number".into(), "-1".into()),
                    ("number".into(), ".5".into()),
                    ("number".into(), "1.e2".into())
                ],
            ]
        );
    }

    #[test]
    fn comments_empty_lines_and_bom_do_not_create_fields() {
        assert_eq!(
            fields("\u{feff}# heading\n\n  1\n# tail"),
            vec![vec![("number".into(), "1".into())]]
        );
        assert!(fields("").is_empty());
    }

    #[test]
    fn loads_query_and_versioned_node_contract() {
        tree_sitter::Query::new(&LANGUAGE.into(), HIGHLIGHTS_QUERY).unwrap();
        let nodes: serde_json::Value = serde_json::from_str(NODE_TYPES).unwrap();
        assert!(
            nodes
                .as_array()
                .unwrap()
                .iter()
                .any(|node| node["type"] == "invalid_atom")
        );
        let metadata: serde_json::Value =
            serde_json::from_str(include_str!("../../tree-sitter.json")).unwrap();
        assert_eq!(metadata["metadata"]["version"], GRAMMAR_VERSION);
    }
}
