import { Token } from "./token";
import {Account} from "./account";
import {AccountRepository} from "../repository/account_repository";
import {TickArray} from "./tick";

export interface Pool extends Account {
    name: string;
    tokenA: Token;
    tokenB: Token;

    getTokenPair();
    swapQuote();
    swap();
    addLiquidity();
    removeLiquidity();
    sqrtPrice(): number;
}

class ClmmPool implements Pool {
    name: string;
    address: string;
    balance: Map<string, number>;
    tokenA: Token;
    tokenB: Token;
    tickArrays: TickArray[];
    feeRate: number;
    tickSpacing: number;
    currentTickIndex: number;

    constructor(address: string, name: string, tokenA: Token, tokenB: Token, feeRate: number, tickSpacing: number) {
        this.address = address;
        this.name = name;
        this.tokenA = tokenA;
        this.tokenB = tokenB;
        this.feeRate = feeRate;
    }

    openPosition(tokenA: number, tokenB: number) {

    }

    addLiquidity() {
        throw new Error("Method not implemented.");
    }
    removeLiquidity() {
        throw new Error("Method not implemented.");
    }

    getTokenPair() {
        return [this.tokenA, this.tokenB];
    }

    swapQuote() {
        // Implement swap quote logic
    }

    swap() {
        // Implement swap logic
    }

    sqrtPrice(): number {
        return 0;
    }
}

export class PoolFactory {
    static createNewClmmPool(address: string,
                             name: string,
                             tokenA: Token,
                             tokenB: Token,
                             feeRate: number,
                             tickSpacing: number,
                             accountRepository?: AccountRepository): Pool {
        const pool = new ClmmPool(address, name, tokenA, tokenB, feeRate, tickSpacing);
        if (accountRepository != null) {
            accountRepository.register(pool.address, pool);
        }

        return pool;
    }
}