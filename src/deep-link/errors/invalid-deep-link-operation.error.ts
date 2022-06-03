export class InvalidDeepLinkOperationError extends Error {
    constructor(reason = '') {
        super(`Invalid deep link operation${reason ? ': ' + reason : ''}`)

        Object.setPrototypeOf(this, InvalidDeepLinkOperationError.prototype)
    }
}
