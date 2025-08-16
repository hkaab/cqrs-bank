import { AccountService } from './services/account.service';
import { WithdrawCommand } from './commands/withdraw.command';
import { DepositCommand } from './commands/deposit.command';
import { GetBalanceQuery } from './queries/get-balance.query';
import { EventLogger } from './events/event.logger';
import { 
    MoneyDepositedEvent,
    MoneyWithdrawnEvent,
    ExecuteCommandEvent,
    ExecuteQueryEvent,
    CommandExecutedEvent,
    QueryExecutedEvent 
} from './events/account.events';
import { Account, AccountId, Balance } from './models/account.model';
import { eventStream } from './events/event.stream';
import { filter } from 'rxjs/operators';
import { CommandQueryDispatcher } from './dispatcher/command.dispatcher';
import { WithdrawCommandHandler } from './commands/withdraw.handler';
import { GetBalanceQueryHandler } from './queries/get-balance.handler';
import { ICommandHandler, IQueryHandler } from './interfaces/handler.interface';
import { DepositCommandHandler } from './commands/deposit.handler';

// --- Dependency Injection "Container" ---
const accountService = new AccountService();
const _ = new EventLogger();

// Instantiate handlers and the new dispatcher
const withdrawCommandHandler: ICommandHandler<WithdrawCommand> = new WithdrawCommandHandler(accountService);
const depositCommandHandler: ICommandHandler<DepositCommand> = new DepositCommandHandler(accountService);
const getBalanceQueryHandler: IQueryHandler<GetBalanceQuery, Balance | undefined> = new GetBalanceQueryHandler(accountService);
const dispatcher = new CommandQueryDispatcher();

// Register the handlers with the dispatcher
dispatcher.registerHandler(WithdrawCommand, withdrawCommandHandler);
dispatcher.registerHandler(DepositCommand, depositCommandHandler);
dispatcher.registerHandler(GetBalanceQuery, getBalanceQueryHandler);

// --- Subscribing to events to show command/query completion and results ---
eventStream.pipe(filter(event => event.eventName === 'CommandExecutedEvent'))
    .subscribe(event => {
        const typedEvent = event as CommandExecutedEvent;
        console.log(`[main.ts] Command '${typedEvent.commandName}' completed with correlation ID: ${typedEvent.correlationId}`);
    });

eventStream.pipe(filter(event => event.eventName === 'QueryExecutedEvent'))
    .subscribe(event => {
        const typedEvent = event as QueryExecutedEvent;
        console.log(`[main.ts] Query '${typedEvent.queryName}' result (ID: ${typedEvent.correlationId}): ${JSON.stringify(typedEvent.result)}`);
    });

// --- Main Application Logic ---
async function run() {
    console.log('--- Starting Application ---');
    console.log('--- Initial Balances (querying with events) ---');
    eventStream.next(new ExecuteQueryEvent(new GetBalanceQuery('account123'), 'query-1'));
    eventStream.next(new ExecuteQueryEvent(new GetBalanceQuery('account456'), 'query-2'));
    eventStream.next(new ExecuteQueryEvent(new GetBalanceQuery('error-account'), 'query-3'));
    
    // Give time for initial queries to process
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('\n');
    
    // --- Scenario 1: A successful withdrawal (via event) ---
    console.log('--- Attempting a successful withdrawal (200) from account123 via event ---');
    eventStream.next(new ExecuteCommandEvent(new WithdrawCommand('account123', 200), 'command-1'));
    await new Promise(resolve => setTimeout(resolve, 500));
    eventStream.next(new ExecuteQueryEvent(new GetBalanceQuery('account123'), 'query-4'));
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('\n');

    // --- Scenario 2: A failed withdrawal due to insufficient funds (via event) ---
    console.log('--- Attempting a failed withdrawal (600) from account456 via event ---');
    eventStream.next(new ExecuteCommandEvent(new WithdrawCommand('account456', 600), 'command-2'));
    await new Promise(resolve => setTimeout(resolve, 500));
    eventStream.next(new ExecuteQueryEvent(new GetBalanceQuery('account456'), 'query-5'));
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('\n');

    // --- Scenario 3: A successful deposit (via event) ---
    console.log('--- Attempting a successful deposit (300) to account123 via event ---');
    eventStream.next(new ExecuteCommandEvent(new DepositCommand('account123', 300), 'command-3'));
    await new Promise(resolve => setTimeout(resolve, 500));
    eventStream.next(new ExecuteQueryEvent(new GetBalanceQuery('account123'), 'query-6'));
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('\n');

    // --- Scenario 4: A command that triggers an unexpected exception (via event) ---
    console.log('--- Attempting an operation that will fail for "error-account" via event ---');
    eventStream.next(new ExecuteCommandEvent(new WithdrawCommand('error-account', 10), 'command-4'));
    await new Promise(resolve => setTimeout(resolve, 500));
    eventStream.next(new ExecuteQueryEvent(new GetBalanceQuery('error-account'), 'query-7'));
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('\n');

    console.log('--- Application finished ---');
}

run();
