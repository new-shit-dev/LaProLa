import { access, mkdir, stat, writeFile } from "node:fs/promises"
import { LPLM_FILE_CONTENT } from "./defaultFileContent"

export type LaProLaProjectConfig = {
    flat: boolean
    dirName: string
}

export const initLaProLaProject = async (config: LaProLaProjectConfig) => {
    // make this better
    config.dirName =
        config.dirName.startsWith("./") || config.dirName.startsWith("/")
            ? config.dirName
            : "./" + config.dirName
    config.dirName = config.dirName.endsWith("/")
        ? config.dirName
        : config.dirName + "/"

    try {
        const foundThing = await stat(config.dirName)
    } catch (err) {
        if (err) {
            try {
                await mkdir(config.dirName, { recursive: true })
                await writeFile(
                    config.dirName + "syntax.lplm",
                    LPLM_FILE_CONTENT
                )
            } catch (err) {
                if (err) {
                    // add error handling
                }
            }
        }
    }
}
