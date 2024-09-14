import type { LPLMConfig } from "../../lplm/parser/parser"
import { MinusToken } from "../tokens/minus"
import { NewLineToken } from "../tokens/newline"
import { NumberToken } from "../tokens/number"
import { PlusToken } from "../tokens/plus"
import { Token } from "../tokens/token"
import { WhiteSpaceToken } from "../tokens/whitespace"

export class Lexer {
    private _tokens?: Token[]
    private _tokenized = false
    private _content: string = ""
    private _index = 0

    constructor(private _config: LPLMConfig) {}

    tokenize(content: string) {
        this._content = content
        this._init()
        while (this._index < this._content.length) {
            this._tokens!.push(this._generateToken())
        }
        this._tokenized = true
    }

    getTokens(): Token[] {
        if (!this._tokenized) {
            throw "Not tokenized yet."
        }
        return this._tokens!
    }

    private _generateToken(): Token {
        const currentChar = this._content[this._index]
        switch (currentChar) {
            case "0":
            case "1":
            case "2":
            case "3":
            case "4":
            case "5":
            case "6":
            case "7":
            case "8":
            case "9":
                let numBuffer = ""
                do {
                    numBuffer += this._content[this._index]
                    this._index++
                } while (
                    this._content[this._index] &&
                    !isNaN(parseFloat(this._content[this._index]))
                )
                return new NumberToken(+numBuffer)
            case " ":
                let whiteSpaceBuffer = " "
                do {
                    whiteSpaceBuffer += " "
                    this._index++
                } while (
                    this._content[this._index] &&
                    this._content[this._index] === " "
                )
                return new WhiteSpaceToken(whiteSpaceBuffer)
            case "\n":
                this._index++
                return new NewLineToken()
            case "+":
                this._index++
                return new PlusToken()
            case "-":
                this._index++
                return new MinusToken()
        }
        throw "Invalid Char: " + this._content[this._index]
    }

    private _init() {
        this._tokenized = false
        this._tokens = []
        this._index = 0
    }
}
