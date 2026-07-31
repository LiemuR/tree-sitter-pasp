package tree_sitter_pasp_test

import (
	"testing"

	tree_sitter "github.com/tree-sitter/go-tree-sitter"
	tree_sitter_pasp "github.com/liemur/tree-sitter-pasp/bindings/go"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_pasp.Language())
	if language == nil {
		t.Errorf("Error loading Pasp grammar")
	}
}
