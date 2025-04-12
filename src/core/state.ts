export class State {
    static instance: State;

    balances: Map<string, Map<string, bigint>>;

    private constructor() {
        this.balances = new Map();
    }

    public static getInstance(): State {
        if (!State.instance) {
            State.instance = new State();
        }

        return State.instance;
    }

    setBalance(user: string, token: string, amount: bigint) {
        if (!this.balances.has(user)) {
            this.balances.set(user, new Map());
        }

        const userBalances = this.balances.get(user)!;
        userBalances.set(token, amount);
    }

    getBalance(user: string, token: string): bigint {
        if (!this.balances.has(user)) {
            return BigInt(0);
        }

        const userBalances = this.balances.get(user)!;
        return userBalances.get(token) || BigInt(0);
    }
}