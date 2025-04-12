import {TickArray} from "./tick_array";

export class Tick {
    static MIN_TICK: number = -443636;
    static MAX_TICK: number = 443636;

    initialized: boolean;
    liquidityNet: bigint;
    liquidityGross: bigint;

    constructor() {
        this.initialized = false;
        this.liquidityNet = BigInt(0);
        this.liquidityGross = BigInt(0);
    }

    update(initialized: boolean, liquidityNet: bigint, liquidityGross: bigint) {
        this.initialized = initialized;
        this.liquidityNet = liquidityNet;
        this.liquidityGross = liquidityGross;
    }

    checkIsValidStartTick(tickIndex: number, tickSpacing: number): boolean {
        let ticksInArray = TickArray.TICK_ARRAY_SIZE * tickSpacing;
        if (this.checkIsOutOfBounds(tickIndex)) {
            if (tickIndex > Tick.MIN_TICK) {
                return false;
            }

            let minArrayStartIndex = Tick.MIN_TICK - (Tick.MIN_TICK % ticksInArray + ticksInArray);
            return tickIndex == minArrayStartIndex;
        }

        return tickIndex % ticksInArray === 0;

    }

    checkIsOutOfBounds(tickIndex: number): boolean {
        return tickIndex < Tick.MIN_TICK || tickIndex > Tick.MAX_TICK;
    }
}