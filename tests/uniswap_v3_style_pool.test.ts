import {Token} from "../src/entity/token";
import {liquidity0, liquidity1, priceToSqrtPrice, priceToTick} from "../src/core/math";
import {UniswapV3StylePool} from "../src/implementations/uniswap_style/pool";
import {Logger} from "../src/logger/logger";

const TAG = "UniswapV3StylePoolTest";

describe('uniswap_v3', () => {
    it('add_liquidity', () => {
        const tokenA = new Token("SOL", 6);
        const tokenB = new Token("USDC", 6);
        const tokenA_amount = tokenA.toAmount(1);
        const tokenB_amount = tokenB.toAmount(5000);

        const sqrtPrice = priceToSqrtPrice(5000);
        const lowerPrice = priceToSqrtPrice(4545);
        const upperPrice = priceToSqrtPrice(5500);

        const liq0 = liquidity0(tokenA_amount, sqrtPrice, upperPrice);
        const liq1 = liquidity1(tokenB_amount, sqrtPrice, lowerPrice);
        let liq = liq0 > liq1 ? liq1 : liq0;

        const currentTick = priceToTick(5000);
        const lowerTick = priceToTick(4545);
        const upperTick = priceToTick(5500);

        const pool = new UniswapV3StylePool(sqrtPrice, currentTick);
        pool.addLiquidity("user-1", lowerTick, upperTick, liq);

        Logger.log(TAG, 'pool liquidity', pool.liquidity);
        Logger.log(TAG, 'pool position', pool.positions);
        Logger.log(TAG, 'pool ticks', pool.tickBitmap);

        const position = pool.getPosition("user-1", lowerTick, upperTick);
        Logger.log(TAG, 'position', position);

        const lowerTickObject = pool.getTick(lowerTick);
        const upperTickObject = pool.getTick(upperTick);
        Logger.log(TAG, 'lowerTick', lowerTickObject);
        Logger.log(TAG, 'upperTick', upperTickObject);
    });

    it('swap', () => {
        // first add liquidity
        const tokenA = new Token("SOL", 6);
        const tokenB = new Token("USDC", 6);
        const tokenA_amount = tokenA.toAmount(1);
        const tokenB_amount = tokenB.toAmount(5000);

        const sqrtPrice = priceToSqrtPrice(5000);
        const lowerPrice = priceToSqrtPrice(4545);
        const upperPrice = priceToSqrtPrice(5500);

        const liq0 = liquidity0(tokenA_amount, sqrtPrice, upperPrice);
        const liq1 = liquidity1(tokenB_amount, sqrtPrice, lowerPrice);
        let liq = liq0 > liq1 ? liq1 : liq0;

        const currentTick = priceToTick(5000);
        const lowerTick = priceToTick(4545);
        const upperTick = priceToTick(5500);

        const pool = new UniswapV3StylePool(sqrtPrice, currentTick);
        pool.addLiquidity("user-1", lowerTick, upperTick, liq);

        Logger.log(TAG, 'pool liquidity', pool.liquidity);
        Logger.log(TAG, 'pool position', pool.positions);
        Logger.log(TAG, 'pool ticks', pool.tickBitmap);

        const position = pool.getPosition("user-1", lowerTick, upperTick);
        Logger.log(TAG, 'position', position);

        const lowerTickObject = pool.getTick(lowerTick);
        const upperTickObject = pool.getTick(upperTick);
        Logger.log(TAG, 'lowerTick', lowerTickObject);
        Logger.log(TAG, 'upperTick', upperTickObject);

        // swap
        const result = pool.swap("user-1", true, BigInt(13_370));
        expect(result.amount0).toBe(BigInt(13370));
        expect(result.amount1).toBe(BigInt(-66808389))
    });

});