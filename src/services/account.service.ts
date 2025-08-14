import { Account, AccountId, Balance } from '../models/account.model';


export class AccountService {
    private accounts = new Map<AccountId, Account>();

    constructor() {
        this.accounts.set('a123', new Account('a123', 1000));
        this.accounts.set('a456', new Account('a456', 500));
    }

    public getBalance(accountId: AccountId): Promise<Balance | undefined> {
        return new Promise(resolve => {
            setTimeout(() => {
                const account = this.accounts.get(accountId);
                resolve(account ? account.balance : undefined);
            }, 100);
        });
    }

    public updateBalance(accountId: AccountId, newBalance: Balance): Promise<void> {
        return new Promise(resolve => {
            setTimeout(() => {
                const currentAccount = this.accounts.get(accountId);
                if (currentAccount) {
                    const updatedAccount = new Account(currentAccount.accountId, newBalance);
                    this.accounts.set(accountId, updatedAccount);
                }
                resolve();
            }, 100);
        });
    }
}
