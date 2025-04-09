import {AccountRepository} from "../repository/account_repository";

export interface Account {
    address: string;
    balance: Map<string, number>;
}

export class UserAccount implements Account {
    address: string;

    constructor(address: string) {
        this.address = address;
    }

    balance: Map<string, number> = new Map();
}

export class ProgramAccount implements Account {
    address: string;
    balance: Map<string, number> = new Map();

    constructor(address: string) {
        this.address = address;
    }
}

export class AccountFactory {
    static createUserAccount(address: string, repository?: AccountRepository): UserAccount {
        const account = new UserAccount(address);
        if (repository != null) {
            repository.register(address, account);
        }

        return account;
    }

    static createProgramAccount(address: string, repository?: AccountRepository): ProgramAccount {
        const account = new ProgramAccount(address);
        if (repository != null) {
            repository.register(address, account);
        }

        return account;
    }
}