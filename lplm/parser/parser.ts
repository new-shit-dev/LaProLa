import { LPLMExpression, LPLMTextExpr, LPLMVariableExpr } from "./expressions"
// import { LPLMExprStatement, LPLMStatement } from "./statements"

export type LPLMConfig = {
    CONDITION: {
        GENERIC: LPLMExpression[]
    }
    TYPES: {
        [name: string]: {
            PATTERN: LPLMExpression[]
            BEHAVIOR: "js-number"
        }
    }
    VARIABLES: {
        PATTERN: LPLMExpression[]
        DEFINITION: LPLMExpression[] | LPLMExpression[][]
    }
    BLOCK: {
        DEFINITION: LPLMExpression[] | LPLMExpression[][]
    }
    "MEMORY MANAGEMENT": "NONE"
}

export const LPLM_PARSER = new (class Parser {
    private _lines: string[] = []
    private _configFile?: LPLMConfig
    private _lineIndex: number = 0
    private _parsed = false

    parse(fileContent: string) {
        this._init()
        this._lines = fileContent.split("\n")
        // I don't know if this code is even supposed to be legal
        for (; this._lineIndex < this._lines.length; this._lineIndex++) {
            if (this._lines[this._lineIndex].trim().startsWith("#")) {
                continue
            }
            const [config, expr] = this._lines[this._lineIndex]
                .split("=")
                .map((values) => values.trim())
            switch (config) {
                case "CONDITION GENERIC":
                    this._configFile!.CONDITION = {
                        GENERIC: this._parseExpression(expr)!,
                    }
                    break
                case "TYPES":
                    this._configFile!.TYPES = this._parseListObjectExpression()
                    break
                case "VARIABLES":
                    this._configFile!.VARIABLES =
                        this._parseListObjectExpression()
                    break
                case "BLOCK":
                    this._configFile!.BLOCK = this._parseListObjectExpression()
                    break
                case "MEMORY MANAGEMENT":
                    switch (expr) {
                        case "NONE":
                            this._configFile!["MEMORY MANAGEMENT"] = "NONE"
                            break
                    }
                    break
            }
        }
        this._parsed = true
    }

    getConfig() {
        if (!this._parsed) {
            throw "Not parsed yet lol"
        }
        return this._configFile!
    }

    private _init() {
        this._lineIndex = 0
        this._lines = []
        this._configFile = {
            "MEMORY MANAGEMENT": "NONE",
            BLOCK: {
                DEFINITION: [],
            },
            CONDITION: {
                GENERIC: [],
            },
            TYPES: {},
            VARIABLES: {
                DEFINITION: [],
                PATTERN: [],
            },
        }
        this._parsed = false
    }

    private _parseListObjectExpression() {
        let obj: any = {}
        let list: any[] = []
        let currentKeys: string[] = []

        do {
            this._lineIndex++
            if (this._lines[this._lineIndex].trim().startsWith("#")) {
                continue
            }
            const charBeforeEquals =
                this._lines[this._lineIndex][
                    this._lines[this._lineIndex].indexOf("=") - 1
                ]
            if (charBeforeEquals === undefined || charBeforeEquals === "\\") {
                this._parseListObject(list)
                // means type=list
            } else {
                const peekCharBeforeEquals =
                    this._lines[this._lineIndex + 1][
                        this._lines[this._lineIndex + 1].indexOf("=") - 1
                    ]
                if (
                    peekCharBeforeEquals === undefined ||
                    peekCharBeforeEquals === "\\"
                ) {
                    this._parseListObject(list, currentKeys)

                    const newObj = this.__recursiveAssignement2(
                        structuredClone(obj),
                        currentKeys.toReversed(),
                        list
                    )
                    obj = {
                        ...obj,
                        ...newObj,
                    }
                } else {
                    // if (list.length > 0) {
                    //     this.__recursiveAssignement2(
                    //         structuredClone(obj),
                    //         currentKeys.toReversed(),
                    //         list
                    //     )
                    //     list = []
                    // }
                    this._parsePureObject(obj, currentKeys)
                    // obj[currentKeys[currentKeys.length - 1]] = {
                    //     ...obj,
                    //     ...newObj[currentKeys[currentKeys.length - 1]],
                    // }
                }
            }
        } while (
            this._lines[this._lineIndex].endsWith(",") &&
            !this._lines[this._lineIndex].endsWith(",,")
        )
        if (list.length > 0) {
            const newObj = this.__recursiveAssignement2(
                structuredClone(obj),
                currentKeys.toReversed(),
                list
            )
            obj = {
                ...obj,
                ...newObj,
            }
        }
        return obj
    }

    private _parseListObject(list: any[], currentKeys?: string[]) {
        if (this._lines[this._lineIndex].indexOf("=") === -1) {
            list.push(
                this._parseExpression(this._lines[this._lineIndex].trim())!
            )
        } else {
            const [config, expr] = this._lines[this._lineIndex].split("=")
            currentKeys!.push(config.trim().toUpperCase())
            list.push(this._parseExpression(expr.trim())!)
        }
    }

    private _parsePureObject(obj: any, currentKeys: string[]) {
        const [config, expr] = this._lines[this._lineIndex].split("=")
        let expression = this._parseExpression(expr.trim())
        if (!expression) {
            currentKeys.push(config.trim().toUpperCase())
            obj[currentKeys[0]] = {}
            return
        }
        currentKeys = [config.trim().toUpperCase(), ...currentKeys]
        const newObj = this.__recursiveAssignement2(
            structuredClone(obj),
            currentKeys.toReversed(),
            expression
        )
        if (currentKeys.length > 1) {
            currentKeys.splice(0, 1)
        }
        if (obj[currentKeys[currentKeys.length - 1]]) {
            obj[currentKeys[currentKeys.length - 1]] = {
                ...obj[currentKeys[currentKeys.length - 1]],
                ...newObj[currentKeys[currentKeys.length - 1]],
            }
        } else {
            obj[currentKeys[currentKeys.length - 1]] =
                newObj[currentKeys[currentKeys.length - 1]]
        }
        // else {
        //     if (obj[currentKeys[0]]) {
        //         obj[currentKeys[0]] = {
        //             ...obj[currentKeys[0]],
        //             ...newObj[currentKeys[0]],
        //         }
        //     } else {
        //         obj[currentKeys[0]] = newObj[currentKeys[0]]
        //     }
        // }
    }

    private _parseExpression(expression: string) {
        let expressions: LPLMExpression[] = []
        let text = ""
        for (let i = 0; i < expression.length; i++) {
            if (this._lines[this._lineIndex].trim().startsWith("#")) continue
            if (expression[i] === "$") {
                if (text) {
                    expressions.push(this._parseTextExpression(text))
                    text = ""
                }
                let varName = ""
                i++
                do {
                    varName += expression[i++]
                } while (
                    expression[i] &&
                    expression[i].match(/\S/) &&
                    (expression[i] !== "," || expression[i + 1] === ",")
                )
                expressions.push(this._parseVariableExpression(varName))
                if (i >= expression.length) break
            }
            if (expression[i] === "," && expression[i + 1] !== ",") continue
            text += expression[i]
        }
        if (text) {
            expressions.push(this._parseTextExpression(text))
        }
        return expressions.length > 0 ? expressions : undefined
    }

    private _parseVariableExpression(variableName: string) {
        return new LPLMVariableExpr(variableName)
    }

    private _parseTextExpression(text: string) {
        return new LPLMTextExpr(
            text,
            text[0] === "/" && text[text.length - 1] === "/"
        )
    }

    private __recursiveAssignement2(
        object: any,
        propertyKeys: string[],
        value: any
    ) {
        if (propertyKeys.length > 1) {
            const currentPropertyKey = propertyKeys[0]
            propertyKeys.splice(0, 1)
            value = this.__recursiveAssignement2(object, propertyKeys, value)
            object[currentPropertyKey] = value
            return object
        } else {
            // if (object) {
            //     object[propertyKeys[0]] = value
            // }
            // return object[propertyKeys[0]]
            return { [propertyKeys[0]]: value }
        }
    }
})()
