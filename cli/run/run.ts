import type { BunFile } from "bun"
import { LPLM_PARSER, type LPLMConfig } from "../../lplm/parser/parser"
import control from "../../test/TestProj/syntax.control.json"

export const runLplProject = async (cwd: string) => {
    const entryFile = await Bun.file(cwd + "/main.lpl")
    const lplmFile = await Bun.file(cwd + "/syntax.lplm")
    if (await entryFile.exists()) {
        runLplMainFile(entryFile, lplmFile)
    }
}

const runLplMainFile = async (entryFile: BunFile, lplmFile: BunFile) => {
    const entryFileContent = await entryFile.text()
    const configFileContent = await lplmFile.text()
    LPLM_PARSER.parse(configFileContent)
    const config = LPLM_PARSER.getConfig()
    printDebugTests(config)
    console.log(JSON.stringify(control["CONDITION"]["GENERIC"]))
    console.log(JSON.stringify(config["CONDITION"]["GENERIC"]))
    // printTypesDebug(config)
}

const printDebugTests = (config: LPLMConfig) => {
    console.log()
    console.log(
        "Types test: " +
            (JSON.stringify(control["TYPES"]) ===
                JSON.stringify(config["TYPES"]))
    )
    console.log(
        "Cond test: " +
            (JSON.stringify(control["CONDITION"]["GENERIC"]) ===
                JSON.stringify(config["CONDITION"]["GENERIC"]))
    )
    console.log(
        "Var test: " +
            (JSON.stringify(control["VARIABLES"]) ===
                JSON.stringify(config["VARIABLES"]))
    )
    console.log(
        "Block test: " +
            (JSON.stringify(control["BLOCK"]) ===
                JSON.stringify(config["BLOCK"]))
    )
    console.log(
        "Mem man test: " +
            (JSON.stringify(control["MEMORY MANAGEMENT"]) ===
                JSON.stringify(config["MEMORY MANAGEMENT"]))
    )
    console.log()
}

const printTypesDebug = (config: LPLMConfig) => {
    console.log("-------------------------------------")
    console.log("           Res                       ")
    console.log("-------------------------------------")
    console.log(config["TYPES"])
    console.log("-------------------------------------")
    console.log([
        {
            NUMBER: {
                PATTERN: JSON.stringify({
                    value: "value",
                    isRegularExpression: false,
                }),
                BEHAVIOR: JSON.stringify({
                    value: "js-number",
                    isRegularExpression: false,
                }),
            },
        },
    ])
    console.log("-------------------------------------")
    console.log("-------------------------------------")
    console.log(config["TYPES"]["NUMBER"])
    console.log("-------------------------------------")
    console.log({
        PATTERN: {
            value: "/[+-]? ?d?[.,]?d/",
            isRegularExpression: true,
        },
        BEHAVIOR: {
            value: "js-number",
            isRegularExpression: false,
        },
    })
    console.log("-------------------------------------")
    console.log("-------------------------------------")
    console.log(config["TYPES"]["NUMBER"]["PATTERN"])
    console.log("-------------------------------------")
    console.log([
        {
            value: "/[+-]? ?d?[.,]?d/",
            isRegularExpression: true,
        },
    ])
    console.log("-------------------------------------")
    console.log("-------------------------------------")
    console.log(config["TYPES"]["NUMBER"]["BEHAVIOR"])
    console.log("-------------------------------------")
    console.log([
        {
            value: "js-number",
            isRegularExpression: false,
        },
    ])
    console.log("-------------------------------------")
    console.log("-------------------------------------")
}
