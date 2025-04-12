import {Pool} from "../../interface/pool";
import {TickArray} from "../../entity/orca_style/tick_array";
import {Position} from "../../entity/position";
import {
    calculateAmount0Delta,
    calculateAmount1Delta,
    computeSwapStep,
    sqrtRatioToTick,
    tickIndexToSqrtRatio
} from "../../core/math";
import {Logger} from "../../logger/logger";

export class OrcaStylePool implements Pool {
    private static TAG = "OrcaStylePool";
    static MIN_TICK = -443636;
    static MAX_TICK =  443636;

    liquidity: bigint;
    sqrtPriceX96: bigint;
    currentTickIndex: number = 0;

    tickSpacing: number = 8;
    tickArrays: TickArray[];

    positions: Map<String, Position>;

    constructor(sqrtPriceX96: bigint, currentTickIndex: number, tickSpacing: number) {
        this.liquidity = BigInt(0);
        this.sqrtPriceX96 = sqrtPriceX96;
        this.currentTickIndex = currentTickIndex;
        this.tickArrays = [];
        this.positions = new Map();
        this.tickSpacing = tickSpacing;
    }

    addLiquidity(user: string, lowerTick: number, upperTick: number, amount: bigint) {
        if (lowerTick >= upperTick) {
            throw new Error("Invalid tick range");
        }

        if (lowerTick < OrcaStylePool.MIN_TICK || upperTick > OrcaStylePool.MAX_TICK) {
            throw new Error("Out of range tick");
        }

        if (amount <= BigInt(0)) {
            throw new Error("Amount must be greater than zero");
        }

        const lowerArray = this.getOrCreateTickArray(lowerTick);
        const upperArray = this.getOrCreateTickArray(upperTick);

        lowerArray.updateTick(lowerTick, this.tickSpacing, amount);
        upperArray.updateTick(upperTick, this.tickSpacing, -amount);

        const positionKey = Position.getPositionKey(user, lowerTick, upperTick);
        let position = this.positions.get(positionKey);
        if (!position) {
            position = new Position(lowerTick, upperTick, BigInt(0));
            this.positions.set(positionKey, position);
        }
        position.update(amount);

        if (this.currentTickIndex >= lowerTick && this.currentTickIndex < upperTick) {
            this.liquidity += amount;
        }

        const sqrtPriceLowerX96 = tickIndexToSqrtRatio(lowerTick);
        const sqrtPriceUpperX96 = tickIndexToSqrtRatio(upperTick);
        const amount0 = calculateAmount0Delta(this.sqrtPriceX96, sqrtPriceUpperX96, amount);
        const amount1 = calculateAmount1Delta(this.sqrtPriceX96, sqrtPriceLowerX96, amount);

        Logger.log(OrcaStylePool.TAG, "ADD_LIQUIDITY", "amount0:", amount0, "amount1:", amount1);
        Logger.log(OrcaStylePool.TAG, "ADD_LIQUIDITY", `deposit amount: tokenA=${amount0} tokenB=${amount1}`);
    }

    getPosition(user: string, lowerTick: number, upperTick: number) {
        return this.positions.get(Position.getPositionKey(user, lowerTick, upperTick));
    }

    getTick(tickIndex: number) {
        const tickArrayIndex = tickIndex / this.tickSpacing;
    }

    swap(user: string, xToY: boolean, amountSpecified: bigint) {
        let amountSpecifiedRemaining = amountSpecified;
        let amountCalculated = BigInt(0);
        let currentSqrtPriceX96 = this.sqrtPriceX96;
        let currentTick = this.currentTickIndex;

        while (amountSpecifiedRemaining > BigInt(0) && (currentTick >= OrcaStylePool.MIN_TICK && currentTick <= OrcaStylePool.MAX_TICK)) {
            const nextTickIndex = this.findNextInitializedTick(currentTick, xToY);

            let targetTickIndex = nextTickIndex !== null ? nextTickIndex : (
                xToY ? OrcaStylePool.MIN_TICK : OrcaStylePool.MAX_TICK
            );
            let sqrtPriceTargetX96 = tickIndexToSqrtRatio(targetTickIndex);

            const step = computeSwapStep(
                currentSqrtPriceX96,
                sqrtPriceTargetX96,
                this.liquidity,
                amountSpecifiedRemaining
            );

            currentSqrtPriceX96 = step.sqrtPriceNextX96;
            amountSpecifiedRemaining -= step.amountIn;
            amountCalculated += step.amountOut;

            if (currentSqrtPriceX96 === sqrtPriceTargetX96) {
                if (nextTickIndex !== null) {
                    let net = this.getLiquidityNet(nextTickIndex);
                    if (xToY) {
                        this.liquidity -= net;
                    } else {
                        this.liquidity += net;
                    }
                }
                currentTick = xToY ? (targetTickIndex -1) : targetTickIndex;
            } else {
                currentTick = Number(sqrtRatioToTick(currentSqrtPriceX96));
            }
        }

        this.sqrtPriceX96 = currentSqrtPriceX96;
        this.currentTickIndex = currentTick;

        let amount0: bigint, amount1: bigint;
        if (xToY) {
            amount0 = amountSpecified - amountSpecifiedRemaining;
            amount1 = -amountCalculated;
        } else {
            amount0 = -amountCalculated;
            amount1 = amountSpecified - amountSpecifiedRemaining;
        }
        Logger.log(OrcaStylePool.TAG, "SWAP", `user=${user}, xToY=${xToY}, result => amount0=${amount0}, amount1=${amount1}`);
        return { amount0, amount1 };
    }

    private findNextInitializedTick(fromTick: number, xToY: boolean): number | null {
        let best: number | null = null;

        for (const ta of this.tickArrays) {
            if (!ta.inRange(fromTick, this.tickSpacing)) continue;
            const candidate = ta.getNextInitializedTick(fromTick, this.tickSpacing, xToY);
            if (candidate == null) {
                continue;
            }

            if (xToY) {
                if (best === null || candidate < best) {
                    best = candidate;
                }
            } else {
                if (best === null || candidate > best) {
                    best = candidate;
                }
            }
        }

        return best;
    }

    private getOrCreateTickArray(tickIndex: number): TickArray {
        const blockRange = TickArray.TICK_ARRAY_SIZE * this.tickSpacing;
        const alignedStart = Math.floor(tickIndex / blockRange) * blockRange;
        let array = this.tickArrays.find((ta) => ta.startTickIndex === alignedStart);
        if (!array) {
            array = new TickArray(alignedStart);
            this.tickArrays.push(array);
        }

        return array;
    }

    getLiquidityNet(tickIndex: number): bigint {
        for (const ta of this.tickArrays) {
            if (ta.inRange(tickIndex, this.tickSpacing)) {
                const tick = ta.getTick(tickIndex, this.tickSpacing);
                return tick.liquidityNet;
            }
        }

        return BigInt(0);
    }
}