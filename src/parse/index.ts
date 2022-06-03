import * as qs from 'qs'

import {
    DeepLinkArgument,
    DeepLinkContext,
    DeepLinkOperation,
    DeepLinkParameters,
    DeepLinkProtocol,
    DeepLinkUri,
    IDeepLink,
    InvalidDeepLinkFormatError,
    ISendOperationParameters,
    SendOperationParameter,
    WalletOperation,
    WalletOperationParameters,
} from '@src/deep-link'
import { InvalidUnitError, IotaUnit } from '@src/utils'

import { PATH_PARAM_REGEXP } from './constants'

export function parse(uri: DeepLinkUri): IDeepLink | undefined {
    try {
        const uriSplits = uri.split('?')
        const tokens = new RegExp(PATH_PARAM_REGEXP).exec(uriSplits[0])?.slice(1) ?? []
        const queryString = uriSplits.length > 1 ? uriSplits[1] : ''

        return parseRawTokens(tokens, queryString)
    } catch (error) {
        console.error(error)
        throw error
    }
}

function parseRawTokens(tokens: string[], queryString = ''): IDeepLink {
    const isFullyFormed = tokens.length >= 4
    if (!isFullyFormed) {
        throw new InvalidDeepLinkFormatError()
    }

    const rawProtocol = tokens[0]
    const rawContext = tokens[1]
    const rawOperation = tokens[2]
    const rawArgument = tokens[3]

    const protocol = validateProtocol(rawProtocol)
    const context = validateContext(rawContext)
    const operation = validateOperation(context, rawOperation)
    const argument = validateArgument(context, operation, rawArgument)

    if (queryString) {
        const castedParameters = new Object(qs.parse(queryString))
        const parameters = validateParameters(context, operation, castedParameters)

        return <IDeepLink>{
            protocol,
            context,
            operation,
            argument,
            parameters,
        }
    } else {
        return <IDeepLink>{
            protocol,
            context,
            operation,
            argument,
        }
    }
}

function validateProtocol(rawProtocol: string): DeepLinkProtocol {
    const isValidProtocol = Object.values(DeepLinkProtocol).includes(rawProtocol as DeepLinkProtocol)
    if (!isValidProtocol) {
        throw new InvalidDeepLinkFormatError('given protocol is not supported')
    }

    return rawProtocol as DeepLinkProtocol
}

function validateContext(rawContext: string): DeepLinkContext {
    const isValidContext = Object.values(DeepLinkContext).includes(rawContext as DeepLinkContext)
    if (!isValidContext) {
        throw new InvalidDeepLinkFormatError('given context is not supported')
    }

    return rawContext as DeepLinkContext
}

function validateOperation(context: DeepLinkContext, rawOperation: string): DeepLinkOperation {
    switch (context) {
        case DeepLinkContext.Wallet:
            return validateWalletOperation(rawOperation)
        default:
            return rawOperation as DeepLinkOperation
    }
}

function validateWalletOperation(rawOperation: string): WalletOperation {
    const isValidWalletOperation = Object.values(WalletOperation).includes(rawOperation as WalletOperation)
    if (!isValidWalletOperation) {
        throw new InvalidDeepLinkFormatError('given operation is not supported')
    }

    return rawOperation as WalletOperation
}

function validateArgument(
    context: DeepLinkContext,
    operation: DeepLinkOperation,
    rawArgument: string
): DeepLinkArgument {
    switch (context) {
        case DeepLinkContext.Wallet:
            return validateWalletOperationArgument(operation, rawArgument)
        default:
            throw new InvalidDeepLinkFormatError('given argument is not supported')
    }
}

function validateWalletOperationArgument(operation: WalletOperation, rawArgument: string): DeepLinkArgument {
    switch (operation) {
        case WalletOperation.Send:
            return validateBech32Address(rawArgument)
        default:
            throw new InvalidDeepLinkFormatError('given wallet operation argument was invalid')
    }
}

function validateBech32Address(address: string): string {
    return address
}

function validateParameters(
    context: DeepLinkContext,
    operation: DeepLinkOperation,
    rawParameters: object
): DeepLinkParameters {
    switch (context) {
        case DeepLinkContext.Wallet:
            return validateWalletOperationParameters(operation, rawParameters)
        default:
            throw new InvalidDeepLinkFormatError('given parameters were invalid')
    }
}

function validateWalletOperationParameters(
    operation: WalletOperation,
    rawParameters: object
): WalletOperationParameters {
    switch (operation) {
        case WalletOperation.Send:
            return validateSendOperationParameters(rawParameters as ISendOperationParameters)
        default:
            throw new InvalidDeepLinkFormatError('given wallet operation parameters were invalid')
    }
}

function validateSendOperationParameters(rawParameters: ISendOperationParameters): ISendOperationParameters {
    const parameters = <WalletOperationParameters>{}
    for (const param of Object.keys(rawParameters)) {
        switch (param) {
            case SendOperationParameter.Amount:
                parameters.amount = validateAmount(String(rawParameters[param]))
                break
            case SendOperationParameter.Unit:
                parameters.unit = validateIotaUnit(String(rawParameters[param]))
                break
            default:
                throw new InvalidDeepLinkFormatError('given send operation parameter is invalid')
        }
    }

    return parameters
}

function validateAmount(rawAmount: string): number {
    return parseFloat(rawAmount) ?? 0
}

function validateIotaUnit(rawIotaUnit: string): IotaUnit {
    const isValidIotaUnit = Object.values(IotaUnit).includes(rawIotaUnit as IotaUnit)
    if (!isValidIotaUnit) {
        throw new InvalidUnitError()
    }

    return rawIotaUnit as IotaUnit
}
