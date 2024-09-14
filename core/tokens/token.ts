export abstract class Token {
    get type() {
        return this.constructor.name
    }
}
