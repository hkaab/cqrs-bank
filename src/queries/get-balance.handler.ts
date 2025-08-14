import { AccountService } from '../services/account.service';
import { IQueryHandler } from '../interfaces/handler.interface';
import { AccountId, Balance } from '../models/account.model';
import { GetBalanceQuery } from './get-balance.query';

export class GetBalanceQueryHandler implements IQueryHandler<GetBalanceQuery, Balance | undefined> {
    constructor(private accountService: AccountService) {}

    public async execute(query: GetBalanceQuery): Promise<Balance | undefined> {
        return await this.accountService.getBalance(query.accountId as AccountId);
    }
}
