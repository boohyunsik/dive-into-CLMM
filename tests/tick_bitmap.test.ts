import {TickBitmap} from "../src/entity/uniswap_style/tick_bitmap";

describe('tick bitmap test', () => {
   it('calculating_position', () => {
       const tick = 85176;
       const [ wordPosition, bitPosition ] = TickBitmap.position(tick);
       console.log(`Word Position: ${wordPosition}, Bit Position: ${bitPosition}`);
       expect(wordPosition).toBe(332);
       expect(bitPosition).toBe(184);
   });

   it('flipping_tick', () => {
       const tickBitmap = new TickBitmap();
       const spacing = 16;

       tickBitmap.flipTick(0, spacing);
       tickBitmap.flipTick(128, spacing);
       tickBitmap.flipTick(-256, spacing);

       const { next, initialized } = tickBitmap.nextInitializedTick(10, spacing, false);
       console.log(`From 10 right => next=${next} init? ${initialized}`);
   })
});