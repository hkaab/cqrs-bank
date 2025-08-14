import { AccountId, Balance } from '../models/account.model';

export abstract class Event {
    public readonly timestamp: Date = new Date();
    constructor(public readonly eventName: string) {}
}

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
