export class Tick {
    initialized: boolean;
    liquidity: bigint;

    constructor() {
        this.initialized = false;
        this.liquidity = BigInt(0);
    }

    update(liquidityDelta: bigint) {
        if (liquidityDelta < BigInt(0)) {
            throw new Error("Liquidity cannot be negative");
        }
        if (this.liquidity === BigInt(0)) {
            this.initialized = true;
        }

        this.liquidity += liquidityDelta;
    }
}