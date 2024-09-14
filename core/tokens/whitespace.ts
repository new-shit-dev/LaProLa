import { Token } from "./token"

export class WhiteSpaceToken extends Token {
    constructor(public whitespace: string) {
        super()
    }
}
