const NAME = "LaProLa Cli - The LAst PROgramming LAnguage you need to learn 😉"

const USAGE = ""

// prettier-ignore
const HELP_MESSAGE_BASE =
`${NAME}
${USAGE}
`

export const printBaseHelpMessage = () => {
    console.log(HELP_MESSAGE_BASE)
    process.exit(0)
}
