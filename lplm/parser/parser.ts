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
    private lines: string[] = []
    private configFile?: LPLMConfig
    private index: number = 0

    parse(fileContent: string) {
        this._init()
        this.lines = fileContent.split("\n")
        // I don't know if this code is even supposed to be legal
        for (; this.index < this.lines.length; this.index++) {
            if (this.lines[this.index].trim().startsWith("#")) {
                continue
            }
            const [config, expr] = this.lines[this.index]
                .split("=")
                .map((values) => values.trim())
            switch (config) {
                case "CONDITION GENERIC":
                    this.configFile!.CONDITION = {
                        GENERIC: this._parseExpression(expr)!,
                    }
                    break
                case "TYPES":
                    this.configFile!.TYPES = this._parseObjectExpression()
                    break
                case "VARIABLES":
                    this.configFile!.VARIABLES = this._parseObjectExpression()
                    break
                case "BLOCK STATEMENT":
                    this.configFile!.BLOCK = this._parseObjectExpression()
                    break
                case "MEMORY MANAGEMENT":
                    switch (expr) {
                        case "NONE":
                            this.configFile!["MEMORY MANAGEMENT"] = "NONE"
                            break
                    }
                    break
            }
        }
    }

    getConfig() {
        return this.configFile!
    }

    private _init() {
        this.index = 0
        this.lines = []
        this.configFile = {
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
    }

    private _parseObjectExpression() {
        let obj: any = {}
        let currentKeys: string[] = []
        do {
            this.index++
            if (this.lines[this.index].trim().startsWith("#")) {
                continue
            }
            const charBeforeEquals =
                this.lines[this.index][this.lines[this.index].indexOf("=") - 1]
            if (charBeforeEquals === undefined || charBeforeEquals === "\\") {
            } else {
                const [config, expr] = this.lines[this.index].split("=")
                let expression = this._parseExpression(expr.trim())
                if (!expression) {
                    currentKeys.push(config.trim().toUpperCase())
                    obj[currentKeys[0]] = {}
                    continue
                } else {
                    currentKeys = [config.trim().toUpperCase(), ...currentKeys]
                    const newObj = this.__recursiveAssignement2(
                        { ...obj },
                        currentKeys.toReversed(),
                        expression
                    )
                    currentKeys.splice(0, 1)
                    obj[currentKeys[0]] = {
                        ...obj[currentKeys[0]],
                        ...newObj[currentKeys[0]],
                    }
                }
            }
        } while (
            this.lines[this.index].endsWith(",") &&
            !this.lines[this.index].endsWith(",,")
        )
        return obj
    }

    private _parseExpression(expression: string) {
        let expressions: LPLMExpression[] = []
        let text = ""
        for (let i = 0; i < expression.length; i++) {
            if (this.lines[this.index].trim().startsWith("#")) continue
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

    // private __recursiveAssignement(
    //     object: any,
    //     propertyKeys: string[],
    //     value: any
    // ) {
    //     if (propertyKeys.length > 1) {
    //         propertyKeys.splice(0, 1)
    //         object = this.__recursiveAssignement(object, propertyKeys, value)
    //         debugger
    //         object[propertyKeys[0]] = value
    //     } else {
    //         return object[propertyKeys[0]]
    //     }
    //     return object
    // }

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
            // console.log(object, currentPropertyKey, propertyKeys[0])
            return object
        } else {
            // if (object) {
            //     object[propertyKeys[0]] = value
            //     return
            // }
            return { [propertyKeys[0]]: value }
        }
    }
})()
