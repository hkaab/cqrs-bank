import { filter } from 'rxjs/operators';
import { eventStream } from './event.stream';
import { MoneyWithdrawnEvent, InsufficientFundsEvent, MoneyDepositedEvent } from './account.events';

export class EventLogger {
    constructor() {
        // Subscribe to a filtered stream of MoneyWithdrawnEvents
        eventStream.pipe(filter(event => event.eventName === 'MoneyWithdrawnEvent'))
            .subscribe(event => this.handleMoneyWithdrawn(event as MoneyWithdrawnEvent));

        // Subscribe to a filtered stream of InsufficientFundsEvents
        eventStream.pipe(filter(event => event.eventName === 'InsufficientFundsEvent'))
            .subscribe(event => this.handleInsufficientFunds(event as InsufficientFundsEvent));
    }

    private handleMoneyWithdrawn(event: MoneyWithdrawnEvent) {
        console.log(`✅ Event: [${event.timestamp.toISOString()}] MoneyWithdrawnEvent: ${event.amount} from account ${event.accountId}.`);
    }

    private handleMoneyDeposited(event: MoneyDepositedEvent) {
        console.log(`✅ Event: [${event.timestamp.toISOString()}] MoneyDepositedEvent: ${event.amount} to account ${event.accountId}.`);
    }

    private handleInsufficientFunds(event: InsufficientFundsEvent) {
        console.log(`❌ Event: [${event.timestamp.toISOString()}] InsufficientFundsEvent: Failed withdrawal of ${event.amount} from account ${event.accountId}. Current balance: ${event.currentBalance}`);
    }
}
