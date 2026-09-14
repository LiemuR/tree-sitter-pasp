/**
 * @file Lossless rows for spin_exchange.dat; section semantics are contextual.
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

export default grammar({
  name: "spin_exchange",

  extras: $ => [/[ \t\f\v]+/],

  rules: {
    source_file: $ => seq(
      optional('\uFEFF'),
      repeat(choice(seq($._line, $._newline), $.blank_line)),
      optional($._line),
    ),

    _line: $ => choice($.row, $.comment),
    row: $ => seq(repeat1($.field), optional($.line_comment)),
    field: $ => choice($.number, $.invalid_atom),

    // Equal lexical precedence lets the longest whole field win over a numeric prefix.
    number: _ => /[+-]?(?:\d+\.\d*|\.\d+|\d+)(?:[eE][+-]?\d+)?/,
    invalid_atom: _ => /[^\s#]+/,
    comment: $ => $.line_comment,
    line_comment: _ => token(/#[^\r\n]*/),
    blank_line: $ => $._newline,
    _newline: _ => /\r?\n/,
  },
});
