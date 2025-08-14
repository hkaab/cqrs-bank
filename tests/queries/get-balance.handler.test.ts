import { GetBalanceQueryHandler } from '@src/queries/get-balance.handler';
import { GetBalanceQuery } from '@src/queries/get-balance.query';
import { AccountService } from '@src/services/account.service';
import { AccountId, Balance } from '@src/models/account.model';

describe('GetBalanceQueryHandler', () => {
    let handler: GetBalanceQueryHandler;
    let mockAccountService: { getBalance: jest.Mock<Promise<Balance | undefined>, [AccountId]>; updateBalance: jest.Mock<Promise<void>, [AccountId, Balance]> };

    beforeEach(() => {
        // We create a new mock for each test to ensure test isolation
        mockAccountService = {
            getBalance: jest.fn<Promise<Balance | undefined>, [AccountId]>(),
            updateBalance: jest.fn<Promise<void>, [AccountId, Balance]>(),
        };

        // We create a new handler instance for each test to ensure isolation.
        handler = new GetBalanceQueryHandler(mockAccountService as unknown as AccountService);
    });

    it('should return the correct balance for an existing account', async () => {
        const accountId = 'a123';
        const expectedBalance = 1000;
        // The mock service is configured to return the expected balance.
        mockAccountService.getBalance.mockResolvedValue(expectedBalance);

        const query = new GetBalanceQuery(accountId);
        const result = await handler.execute(query);

        // We assert that the handler called the service with the correct ID...
        expect(mockAccountService.getBalance).toHaveBeenCalledWith(accountId);
        // ...and that it returned the expected result.
        expect(result).toBe(expectedBalance);
    });

    it('should return undefined for a non-existent account', async () => {
        const accountId = 'non-existent-account';
        // The mock service is configured to return undefined for this account.
        mockAccountService.getBalance.mockResolvedValue(undefined);

        const query = new GetBalanceQuery(accountId);
        const result = await handler.execute(query);

        expect(mockAccountService.getBalance).toHaveBeenCalledWith(accountId);
        // We assert that the handler correctly returns undefined.
        expect(result).toBeUndefined();
    });
});