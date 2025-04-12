import {liquidity0, liquidity1, priceToSqrtPrice} from "../src/core/math";

describe("math test", () => {
   it("price_to_sqrtPrice", () => {
       const sqrtPrice1 = priceToSqrtPrice(4545);
       const sqrtPrice2 = priceToSqrtPrice(5000);
       const sqrtPrice3 =  priceToSqrtPrice(5500);

       expect(sqrtPrice1).toBe(BigInt(5341294542274603406682713227264));
       expect(sqrtPrice2).toBe(BigInt(5602277097478614198912276234240));
       expect(sqrtPrice3).toBe(BigInt(5875717789736564987741329162240));
   });

   it("calculate_liquidity", () => {
       const sqrtPrice1 = priceToSqrtPrice(4545);
       const sqrtPrice2 = priceToSqrtPrice(5000);
       const sqrtPrice3 =  priceToSqrtPrice(5500);

       const amount0 = BigInt(1) * BigInt(10 ** 18);
       const amount1 = BigInt(5000) * BigInt(10 ** 18);

       const liq0 = liquidity0(amount0, sqrtPrice2, sqrtPrice3);
       const liq1 = liquidity1(amount1, sqrtPrice2, sqrtPrice1);
       console.log("liq0: ", liq0); // 1519437308014769632747n
       console.log("liq1: ", liq1); // 1517882343751509783892n
       const liq = liq0 > liq1 ? liq1 : liq0;

       expect(liq).toBe(BigInt(1517882343751509783892));
   });
});