import {Account} from "./account";
import {AccountRepository} from "../repository/account_repository";

export interface Token extends Account {
    name: string;
    decimals: number;

    mint(to: Account, amount: number): void;
    transfer(from: Account, to: Account, amount: number): boolean;
}

export class FungibleToken implements Token {
    decimals: number;
    name: string;
    address: string;
    balance: Map<string, number> = new Map();

    constructor(address: string, name: string, decimals: number) {
        this.name = name;
        this.address = address;
        this.decimals = decimals;
    }

    mint(to: Account, amount: number) {
        console.log(`[MINT] mint ${this.address} to ${to.address} with amount ${amount}`);
        to.balance[this.address] = (to.balance[this.address] || 0) + amount;
    }

    transfer(from: Account, to: Account, amount: number): boolean {
        if (from.balance[this.address] == null || from.balance[this.address] < amount) {
            console.error(`Transfer failed: Insufficient balance in ${from.address}`);
            return false;
        }

        from.balance[this.address] -= amount;
        to.balance[this.address] = (to.balance[this.address] || 0) + amount;
        return true;
    }

    public toString() {
        return {
            name: this.name,
            address: this.address,
            decimals: this.decimals,
        }.toString();
    }
}

export class TokenFactory {
    static createFungibleToken(address: string, name: string, decimals: number, repository?: AccountRepository): Token {
        const tokenAccount = new FungibleToken(address, name, decimals);
        if (repository != null) {
            repository.register(name, tokenAccount);
        }

        return tokenAccount;
    }
}