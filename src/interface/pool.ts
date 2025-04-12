
export interface Pool {
    addLiquidity(user: string, lowerTick: number, upperTick: number, amount: bigint);
    swap(user: string, xToY: boolean, amountIn: bigint);
    getPosition(user: string, lowerTick: number, upperTick: number);
    getTick(index: number);
}