// --- File: tests/handlers.test.ts ---
import { WithdrawCommand } from '../src/commands/withdraw.command';
import { DepositCommand } from '../src/commands/deposit.command';
import { GetBalanceQuery } from '../src/queries/get-balance.query';
import { AccountService } from '../src/services/account.service';
import {
    MoneyWithdrawnEvent,
    InsufficientFundsEvent,
    MoneyDepositedEvent,
    GenericApplicationErrorEvent
} from '../src/events/account.events';
import { eventStream } from '../src/events/event.stream';
import { WithdrawCommandHandler } from '@src/commands/withdraw.handler';
import { DepositCommandHandler } from '@src/commands/deposit.handler';
import { GetBalanceQueryHandler } from '@src/queries/get-balance.handler';

// Mock the console and event stream to verify outputs without side effects
jest.spyOn(console, 'error').mockImplementation(() => {});
jest.spyOn(eventStream, 'next').mockImplementation(() => {});

// Mock the AccountService to control test conditions
const mockAccountService = {
    getBalance: jest.fn(),
    updateBalance: jest.fn()
};

describe('WithdrawCommandHandler', () => {
    let handler: WithdrawCommandHandler;

    beforeEach(() => {
        handler = new WithdrawCommandHandler(mockAccountService as unknown as AccountService);
        mockAccountService.getBalance.mockClear();
        mockAccountService.updateBalance.mockClear();
        (eventStream.next as jest.Mock).mockClear();
    });

    it('should successfully withdraw money and emit a MoneyWithdrawnEvent', async () => {
        // Arrange
        const command = new WithdrawCommand('account123', 200);
        mockAccountService.getBalance.mockResolvedValueOnce(1000);
        mockAccountService.updateBalance.mockResolvedValueOnce(undefined);

        // Act
        await handler.execute(command);

        // Assert
        expect(mockAccountService.getBalance).toHaveBeenCalledWith('account123');
        expect(mockAccountService.updateBalance).toHaveBeenCalledWith('account123', 800);
        expect(eventStream.next).toHaveBeenCalledWith(expect.any(MoneyWithdrawnEvent));
    });

    it('should emit an InsufficientFundsEvent if balance is too low', async () => {
        // Arrange
        const command = new WithdrawCommand('account456', 600);
        mockAccountService.getBalance.mockResolvedValueOnce(500);

        // Act
        await handler.execute(command);

        // Assert
        expect(mockAccountService.getBalance).toHaveBeenCalledWith('account456');
        expect(mockAccountService.updateBalance).not.toHaveBeenCalled();
        expect(eventStream.next).toHaveBeenCalledWith(expect.any(InsufficientFundsEvent));
    });

    it('should not proceed and log an error for a negative withdrawal amount', async () => {
        // Arrange
        const command = new WithdrawCommand('account123', -50);

        // Act
        await handler.execute(command);

        // Assert
        expect(mockAccountService.getBalance).not.toHaveBeenCalled();
        expect(mockAccountService.updateBalance).not.toHaveBeenCalled();
        expect(eventStream.next).not.toHaveBeenCalled();
        expect(console.error).toHaveBeenCalledWith('Withdrawal failed for account123: Amount must be positive.');
    });
});

describe('DepositCommandHandler', () => {
    let handler: DepositCommandHandler;

    beforeEach(() => {
        handler = new DepositCommandHandler(mockAccountService as unknown as AccountService);
        mockAccountService.getBalance.mockClear();
        mockAccountService.updateBalance.mockClear();
        (eventStream.next as jest.Mock).mockClear();
    });

    it('should successfully deposit money and emit a MoneyDepositedEvent', async () => {
        // Arrange
        const command = new DepositCommand('account123', 300);
        mockAccountService.getBalance.mockResolvedValueOnce(1000);
        mockAccountService.updateBalance.mockResolvedValueOnce(undefined);

        // Act
        await handler.execute(command);

        // Assert
        expect(mockAccountService.getBalance).toHaveBeenCalledWith('account123');
        expect(mockAccountService.updateBalance).toHaveBeenCalledWith('account123', 1300);
        expect(eventStream.next).toHaveBeenCalledWith(expect.any(MoneyDepositedEvent));
    });

    it('should not proceed and log an error for a negative deposit amount', async () => {
        // Arrange
        const command = new DepositCommand('account123', -100);

        // Act
        await handler.execute(command);

        // Assert
        expect(mockAccountService.getBalance).not.toHaveBeenCalled();
        expect(mockAccountService.updateBalance).not.toHaveBeenCalled();
        expect(eventStream.next).not.toHaveBeenCalled();
        expect(console.error).toHaveBeenCalledWith('Deposit failed for account123: Amount must be positive.');
    });
});

describe('GetBalanceQueryHandler', () => {
    let handler: GetBalanceQueryHandler;

    beforeEach(() => {
        handler = new GetBalanceQueryHandler(mockAccountService as unknown as AccountService);
        mockAccountService.getBalance.mockClear();
        (eventStream.next as jest.Mock).mockClear();
    });

    it('should successfully return the balance for a valid account', async () => {
        // Arrange
        const query = new GetBalanceQuery('account123');
        const expectedBalance = 1000;
        mockAccountService.getBalance.mockResolvedValueOnce(expectedBalance);

        // Act
        const result = await handler.execute(query);

        // Assert
        expect(mockAccountService.getBalance).toHaveBeenCalledWith('account123');
        expect(result).toBe(expectedBalance);
        expect(eventStream.next).not.toHaveBeenCalled();
    });

    it('should return undefined for a non-existent account', async () => {
        // Arrange
        const query = new GetBalanceQuery('non-existent-account');
        mockAccountService.getBalance.mockResolvedValueOnce(undefined);

        // Act
        const result = await handler.execute(query);

        // Assert
        expect(mockAccountService.getBalance).toHaveBeenCalledWith('non-existent-account');
        expect(result).toBeUndefined();
        expect(eventStream.next).not.toHaveBeenCalled();
    });
});
