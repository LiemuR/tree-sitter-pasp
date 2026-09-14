//! PASP grammar and queries from the same versioned source tree.

use tree_sitter_language::LanguageFn;

unsafe extern "C" {
    fn tree_sitter_pasp_input() -> *const ();
}

pub const LANGUAGE: LanguageFn = unsafe { LanguageFn::from_raw(tree_sitter_pasp_input) };
pub const NODE_TYPES: &str = include_str!("../../src/node-types.json");
pub const HIGHLIGHTS_QUERY: &str = include_str!("../../queries/highlights.scm");
pub const FOLDS_QUERY: &str = include_str!("../../queries/folds.scm");
pub const GRAMMAR_VERSION: &str = env!("CARGO_PKG_VERSION");

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn directive_suffixes_are_not_lexed_as_known_prefixes() {
        let mut parser = tree_sitter::Parser::new();
        parser.set_language(&LANGUAGE.into()).unwrap();
        for source in ["%included x", "%blocker x", "%endblocks x"] {
            let tree = parser.parse(source, None).unwrap();
            let statement = tree.root_node().named_child(0).unwrap();
            assert_eq!(statement.kind(), "unknown_directive");
            let directive = statement.child_by_field_name("directive").unwrap();
            assert_eq!(
                directive.utf8_text(source.as_bytes()).unwrap(),
                source.split_once(' ').unwrap().0
            );
        }
    }

    #[test]
    fn eof_block_headers_keep_typed_structure() {
        let mut parser = tree_sitter::Parser::new();
        parser.set_language(&LANGUAGE.into()).unwrap();
        for source in ["%block", "%block x"] {
            let tree = parser.parse(source, None).unwrap();
            assert!(!tree.root_node().has_error());
            let block = tree.root_node().named_child(0).unwrap();
            assert_eq!(block.kind(), "block");
            assert!(block.child_by_field_name("start").is_some());
            assert!(block.child_by_field_name("end").is_none());
        }
    }

    #[test]
    fn loads_language_and_bundled_queries() {
        let language = LANGUAGE.into();
        let mut parser = tree_sitter::Parser::new();
        parser.set_language(&language).unwrap();
        let tree = parser
            .parse(
                "Model 1\n%block Spin_values\n1 2\n%endblock Spin_values\n",
                None,
            )
            .unwrap();
        assert!(
            !tree.root_node().has_error(),
            "{}",
            tree.root_node().to_sexp()
        );
        tree_sitter::Query::new(&language, HIGHLIGHTS_QUERY).unwrap();
        tree_sitter::Query::new(&language, FOLDS_QUERY).unwrap();
        let nodes: serde_json::Value = serde_json::from_str(NODE_TYPES).unwrap();
        assert!(
            nodes
                .as_array()
                .unwrap()
                .iter()
                .any(|node| node["type"] == "setting")
        );
        let metadata: serde_json::Value =
            serde_json::from_str(include_str!("../../tree-sitter.json")).unwrap();
        assert_eq!(metadata["metadata"]["version"], GRAMMAR_VERSION);
    }
}
