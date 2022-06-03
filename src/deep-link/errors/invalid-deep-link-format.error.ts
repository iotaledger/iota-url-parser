export class InvalidDeepLinkFormatError extends Error {
    constructor(reason = '') {
        super(`Invalid deep link format${reason ? ': ' + reason : ''}`)

        Object.setPrototypeOf(this, InvalidDeepLinkFormatError.prototype)
    }
}
