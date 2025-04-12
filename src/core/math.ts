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

export function nextSqrtPriceFromInput(sqrtPriceX96: bigint, liquidity: bigint, amountIn: bigint, xToY: boolean) {
    if (xToY) {
        return nextSqrtPriceFromAmount0RoundingUp(sqrtPriceX96, liquidity, amountIn);
    } else {
        return nextSqrtPriceFromAmount1RoundingDown(sqrtPriceX96, liquidity, amountIn);
    }
}

function nextSqrtPriceFromAmount0RoundingUp(sqrtPriceX96: bigint, liquidity: bigint, amountIn: bigint) {
    console.log('nextSqrtPriceFromAmount0', sqrtPriceX96, liquidity, amountIn);
    const numerator = liquidity * BigInt(Q96);
    const product = amountIn * sqrtPriceX96;

    const denominator = numerator + product;
    console.log('result1', numerator * sqrtPriceX96 / denominator);
    return numerator * sqrtPriceX96 / denominator;
}

function nextSqrtPriceFromAmount1RoundingDown(sqrtPriceX96: bigint, liquidity: bigint, amountIn: bigint) {
    console.log('nextSqrtPriceFromAmount1', sqrtPriceX96, liquidity, amountIn);
    return sqrtPriceX96 + ((amountIn * BigInt(Q96)) / liquidity);
}

export function priceToTick(price: number) {
    const priceLog = Math.log(Math.sqrt(price));
    const spacingLog = Math.log(Math.sqrt(1.0001));
    return Math.round(priceLog / spacingLog);
}

export function sqrtRatioToTick(sqrtRatioX96: bigint) {
    const sqrtRatioLog = Math.log(Number(sqrtRatioX96) / Q96);
    const spacingLog = Math.log(Math.sqrt(1.0001));
    return Math.round(sqrtRatioLog / spacingLog);
}

export function priceToSqrtPrice(price: number): bigint {
    const sqrtPrice = Math.sqrt(price);
    return BigInt(sqrtPrice * Q96);
}

export function tickIndexToSqrtRatio(tickIndex: number) {
    console.log('tickIndexToSqrtRatio', tickIndex);
    if (tickIndex < UniswapV3StylePool.MIN_TICK || tickIndex > UniswapV3StylePool.MAX_TICK) {
        console.error('[ERROR]', tickIndex);
        throw new Error("Tick index out of bounds");
    }

    return BigInt(Math.pow(1.0001, tickIndex / 2) * Q96);
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

    // return (amount * (pA * pB)) / (pB - pA) / BigInt(Q96);
    return divRoundingUp(divRoundingUp(amount * pA * pB, BigInt(Q96)), pB - pA);
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

    // return (amount * BigInt(Q96)) / (pB - pA);
    return divRoundingUp(amount * BigInt(Q96), pB - pA);
}

export function calculateAmount0(liquidity: bigint, priceA: bigint, priceB: bigint) {
    let pA: bigint, pB: bigint;
    if (priceA > priceB) {
        pB = priceA;
        pA = priceB;
    } else {
        pA = priceA;
        pB = priceB;
    }

    return liquidity * BigInt(Q96) * (pB - pA) / pA / pB;
}

export function calculateAmount1(liquidity: bigint, priceA: bigint, priceB: bigint) {
    let pA: bigint, pB: bigint;
    if (priceA > priceB) {
        pB = priceA;
        pA = priceB;
    } else {
        pA = priceA;
        pB = priceB;
    }

    return divRoundingUp(liquidity * (pB-pA), BigInt(Q96));
}

export function calculateAmount0Delta(
    sqrtPriceAx96: bigint,
    sqrtPriceBx96: bigint,
    liquidity: bigint): bigint {
    Logger.log(TAG, "calculateAmount0Delta", sqrtPriceAx96, sqrtPriceBx96, liquidity);
    let spa: bigint, spb: bigint;
    if (sqrtPriceAx96 > sqrtPriceBx96) {
        spb = sqrtPriceAx96;
        spa = sqrtPriceBx96;
    } else {
        spa = sqrtPriceAx96;
        spb = sqrtPriceBx96;
    }

    if (spa <= BigInt(0)) {
        throw new Error("Invalid sqrtPriceAx96");
    }

    return divRoundingUp(divRoundingUp(liquidity * BigInt(Q96) * (spb - spa), spb), spa);
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

    return divRoundingUp((liquidity * (spb - spa)), BigInt(Q96));
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