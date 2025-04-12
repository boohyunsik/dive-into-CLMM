import {TickArray} from "../src/entity/orca_style/tick_array";
import {Tick} from "../src/entity/orca_style/tick";

describe("tick array test", () => {
    it("tick_array_test", () => {
        const numberOfTicks = 88;
        const ticks: Tick[] = Array.from(
            { length: numberOfTicks }, (_, i) => new Tick());

        ticks[60].initialized = true;

        const tickArray = new TickArray(0, ticks);
        const initializedTick = tickArray.getNextInitializedTick(0, 10, false);
        console.log(initializedTick);
    });
});