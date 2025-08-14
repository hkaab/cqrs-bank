import { WithdrawCommand } from './withdraw.command';
import { AccountService } from '../services/account.service';
import { MoneyWithdrawnEvent, InsufficientFundsEvent } from '../events/account.events';
import { ICommandHandler } from '../interfaces/handler.interface';
import { AccountId } from '../models/account.model';
import { eventStream } from '../events/event.stream';

export class WithdrawCommandHandler implements ICommandHandler<WithdrawCommand> {
    constructor(private accountService: AccountService) {}

    public async execute(command: WithdrawCommand): Promise<void> {
        const { accountId, amount } = command;

        if (amount <= 0) {
            console.error(`Withdrawal failed for ${accountId}: Amount must be positive.`);
            return;
        }

        const currentBalance = await this.accountService.getBalance(accountId as AccountId);

        if (currentBalance === undefined) {
            console.error(`Withdrawal failed for ${accountId}: Account not found.`);
            return;
        }

        if (currentBalance < amount) {
            // Push an InsufficientFundsEvent to the stream
            eventStream.next(new InsufficientFundsEvent(accountId, amount, currentBalance));
            return;
        }

        await this.accountService.updateBalance(accountId as AccountId, currentBalance - amount);
        // Push a MoneyWithdrawnEvent to the stream
        eventStream.next(new MoneyWithdrawnEvent(accountId, amount));
    }
}
