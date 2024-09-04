// prettier-ignore
export const LPLM_FILE_CONTENT =
`CONDITION GENERIC = $condition ? $true : $false
TYPES = ,
    number = ,
        pattern = /[+-]? ?\d?[.,]?\d/,
        behavior = js-number
VARIABLES = ,
    pattern = /^[A-Za-z_]\w*/,
    definition = $pattern,
    $pattern : $type
BLOCK = ,
    definition = { $content }
MEMORY MANAGEMENT = NONE
`
