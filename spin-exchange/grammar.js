/**
 * @file spin_exchange.dat grammar for tree-sitter
 * @author LiemuR <tq1l6l3cabc@163.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

export default grammar({
  name: "spin_exchange",

  extras: $ => [/[ \t\f\v]+/],

  rules: {
    source_file: $ => seq(
      repeat(choice(seq($._line, $._newline), $.blank_line)),
      optional($._line),
    ),

    _line: $ => choice(
      $.numeric_statement,
      $.comment,
    ),

    numeric_statement: $ => prec(3, seq(
      choice(
        $.spin_j_matrix_line,
        $.spin_j_scalar_line,
        $.spin_dmi_line,
        $.spin_four_order_coordinates,
        $.spin_five_field_line,
        $.spin_vector_line,
        $.spin_count_line,
      ),
      optional($.line_comment),
    )),

    comment: $ => $.line_comment,
    blank_line: $ => $._newline,

    number: _ => token(prec(2, /[+-]?(?:\d+\.\d*|\.\d+|\d+)(?:[eE][+-]?\d+)?/)),
    line_comment: _ => token(/#[^\r\n]*/),

    spin_count_line: $ => prec(3, $.number),
    spin_vector_line: $ => prec(3, seq($.number, $.number, $.number)),
    spin_five_field_line: $ => prec(3, seq($.number, $.number, $.number, $.number, $.number)),
    spin_j_scalar_line: $ => prec(3, seq(
      $.number,
      $.number,
      $.number,
      $.number,
      $.number,
      $.number,
      $.number,
      $.number,
      $.number,
      $.number,
    )),
    spin_dmi_line: $ => prec(4, seq(
      $.number,
      $.number,
      $.number,
      $.number,
      $.number,
      $.number,
      $.number,
      $.number,
      $.number,
      $.number,
      $.number,
      $.number,
    )),
    spin_j_matrix_line: $ => prec(3, seq(
      $.number,
      $.number,
      $.number,
      $.number,
      $.number,
      $.number,
      $.number,
      $.number,
      $.number,
      $.number,
      $.number,
      $.number,
      $.number,
      $.number,
      $.number,
      $.number,
      $.number,
      $.number,
    )),
    spin_four_order_coordinates: $ => prec(3, choice(
      seq($.number, $.number, $.number, $.number, $.number, $.number),
      seq($.number, $.number, $.number, $.number, $.number, $.number, $.number, $.number, $.number),
      seq($.number, $.number, $.number, $.number, $.number, $.number, $.number, $.number, $.number, $.number, $.number, $.number),
    )),

    _newline: _ => /\r?\n/,
  }
});
