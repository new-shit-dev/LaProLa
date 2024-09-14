import { Token } from "./token"

export class NumberToken extends Token {
    constructor(public value: number) {
        super()
    }
}
