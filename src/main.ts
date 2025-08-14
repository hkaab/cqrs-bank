import { AccountService } from './services/account.service';
import { WithdrawCommand } from './commands/withdraw.command';
import { WithdrawCommandHandler } from './commands/withdraw.handler';
import { GetBalanceQuery } from './queries/get-balance.query';
import { GetBalanceQueryHandler } from './queries/get-balance.handler';
import { EventLogger } from './events/event.logger';
import { MoneyDepositedEvent, MoneyWithdrawnEvent } from './events/account.events';
import { Balance } from './models/account.model';
import { ICommandHandler, IQueryHandler } from './interfaces/handler.interface';
import { eventStream } from './events/event.stream'; // New import for the RxJS stream

// --- Dependency Injection "Container" ---
const accountService = new AccountService();

// The EventLogger is instantiated first to ensure it's listening for events
const _ = new EventLogger();

// Handlers no longer need the EventBus passed in, as they now directly access the global eventStream
const withdrawCommandHandler: ICommandHandler<WithdrawCommand> = new WithdrawCommandHandler(accountService);
const getBalanceQueryHandler: IQueryHandler<GetBalanceQuery, Balance | undefined> = new GetBalanceQueryHandler(accountService);

// --- New: Subscribing to events directly in main.ts using RxJS's filter operator ---
import { filter } from 'rxjs/operators';
eventStream.pipe(filter(event => event.eventName === 'MoneyWithdrawnEvent'))
    .subscribe(event => {
        const typedEvent = event as MoneyWithdrawnEvent;
        console.log(`(main.ts listener) A withdrawal of ${typedEvent.amount} has occurred from account ${typedEvent.accountId}.`);
    });

eventStream.pipe(filter(event => event.eventName === 'MoneyDepositedEvent'))
    .subscribe(event => {
        const typedEvent = event as MoneyDepositedEvent;
        console.log(`(main.ts listener) A deposit of ${typedEvent.amount} has been made to account ${typedEvent.accountId}.`);
    });

async function run() {
    console.log('--- Starting Application ---');
    console.log('--- Get Initial Balances ---');
    console.log(`Account 123: ${await accountService.getBalance('a123')}`);
    console.log(`Account 456: ${await accountService.getBalance('a456')}`);
    console.log('\n');

    // --- Scenario 1: A successful withdrawal ---
    console.log('--- Attempting a successful withdrawal (200) from account123 ---');
    await withdrawCommandHandler.execute(new WithdrawCommand('a123', 200));
    const balanceAfterWithdrawal = await getBalanceQueryHandler.execute(new GetBalanceQuery('a23'));
    console.log(`Current balance for account 123: ${balanceAfterWithdrawal}\n`);

    // --- Scenario 2: A failed withdrawal due to insufficient funds ---
    console.log('--- Attempting a failed withdrawal (600) from account456 ---');
    await withdrawCommandHandler.execute(new WithdrawCommand('a456', 600));
    const balanceAfterFailedWithdrawal = await getBalanceQueryHandler.execute(new GetBalanceQuery('a456'));
    console.log(`Current balance for account 456: ${balanceAfterFailedWithdrawal}\n`);

    console.log('--- Application Ended ---');
}

run();
