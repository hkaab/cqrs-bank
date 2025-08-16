import { DepositCommand } from '../commands/deposit.command';
import { AccountService } from '../services/account.service';
import { MoneyDepositedEvent, GenericApplicationErrorEvent } from '../events/account.events';
import { AccountId, Balance } from '../models/account.model';
import { eventStream } from '../events/event.stream';
import { ICommandHandler } from '@src/interfaces/handler.interface';

export class DepositCommandHandler implements ICommandHandler<DepositCommand> {
    constructor(private accountService: AccountService) {}

    public async execute(command: DepositCommand): Promise<void> {
        try {
            const { accountId, amount } = command;

            if (amount <= 0) {
                console.error(`Deposit failed for ${accountId}: Amount must be positive.`);
                return;
            }

            const currentBalance = await this.accountService.getBalance(accountId as AccountId);

            if (currentBalance === undefined) {
                console.error(`Deposit failed for ${accountId}: Account not found.`);
                return;
            }

            await this.accountService.updateBalance(accountId as AccountId, currentBalance + amount);
            eventStream.next(new MoneyDepositedEvent(accountId, amount));
        } catch (error) {
            if (error instanceof Error) {
                eventStream.next(new GenericApplicationErrorEvent('DepositCommandHandler', error.message));
            }
        }
    }
}