export class Position {
    tickLower: number;
    tickUpper: number;
    liquidity: bigint;

    constructor(tickLower: number, tickUpper: number, liquidity: bigint) {
        this.liquidity = liquidity;
        this.tickLower = tickLower;
        this.tickUpper = tickUpper;
    }

    update(liquidityDelta: bigint) {
        if (liquidityDelta < BigInt(0)) {
            throw new Error("Liquidity cannot be negative");
        }
        this.liquidity += liquidityDelta;
    }

    static getPositionKey(user: string, lowerTick: number, upperTick: number): string {
        return `${user}-${lowerTick}-${upperTick}`;
    }
}