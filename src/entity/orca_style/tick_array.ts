import {Tick} from "./tick";
import {Logger} from "../../logger/logger";

export class TickArray {
    static TAG = "TickArray";

    startTickIndex: number;
    ticks: Tick[];

    static TICK_ARRAY_SIZE: number = 88;

    constructor(startTickIndex: number, ticks?: Tick[]) {
        this.startTickIndex = startTickIndex;
        this.ticks = ticks && ticks.length === TickArray.TICK_ARRAY_SIZE
            ? ticks
            : Array.from({ length: TickArray.TICK_ARRAY_SIZE }, () => new Tick());
    }

    inRange(tickIndex: number, tickSpacing: number): boolean {
        Logger.log(TickArray.TAG, "inRange", `tickIndex: ${tickIndex}, startTickIndex: ${this.startTickIndex}, tickSpacing: ${tickSpacing}`);

        const endIndex = this.startTickIndex + (TickArray.TICK_ARRAY_SIZE * tickSpacing);
        return tickIndex >= this.startTickIndex && tickIndex < endIndex;
    }

    getTick(tickIndex: number, tickSpacing: number): Tick {
        Logger.log(TickArray.TAG, "getTick", `tickIndex: ${tickIndex}, startTickIndex: ${this.startTickIndex}, tickSpacing: ${tickSpacing}`);
        if (!this.inRange(tickIndex, tickSpacing)) {
            throw new Error("Tick index out of range");
        }

        if (tickIndex % tickSpacing !== 0) {
            throw new Error("Tick index must be a multiple of tick spacing");
        }

        const offset = this.tickOffset(tickIndex, tickSpacing);
        return this.ticks[offset];
    }

    tickOffset(tickIndex: number, tickSpacing: number) {
        Logger.log(TickArray.TAG, "tickOffset", `tickIndex: ${tickIndex}, startTickIndex: ${this.startTickIndex}, tickSpacing: ${tickSpacing}`);

        if (tickSpacing === 0) {
            throw new Error("Tick spacing cannot be zero");
        }

        return TickArray.getOffset(tickIndex, this.startTickIndex, tickSpacing);
    }

    static getOffset(tickIndex: number, startTickIndex: number, tickSpacing: number): number {
        Logger.log(TickArray.TAG, "getOffset", `tickIndex: ${tickIndex}, startTickIndex: ${startTickIndex}, tickSpacing: ${tickSpacing}`);

        let lhs = tickIndex - startTickIndex;
        let rhs = tickSpacing;
        let d = lhs / rhs;
        let r = lhs % rhs;
        let o;
        if (r > 0 && rhs <0 || r < 0 && rhs > 0) {
            o = d - 1;
        } else {
            o = d;
        }
        return o;
    }

    updateTick(tickIndex: number, tickSpacing: number, liquidityDelta: bigint) {
        Logger.log(TickArray.TAG, "updateTick", `tickIndex: ${tickIndex}, startTickIndex: ${this.startTickIndex}, tickSpacing: ${tickSpacing}, liquidityDelta: ${liquidityDelta}`);

        if (!this.inRange(tickIndex, tickSpacing)) {
            throw new Error("Tick index out of range");
        }
        if (tickIndex % tickSpacing !== 0) {
            throw new Error("Tick index must be a multiple of tick spacing");
        }

        // const offset = Math.floor((tickIndex - this.startTickIndex) / tickSpacing);
        const offset = this.tickOffset(tickIndex, tickSpacing);
        if (offset < 0) {
            throw new Error("Offset is negative");
        }
        const oldTick = this.ticks[offset];
        const newLiquidityNet = oldTick.liquidityNet + liquidityDelta;
        const newGross = oldTick.liquidityGross + (liquidityDelta < BigInt(0) ? -liquidityDelta : liquidityDelta);

        this.ticks[offset]?.update(true, newLiquidityNet, newGross < BigInt(0) ? BigInt(0) : newGross);
    }

    getNextInitializedTick(tickIndex: number, tickSpacing: number, xToY: boolean): number | null {
        Logger.log(TickArray.TAG, "getNextInitializedTick", `tickIndex: ${tickIndex}, startTickIndex: ${this.startTickIndex}, tickSpacing: ${tickSpacing}, xToY: ${xToY}`)

        if (!this.inRange(tickIndex, tickSpacing)) {
            return null;
        }

        let offset = Math.floor((tickIndex - this.startTickIndex) / tickSpacing);
        if (xToY) {
            for (let i = offset; i >= 0; i--) {
                if (this.ticks[i].initialized) {
                    return this.startTickIndex + i * tickSpacing;
                }
            }
        } else {
            for (let i = offset; i < TickArray.TICK_ARRAY_SIZE; i++) {
                if (this.ticks[i].initialized) {
                    return this.startTickIndex + i * tickSpacing;
                }
            }
        }

        return null;
    }
}