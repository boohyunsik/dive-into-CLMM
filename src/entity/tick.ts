import { ProgramAccount } from "./account";
import {Pool} from "./pool";

export class Tick extends ProgramAccount {
    initialized: boolean;
    liquidityNet: number;
    liquidityGross: number;
}

export class TickArray extends ProgramAccount {
    static TICK_ARRAY_SIZE = 88;

    startTickIndex: number;
    ticks: Tick[];
    pool: Pool;
}