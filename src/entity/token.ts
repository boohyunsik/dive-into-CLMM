export class Token {
    name: string;
    decimal: number;

    constructor(name: string, decimal: number) {
        this.name = name;
        this.decimal = decimal;
    }

    toAmount(amount: number): bigint {
        return BigInt(amount) * BigInt(Math.pow(10, this.decimal));
    }
}