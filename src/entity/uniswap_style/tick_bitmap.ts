import {Logger} from "../../logger/logger";

class TickBitmapWord {
    public bits: bigint;

    constructor() {
        this.bits = BigInt(0);
    }
}

export class TickBitmap {
    private static TAG = "TickBitmap";
    static WORD_SIZE = 256;
    static BITS_PER_WORD = BigInt(256);

    bitmap: Map<number, bigint>;

    constructor() {
        this.bitmap = new Map<number, bigint>();
    }

    private getWord(wordPos: number): bigint {
        return this.bitmap.get(wordPos) ?? BigInt(0);
    }

    private setWord(wordPos: number, val: bigint) {
        if (val === BigInt(0)) {
            this.bitmap.delete(wordPos);
        } else {
            this.bitmap.set(wordPos, val);
        }
    }

    static position(tickIndex: number): [number, number] {
        const wordPos = tickIndex >> 8;
        const bitPos = tickIndex & 0xff;
        return [wordPos, bitPos];
    }

    public flipTick(tickIndex: number, tickSpacing: number) {
        const JOB = "flipTick";
        Logger.log(TickBitmap.TAG, JOB, 'tickIndex:', tickIndex, 'tickSpacing:', tickSpacing);
        if (tickSpacing === 0) {
            throw new Error("Tick spacing cannot be zero");
        }

        const compressed = Math.floor(tickIndex / tickSpacing);
        const [wordPos, bitPos] = TickBitmap.position(compressed);

        const mask = BigInt(1) << BigInt(bitPos);
        const oldVal = this.getWord(wordPos);
        const newVal = oldVal ^ mask;
        this.setWord(wordPos, newVal);
    }

    nextInitializedTick(
        tickIndex: number,
        tickSpacing: number,
        xToY: boolean
    ): { next: number; initialized: boolean} {
        let compressed = Math.floor(tickIndex / tickSpacing);
        if (tickIndex < 0 && (tickIndex % tickSpacing) !== 0) {
            compressed -= 1;
        }

        if (xToY) {
            const [wordPos, bitPos] = TickBitmap.position(compressed);
            const mask = (BigInt(1) << BigInt(bitPos + 1)) - BigInt(1);

            const wordVal = this.getWord(wordPos);
            const masked = wordVal & mask;

            const initialized = (masked !== BigInt(0));

            let nextTick: number;
            if (initialized) {
                const msb = this.findMostSignificantBit(masked);
                const posDelta = bitPos - msb;
                nextTick = (compressed - posDelta) * tickSpacing;
            } else {
                nextTick = (compressed - bitPos) * tickSpacing;
            }
            return { next: nextTick, initialized };
        } else {
            const [wordPos, bitPos] = TickBitmap.position(compressed + 1);
            const mask = ~((BigInt(1) << BigInt(bitPos)) - BigInt(1));

            const wordVal = this.getWord(wordPos);
            const masked = wordVal & mask;

            const initialized = (masked !== BigInt(0));

            let nextTick: number;
            if (initialized) {
                const lsb = this.findLeastSignificantBit(masked);
                const posDelta = lsb - bitPos;
                nextTick = (compressed + 1 + posDelta) * tickSpacing;
            } else {
                const posDelta = 255 - bitPos;
                nextTick = (compressed + 1 + posDelta) * tickSpacing;
            }

            return { next: nextTick, initialized };
        }
    }

    findMostSignificantBit(x: bigint): number {
        if (x === BigInt(0)) return -1;
        for (let i = TickBitmap.WORD_SIZE - 1; i >= 0; i--) {
            const mask = BigInt(1) << BigInt(i);
            if ((x & mask) !== BigInt(0)) {
                return i;
            }
        }
        return -1;
    }

    findLeastSignificantBit(x: bigint): number {
        if (x === BigInt(0)) return -1;
        for (let i = 0; i < TickBitmap.WORD_SIZE; i++) {
            const mask = BigInt(1) << BigInt(i);
            if ((x & mask) !== BigInt(0)) {
                return i;
            }
        }
        return -1;
    }
}
