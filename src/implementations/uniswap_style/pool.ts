import {Pool} from "../../interface/pool";
import {Position} from "../../entity/position";
import {Logger} from "../../logger/logger";
import {
    calculateAmount0Delta,
    calculateAmount1Delta,
    computeSwapStep,
    sqrtRatioToTick,
    tickIndexToSqrtRatio
} from "../../core/math";
import {TickBitmap} from "../../entity/uniswap_style/tick_bitmap";
import {Tick} from "../../entity/uniswap_style/tick";

export class UniswapV3StylePool implements Pool {
    private static TAG = "UniswapV3StylePool";
    static MIN_TICK = -887272;
    static MAX_TICK = 887272;

    liquidity: bigint = BigInt(0);
    sqrtPriceX96: bigint = BigInt(0);
    currentTickIndex: number = 0;

    positions: Map<string, Position> = new Map();
    tickBitmap: TickBitmap = new TickBitmap();
    tick: Map<number, Tick> = new Map();

    constructor(currentSqrtPriceX96: bigint, currentTickIndex: number) {
        this.sqrtPriceX96 = currentSqrtPriceX96;
        this.currentTickIndex = currentTickIndex;
    }

    addLiquidity(user: string, lowerTick: number, upperTick: number, amount: bigint) {
        const JOB = "ADD_LIQUIDITY";
        if (lowerTick >= upperTick || lowerTick < UniswapV3StylePool.MIN_TICK || upperTick > UniswapV3StylePool.MAX_TICK) {
            throw new Error("Invalid tick range");
        }
        if (amount == BigInt(0)) {
            throw new Error("Amount must be greater than zero");
        }

        Logger.log(UniswapV3StylePool.TAG, JOB, 'user:', user, 'lowerTick:', lowerTick, 'upperTick:', upperTick, 'amount:', amount);

        const flippedLower = this._updateTick(lowerTick, amount);
        const flippedUpper = this._updateTick(upperTick, amount);
        if (flippedLower) {
            this.tickBitmap.flipTick(lowerTick, 1);
        }
        if (flippedUpper) {
            this.tickBitmap.flipTick(upperTick, 1);
        }

        this._updatePosition(user, lowerTick, upperTick, amount);
        this.liquidity += amount;

        const amount0 = calculateAmount0Delta(tickIndexToSqrtRatio(this.currentTickIndex), tickIndexToSqrtRatio(upperTick), amount);
        const amount1 = calculateAmount1Delta(tickIndexToSqrtRatio(this.currentTickIndex), tickIndexToSqrtRatio(lowerTick), amount);
        Logger.log(UniswapV3StylePool.TAG, JOB, 'amount0:', amount0, 'amount1:', amount1);
    }

    getPosition(user: string, lowerTick: number, upperTick: number): Position | undefined {
        const key = Position.getPositionKey(user, lowerTick, upperTick);
        return this.positions.get(key);
    }

    getTick(index: number) {
        return this.tick.get(index);
    }

    swap(user: string, xToY: boolean, amountSpecified: bigint) {
        let tickIndex = this.currentTickIndex;
        let sqrtPriceX96 = this.sqrtPriceX96;
        let amountCalculated = BigInt(0);
        let amountSpecifiedRemaining = amountSpecified;
        let amount0: bigint;
        let amount1: bigint;

        while (amountSpecifiedRemaining > 0) {
            let sqrtPriceStartX96 = sqrtPriceX96;

            let { next, initialized } = this.tickBitmap.nextInitializedTick(tickIndex, 1, xToY);
            let sqrtPriceNextX96 = tickIndexToSqrtRatio(next);
            let { sqrtPriceNextX96: price, amountIn, amountOut } = computeSwapStep(
                sqrtPriceStartX96,
                sqrtPriceNextX96,
                this.liquidity,
                amountSpecifiedRemaining
            );
            sqrtPriceX96 = price;
            amountSpecifiedRemaining -= amountIn;
            amountCalculated += amountOut;
            tickIndex = sqrtRatioToTick(sqrtPriceX96);
        }

        if (tickIndex != this.currentTickIndex) {
            this.sqrtPriceX96 = sqrtPriceX96;
            this.currentTickIndex = tickIndex;
        }

        if (xToY) {
            amount0 = amountSpecified - amountSpecifiedRemaining;
            amount1 = -amountCalculated;
        } else {
            amount0 = -amountCalculated;
            amount1 = amountSpecified - amountSpecifiedRemaining;
        }

        return { amount0, amount1 };
    }

    private _updateTick(tickIndex: number, amount: bigint): boolean {
        const JOB = "UPDATE_TICK";
        if (tickIndex < UniswapV3StylePool.MIN_TICK || tickIndex > UniswapV3StylePool.MAX_TICK) {
            return false;
        }
        Logger.log(UniswapV3StylePool.TAG, JOB, 'tickIndex:', tickIndex, 'amount:', amount);
        if (!this.tick.has(tickIndex)) {
            const tick = new Tick();
            tick.update(amount);
            this.tick.set(tickIndex, tick);
        } else {
            this.tick.get(tickIndex).update(amount);
        }
        return true;
    }

    private _updatePosition(user: string, lowerTick: number, upperTick: number, amount: bigint) {
        const JOB = "UPDATE_POSITION";
        Logger.log(UniswapV3StylePool.TAG, JOB, 'user:', user, 'lowerTick:', lowerTick, 'upperTick:', upperTick, 'amount:', amount);

        const positionKey = Position.getPositionKey(user, lowerTick, upperTick);
        let position = this.positions.get(positionKey);
        if (!position) {
            position = new Position(lowerTick, upperTick, amount);
            this.positions.set(positionKey, position);
        } else {
            position.update(amount);
        }
    }
}