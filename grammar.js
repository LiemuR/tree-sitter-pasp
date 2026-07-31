/**
 * @file Pasp grammar for tree-sitter
 * @author LiemuR <tq1l6l3cabc@163.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

export default grammar({
  name: "pasp",

  extras: $ => [/[ \t\f\v]+/],

  rules: {
    source_file: $ => seq(
      repeat(choice(seq($._line, $._newline), $.blank_line)),
      optional($._line),
    ),

    _line: $ => choice(
      $.block,
      $.include_statement,
      $.endblock_statement,
      $.unknown_directive,
      $.numeric_statement,
      $.setting,
      $.comment,
    ),

    block: $ => prec.right(seq(
      $.block_start,
      $._newline,
      repeat(choice(
        seq($._block_line, $._newline),
        $.blank_line,
      )),
      optional($.block_end),
    )),

    _block_line: $ => choice(
        $.block,
        $.include_statement,
        $.numeric_statement,
        $.setting,
        $.comment,
        $.block_body_line,
    ),

    include_statement: $ => prec.right(seq(
      field("directive", $.include_directive),
      optional($.include_arguments),
      optional($.line_comment),
    )),

    block_start: $ => prec.right(seq(
      field("directive", $.block_directive),
      optional($.block_arguments),
      optional($.line_comment),
    )),

    block_end: $ => prec.right(seq(
      field("directive", $.endblock_directive),
      optional($.block_arguments),
      optional($.line_comment),
    )),

    endblock_statement: $ => $.block_end,

    unknown_directive: $ => prec.right(seq(
      field("directive", $.unknown_directive_token),
      repeat($._argument),
      optional($.line_comment),
    )),

    setting: $ => seq(
      field("key", $.setting_key),
      optional(field("value", $.setting_value)),
      optional($.line_comment),
    ),

    setting_value: $ => repeat1($._argument),

    include_arguments: $ => seq(
      field("target", $._argument),
      repeat($._argument),
    ),

    block_arguments: $ => seq(
      field("name", $.block_name),
      repeat($._argument),
    ),

    numeric_statement: $ => prec(2, seq(
      $.number,
      repeat(choice($.number, $.data_token)),
      optional($.line_comment),
    )),

    block_body_line: $ => seq(
      repeat1($._argument),
      optional($.line_comment),
    ),

    comment: $ => $.line_comment,
    blank_line: $ => $._newline,

    include_directive: _ => token(prec(3, /%[iI][nN][cC][lL][uU][dD][eE]/)),
    block_directive: _ => token(prec(3, /%[bB][lL][oO][cC][kK]/)),
    endblock_directive: _ => token(prec(3, /%[eE][nN][dD][bB][lL][oO][cC][kK]/)),
    unknown_directive_token: _ => token(prec(1, /%[^\s#]+/)),

    block_name: _ => /[^\s#]+/,
    setting_key: _ => /[A-Za-z_][A-Za-z0-9_.-]*/,
    data_token: _ => token(prec(-1, /[^\s#]+/)),
    path: _ => /[^\s#]+/,
    string: _ => token(prec(2, choice(
      /"([^"\\]|\\.)*"/,
      /'([^'\\]|\\.)*'/,
    ))),
    number: _ => token(prec(2, /[+-]?(?:\d+\.\d*|\.\d+|\d+)(?:[eE][+-]?\d+)?/)),
    line_comment: _ => token(/#[^\r\n]*/),

    _argument: $ => choice($.string, $.number, $.path),
    _newline: _ => /\r?\n/,
  }
});
