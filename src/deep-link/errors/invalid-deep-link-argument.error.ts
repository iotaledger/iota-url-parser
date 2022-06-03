export class InvalidDeepLinkArgumentError extends Error {
    constructor(reason = '') {
        super(`Invalid deep link argument(s)${reason ? ': ' + reason : ''}`)

        Object.setPrototypeOf(this, InvalidDeepLinkArgumentError.prototype)
    }
}
