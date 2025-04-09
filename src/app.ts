import {AccountRepository} from "./repository/account_repository";
import {AccountFactory} from "./entity/account";
import {PoolFactory} from "./entity/pool";
import {TokenFactory} from "./entity/token";

function main() {
    const accountRepository = AccountRepository.getInstance();

    const user1 = AccountFactory.createUserAccount("user_address_1", accountRepository);
    const user2 = AccountFactory.createUserAccount("user_address_2", accountRepository);

    const coin = TokenFactory.createFungibleToken("coin", "Coin", 6, accountRepository);
    const token1 = TokenFactory.createFungibleToken("token_address_1", "Token A", 6, accountRepository);
    const token2 = TokenFactory.createFungibleToken("token_address_2", "Token B", 6, accountRepository);

    const clmmPool = PoolFactory.createNewClmmPool("clmm-pool_address_1",
        "CLMM Pool 1",
        token1,
        token2,
        0.03,
        16,
        accountRepository);

    token1.mint(user1, 10000);
    token2.mint(user2, 20000);



    accountRepository.dump();

    console.log(`[TOKEN_PAIR]`, clmmPool.getTokenPair());
}

try {
    main();
} catch (e) {
    console.error("[ERROR] ", e);
}