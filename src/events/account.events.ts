import { AccountId, Balance } from '../models/account.model';

export abstract class Event {
    public readonly timestamp: Date = new Date();
    constructor(public readonly eventName: string) {}
}

// Domain-level events
export class MoneyWithdrawnEvent extends Event {
    constructor(public readonly accountId: AccountId, public readonly amount: Balance) {
        super('MoneyWithdrawnEvent');
    }
}

export class MoneyDepositedEvent extends Event {
    constructor(public readonly accountId: AccountId, public readonly amount: Balance) {
        super('MoneyDepositedEvent');
    }
}

export class InsufficientFundsEvent extends Event {
    constructor(public readonly accountId: AccountId, public readonly amount: Balance, public readonly currentBalance: Balance) {
        super('InsufficientFundsEvent');
    }
}

export class GenericApplicationErrorEvent extends Event {
    constructor(public readonly context: string, public readonly errorMessage: string) {
        super('GenericApplicationErrorEvent');
    }
}

// Events to represent commands and queries being published to the bus
export class ExecuteCommandEvent extends Event {
    constructor(public readonly command: any, public readonly correlationId: string) {
        super('ExecuteCommandEvent');
    }
}

export class ExecuteQueryEvent extends Event {
    constructor(public readonly query: any, public readonly correlationId: string) {
        super('ExecuteQueryEvent');
    }
}

// Events to signal that a command or query has been executed
export class CommandExecutedEvent extends Event {
    constructor(public readonly commandName: string, public readonly correlationId: string) {
        super('CommandExecutedEvent');
    }
}

export class QueryExecutedEvent extends Event {
    constructor(public readonly queryName: string, public readonly correlationId: string, public readonly result: any) {
        super('QueryExecutedEvent');
    }
}