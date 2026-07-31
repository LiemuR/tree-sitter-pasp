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

((value_atom) @number
  (#match? @number "^[+-]?(?:[0-9]+[.][0-9]*|[.][0-9]+|[0-9]+)(?:[eE][+-]?[0-9]+)?$"))

((value_atom) @constant
  (#match? @constant "^(?:[tTfF]|[.][tT][rR][uU][eE][.]|[.][fF][aA][lL][sS][eE][.])$"))

((value_atom) @string
  (#not-match? @string "^[+-]?(?:[0-9]+[.][0-9]*|[.][0-9]+|[0-9]+)(?:[eE][+-]?[0-9]+)?$")
  (#not-match? @string "^(?:[tTfF]|[.][tT][rR][uU][eE][.]|[.][fF][aA][lL][sS][eE][.])$"))

(line_comment) @comment

(spin_count_line
  (number) @constant.numeric.integer)

(spin_vector_line
  (number) @variable.parameter
  (number) @variable.parameter
  (number) @variable.parameter)

(spin_j_scalar_line
  (number) @constant.builtin
  (number) @number.float
  (number) @type
  (number) @type
  (number) @variable.parameter
  (number) @variable.parameter
  (number) @variable.parameter
  (number) @variable.parameter
  (number) @variable.parameter
  (number) @variable.parameter)

(spin_j_matrix_line
  (number) @constant.builtin
  (number) @number.float
  (number) @number.float
  (number) @number.float
  (number) @number.float
  (number) @number.float
  (number) @number.float
  (number) @number.float
  (number) @number.float
  (number) @number.float
  (number) @type
  (number) @type
  (number) @variable.parameter
  (number) @variable.parameter
  (number) @variable.parameter
  (number) @variable.parameter
  (number) @variable.parameter
  (number) @variable.parameter)

(spin_dmi_line
  (number) @constant.builtin
  (number) @number.float
  (number) @number.float
  (number) @number.float
  (number) @type
  (number) @type
  (number) @variable.parameter
  (number) @variable.parameter
  (number) @variable.parameter
  (number) @variable.parameter
  (number) @variable.parameter
  (number) @variable.parameter)

(spin_four_order_coordinates
  (number) @variable.parameter)

(spin_five_field_line
  (number) @number)

(spin_data_line
  (number) @number)
