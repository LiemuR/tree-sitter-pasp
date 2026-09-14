/**
 * @file PASP input grammar for tree-sitter
 * @author LiemuR <tq1l6l3cabc@163.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

export default grammar({
  name: "pasp_input",

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
      $.setting,
      $.comment,
    ),

    block: $ => prec.right(seq(
      field("start", $.block_start),
      optional(seq(
        $._newline,
        repeat(choice(
          seq($._block_line, $._newline),
          $.blank_line,
        )),
        optional(field("end", $.block_end)),
      )),
    )),

    _block_line: $ => choice(
      $.block,
      $.include_statement,
      $.setting,
      $.unknown_directive,
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
      repeat($.invalid_argument),
      optional($.line_comment),
    )),

    setting: $ => seq(
      field("key", $.setting_key),
      optional(field("value", $.setting_value)),
      optional($.line_comment),
    ),

    setting_value: $ => repeat1($._argument),

    include_arguments: $ => seq(
      field("target", $.include_target),
      repeat($.invalid_argument),
    ),

    block_arguments: $ => seq(
      field("name", $.block_name),
      repeat($.invalid_argument),
    ),

    block_body_line: $ => seq(
      repeat1($._argument),
      optional($.line_comment),
    ),

    comment: $ => $.line_comment,
    blank_line: $ => $._newline,

    include_directive: _ => token(prec(3, /%[iI][nN][cC][lL][uU][dD][eE]/)),
    block_directive: _ => token(prec(3, /%[bB][lL][oO][cC][kK]/)),
    endblock_directive: _ => token(prec(3, /%[eE][nN][dD][bB][lL][oO][cC][kK]/)),
    unknown_directive_token: _ => token(prec(3, /%[^\s#]+/)),

    block_name: _ => /[^\s#]+/,
    setting_key: _ => /[A-Za-z_][A-Za-z0-9_.-]*/,
    include_target: $ => choice($.string, $.path),
    path: _ => token(prec(-1, /[^\s#]+/)),
    value_atom: _ => token(prec(-1, /[^\s#]+/)),
    invalid_argument: _ => token(prec(-2, /[^\s#]+/)),
    string: _ => token(prec(2, choice(
      /"([^"\\]|\\.)*"/,
      /'([^'\\]|\\.)*'/,
    ))),
    number: _ => token(prec(2, /[+-]?(?:\d+\.\d*|\.\d+|\d+)(?:[eE][+-]?\d+)?/)),
    line_comment: _ => token(/#[^\r\n]*/),

    _argument: $ => choice($.string, $.number, $.value_atom),
    _newline: _ => /\r?\n/,
  }
});
