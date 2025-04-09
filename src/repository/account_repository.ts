import {Account} from "../entity/account";

export class AccountRepository {
    private static instance: AccountRepository;
    store: Map<string, Account>;

    private constructor() {
        this.store = new Map<string, Account>();
    }

    public static getInstance(): AccountRepository {
        if (!AccountRepository.instance) {
            AccountRepository.instance = new AccountRepository();
        }

        return AccountRepository.instance;
    }

    register(address: string, account: Account) {
        if (this.store.has(address)) {
            throw new Error(`Account with address ${address} already exists.`);
        }
        this.store.set(address, account);
    }

    dump() {
        console.log("AccountRepository dump:");
        this.store.forEach((account, address) => {
            console.log(`Address: ${address}, Account:`, account);
        });
    }
}