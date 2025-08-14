
import { WithdrawCommandHandler } from '@src/commands/withdraw.handler';
import { WithdrawCommand } from '@src/commands/withdraw.command';
import { AccountService } from '@src/services/account.service';
import { MoneyWithdrawnEvent, InsufficientFundsEvent } from '@src/events/account.events';
import { AccountId, Balance } from '@src/models/account.model';
import { eventStream } from '@src/events/event.stream';

describe('WithdrawCommandHandler', () => {
    let handler: WithdrawCommandHandler;
    let mockAccountService: { getBalance: jest.Mock<Promise<Balance | undefined>, [AccountId]>; updateBalance: jest.Mock<Promise<void>, [AccountId, Balance]> };
    let mockEventStream: { next: jest.Mock<void, [any]> };

    beforeEach(() => {
        // We create a new mock for each test to ensure test isolation
        mockAccountService = {
            getBalance: jest.fn<Promise<Balance | undefined>, [AccountId]>(),
            updateBalance: jest.fn<Promise<void>, [AccountId, Balance]>(),
        };

        // We mock the global eventStream object
        mockEventStream = {
            next: jest.fn<void, [any]>(),
        };
        (eventStream as any) = mockEventStream;

        handler = new WithdrawCommandHandler(
            mockAccountService as unknown as AccountService
        );
    });

    it('should successfully withdraw a valid amount and publish an event', async () => {
        const command = new WithdrawCommand('account123', 50);
        mockAccountService.getBalance.mockResolvedValue(100);
        mockAccountService.updateBalance.mockResolvedValue();

        await handler.execute(command);

        expect(mockAccountService.getBalance).toHaveBeenCalledWith('account123');
        expect(mockAccountService.updateBalance).toHaveBeenCalledWith('account123', 50);
        expect(mockEventStream.next).toHaveBeenCalledWith(expect.any(MoneyWithdrawnEvent));
    });

    it('should publish an InsufficientFundsEvent if funds are insufficient', async () => {
        const command = new WithdrawCommand('account456', 600);
        mockAccountService.getBalance.mockResolvedValue(500);

        await handler.execute(command);

        expect(mockAccountService.getBalance).toHaveBeenCalledWith('account456');
        expect(mockAccountService.updateBalance).not.toHaveBeenCalled();
        expect(mockEventStream.next).toHaveBeenCalledWith(expect.any(InsufficientFundsEvent));
    });

    it('should not publish an event if the amount is zero or negative', async () => {
        const command = new WithdrawCommand('account123', -10);

        await handler.execute(command);

        expect(mockAccountService.getBalance).not.toHaveBeenCalled();
        expect(mockAccountService.updateBalance).not.toHaveBeenCalled();
        expect(mockEventStream.next).not.toHaveBeenCalled();
    });

    it('should not publish an event if the account does not exist', async () => {
        const command = new WithdrawCommand('non-existent-account', 100);
        mockAccountService.getBalance.mockResolvedValue(undefined);

        await handler.execute(command);

        expect(mockAccountService.getBalance).toHaveBeenCalledWith('non-existent-account');
        expect(mockAccountService.updateBalance).not.toHaveBeenCalled();
        expect(mockEventStream.next).not.toHaveBeenCalled();
    });
});