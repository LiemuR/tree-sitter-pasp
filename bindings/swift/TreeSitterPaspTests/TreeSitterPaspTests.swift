import XCTest
import SwiftTreeSitter
import TreeSitterPasp

final class TreeSitterPaspTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_pasp())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading Pasp grammar")
    }
}
