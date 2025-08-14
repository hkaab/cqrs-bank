export type AccountId = string;
export type Balance = number;

export class Account {
    constructor(
        public accountId: AccountId,
        public balance: Balance
    ) {}
}
