import { printBaseHelpMessage } from "./help"
import { initLaProLaProject, type LaProLaProjectConfig } from "./init/init"
import { runLplProject } from "./run/run"

export const handleCli = async (cmdArgs: string[]) => {
    const cwd = await process.cwd()
    const scriptLocation = cmdArgs[1]
    const firstCmdArg = cmdArgs[2]
    if (!firstCmdArg) {
        printBaseHelpMessage()
    }
    switch (firstCmdArg) {
        case "init":
            await initLaProLaProject(
                getLaProLaProjectConfigParams(cmdArgs.slice(3))
            )
            break
        case "run":
            await runLplProject(cwd)
            break
        default:
            if (
                firstCmdArg === "h" ||
                firstCmdArg === "-h" ||
                firstCmdArg.includes("help")
            ) {
                printBaseHelpMessage()
            }
    }
}

const getLaProLaProjectConfigParams = (cmdArgs: string[]) => {
    const dir = /(--((new)?(-)?([Dd]ir(ectory)?)))|-d/
    const isConfigParam = (arg: string) => {
        const regEx = new RegExp(`/${dir}|--flat/`)
        return regEx.test(arg)
    }
    const config: LaProLaProjectConfig = {
        dirName: "",
        flat: false,
    }
    for (let i = 0; i < cmdArgs.length; i++) {
        if (!isConfigParam(cmdArgs[i])) {
            if (config.dirName) continue
            config.dirName = cmdArgs[i]
        }
        const dirStr = dir + ""
        const regExprRes = cmdArgs[i].match(
            new RegExp(
                `(?<=(${dirStr.substring(1, dirStr.length - 1)}))=.*`,
                "g"
            )
        )
        const cutStr = regExprRes ? regExprRes[0].substring(1) : null
        if (!cutStr) {
            if (cmdArgs.length === i) {
                // invalid if not bool flag
                continue
            }
            if (isConfigParam(cmdArgs[i + 1])) {
                // maybe invalid not on bool flags
                continue
            } else {
                if (dir.test(cmdArgs[i])) {
                    config.dirName = cmdArgs[i + 1]
                    continue
                }
            }
        }
        config.dirName = cutStr!
    }
    return config
}
