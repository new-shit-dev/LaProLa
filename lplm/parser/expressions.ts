export abstract class LPLMExpression<T = unknown> {
    constructor(private value: T) {}
}

export class LPLMTextExpr extends LPLMExpression<string> {
    constructor(value: string, private isRegularExpression: boolean) {
        super(value)
    }
}

export class LPLMVariableExpr extends LPLMExpression<string> {
    constructor(value: string) {
        super(value)
    }
}

export class LPLMObjectExpr extends LPLMExpression<{} | []> {
    constructor(value: {} | []) {
        super(value)
    }
}

export type LPLMVariableType = "false" | "true" | "content"
