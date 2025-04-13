import {Logger} from "../logger/logger";
import {UniswapV3StylePool} from "../implementations/uniswap_style/pool";

export const Q96 = 2 ** 96;
const TAG = "MATH";

export function computeSwapStep(
    sqrtPriceCurrentX96: bigint,
    sqrtPriceTargetX96: bigint,
    liquidity: bigint,
    amountRemaining: bigint,
): {
    sqrtPriceNextX96: bigint;
    amountIn: bigint;
    amountOut: bigint;
} {
    let xToY = sqrtPriceCurrentX96 >= sqrtPriceTargetX96;
    let sqrtPriceNextX96 = nextSqrtPriceFromInput(sqrtPriceCurrentX96, liquidity, amountRemaining, xToY);
    let amountIn = calculateAmount0Delta(sqrtPriceCurrentX96, sqrtPriceNextX96, liquidity);
    let amountOut = calculateAmount1Delta(sqrtPriceCurrentX96, sqrtPriceNextX96, liquidity);
    if (!xToY) {
        let temp = amountOut;
        amountOut = amountIn;
        amountIn = temp;
    }
    return { sqrtPriceNextX96, amountIn, amountOut };
}

export function nextSqrtPriceFromInput(
    sqrtPriceX96: bigint,
    liquidity: bigint,
    amountIn: bigint,
    xToY: boolean
): bigint {
    if (xToY) {
        return nextSqrtPriceFromAmount0RoundingUp(sqrtPriceX96, liquidity, amountIn);
    } else {
        return nextSqrtPriceFromAmount1RoundingDown(sqrtPriceX96, liquidity, amountIn);
    }
}

function nextSqrtPriceFromAmount0RoundingUp(
    sqrtPriceX96: bigint,
    liquidity: bigint,
    amountIn: bigint
): bigint {
    const numerator = liquidity * BigInt(Q96);
    const product = amountIn * sqrtPriceX96;

    const denominator = numerator + product;

    const result = divRoundingUp(numerator * sqrtPriceX96, denominator)
    Logger.log(TAG, "nextSqrtPriceFromAmount0RoundingUp", result);
    return result;
}

function nextSqrtPriceFromAmount1RoundingDown(sqrtPriceX96: bigint, liquidity: bigint, amountIn: bigint): bigint {
    const result = sqrtPriceX96 + ((amountIn * BigInt(Q96)) / liquidity);
    Logger.log(TAG, "nextSqrtPriceFromAmount1RoundingDown", result);
    return result;
}

export function priceToTick(price: number): number {
    const priceLog = Math.log(Math.sqrt(price));
    const spacingLog = Math.log(Math.sqrt(1.0001));
    const result = Math.round(priceLog / spacingLog);
    Logger.log(TAG, "priceToTick", price, result);
    return result;
}

export function sqrtRatioToTick(sqrtRatioX96: bigint): number {
    const sqrtRatioLog = Math.log(Number(sqrtRatioX96) / Q96);
    const spacingLog = Math.log(Math.sqrt(1.0001));
    const result = Math.round(sqrtRatioLog / spacingLog);
    Logger.log(TAG, "sqrtRatioToTick", sqrtRatioX96, result);
    return result;
}

export function priceToSqrtPrice(price: number): bigint {
    const sqrtPrice = Math.sqrt(price);
    const result = BigInt(sqrtPrice * Q96);
    Logger.log(TAG, "priceToSqrtPrice", price, result);
    return result;
}

export function tickIndexToSqrtRatio(tickIndex: number) {
    if (tickIndex < UniswapV3StylePool.MIN_TICK || tickIndex > UniswapV3StylePool.MAX_TICK) {
        Logger.log(TAG, "error", "Tick index out of bounds");
        throw new Error("Tick index out of bounds");
    }

    const result = BigInt(Math.pow(1.0001, tickIndex / 2) * Q96);
    Logger.log(TAG, "tickIndexToSqrtRatio", tickIndex, result);
    return result;
}

export function liquidity0(amount: bigint, priceA: bigint, priceB: bigint) {
    let pA: bigint, pB: bigint;
    if (priceA > priceB) {
        pB = priceA;
        pA = priceB;
    } else {
        pA = priceA;
        pB = priceB;
    }

    const result = divRoundingUp(divRoundingUp(amount * pA * pB, BigInt(Q96)), pB - pA);
    Logger.log(TAG, "liquidity0", result);
    return result;
}

export function liquidity1(amount: bigint, priceA: bigint, priceB: bigint) {
    let pA: bigint, pB: bigint;
    if (priceA > priceB) {
        pB = priceA;
        pA = priceB;
    } else {
        pA = priceA;
        pB = priceB;
    }

    const result = divRoundingUp(amount * BigInt(Q96), pB - pA);
    Logger.log(TAG, "liquidity1", result);
    return result;
}

export function calculateAmount0Delta(
    sqrtPriceAx96: bigint,
    sqrtPriceBx96: bigint,
    liquidity: bigint): bigint {
    let spa: bigint, spb: bigint;
    if (sqrtPriceAx96 > sqrtPriceBx96) {
        spb = sqrtPriceAx96;
        spa = sqrtPriceBx96;
    } else {
        spa = sqrtPriceAx96;
        spb = sqrtPriceBx96;
    }

    if (spa <= BigInt(0)) {
        Logger.log(TAG, "error", "Invalid sqrtPriceAx96");
        throw new Error("Invalid sqrtPriceAx96");
    }

    const result = divRoundingUp(divRoundingUp(liquidity * BigInt(Q96) * (spb - spa), spb), spa);
    Logger.log(TAG, "calculateAmount0Delta", result)
    return result;
}

export function calculateAmount1Delta(
    sqrtPriceAx96: bigint,
    sqrtPriceBx96: bigint,
    liquidity: bigint): bigint {
    Logger.log(TAG, "calculateAmount1Delta", sqrtPriceAx96, sqrtPriceBx96, liquidity);
    let spa: bigint, spb: bigint;
    if (sqrtPriceAx96 > sqrtPriceBx96) {
        spb = sqrtPriceAx96;
        spa = sqrtPriceBx96;
    } else {
        spa = sqrtPriceAx96;
        spb = sqrtPriceBx96;
    }

    const result = divRoundingUp((liquidity * (spb - spa)), BigInt(Q96));
    Logger.log(TAG, "calculateAmount1Delta", result)
    return result;
}

export function divRoundingUp(dividend: bigint, divisor: bigint) {
    if (divisor === BigInt(0)) {
        throw new Error("Division by zero");
    }
    const quotient = dividend / divisor;
    let remainder = dividend % divisor;
    const absRemainder = remainder >= BigInt(0) ? remainder : -remainder;
    const absDivisor = divisor >= BigInt(0) ? divisor : -divisor;

    if (absRemainder * BigInt(2) >= absDivisor) {
        if ((dividend >= BigInt(0) && divisor > BigInt(0)) || (dividend <= BigInt(0) && divisor < BigInt(0))) {
            return quotient + BigInt(1);
        } else {
            return quotient - BigInt(1);
        }
    }

    return quotient;
}