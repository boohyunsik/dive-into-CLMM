import {Token} from "../src/entity/token";
import {liquidity0, liquidity1, priceToSqrtPrice, priceToTick} from "../src/core/math";
import {OrcaStylePool} from "../src/implementations/orca_style/pool";
import {Logger} from "../src/logger/logger";

const TAG = "OrcaStylePoolTest";

describe("orca", () => {
   it("add_liquidity", () => {
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

      const pool = new OrcaStylePool(sqrtPrice, currentTick, 1);
      pool.addLiquidity("user-1", lowerTick, upperTick, liq);

      Logger.log(TAG, 'pool liquidity', pool.liquidity);
      Logger.log(TAG, 'pool position', pool.positions);
      Logger.log(TAG, 'pool ticks', pool.tickArrays);

      const position = pool.getPosition("user-1", lowerTick, upperTick);
      Logger.log(TAG, 'position', position);

      const lowerTickObject = pool.getLiquidityNet(lowerTick);
      const upperTickObject = pool.getLiquidityNet(upperTick);
      Logger.log(TAG, 'lowerTick', lowerTickObject);
      Logger.log(TAG, 'upperTick', upperTickObject);

      const nextPrice = pool.sqrtPriceX96;
      Logger.log(TAG, 'nextPrice', nextPrice);
   });

   it("swap", () => {
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

      const pool = new OrcaStylePool(sqrtPrice, currentTick, 1);
      pool.addLiquidity("user-1", lowerTick, upperTick, liq);

      const result = pool.swap("user-1", true, BigInt(13_370));
      console.log('result', result);
   });
});