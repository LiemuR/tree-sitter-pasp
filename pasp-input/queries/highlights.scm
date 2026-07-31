[
  (include_directive)
  (block_directive)
  (endblock_directive)
] @keyword

(unknown_directive_token) @error
(unknown_directive (invalid_argument) @error)
(invalid_argument) @error

(setting_key) @property
(block_name) @namespace

(include_target (path) @string.special.path)
(string) @string

((number) @number)

((value_atom) @constant
  (#match? @constant "^(?:[tTfF]|[.][tT][rR][uU][eE][.]|[.][fF][aA][lL][sS][eE][.])$"))

((value_atom) @string
  (#not-match? @string "^(?:[tTfF]|[.][tT][rR][uU][eE][.]|[.][fF][aA][lL][sS][eE][.])$")
  (#not-match? @string "^[+-]?(?:[0-9]+[.][0-9]*|[.][0-9]+|[0-9]+)(?:[eE][+-]?[0-9]+)?$"))

(line_comment) @comment
