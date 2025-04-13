# Dive into CLMM

https://www.web3gb.com/Concentrated-Liquidity-Market-Maker-KR-1d0160ffffb680fa939fefcf090a9396
탈중앙화 거래소를 이루는 근반 이론인 집중 유동성 공급에 대해 알아보고, 코드로 살펴보는 예제 레포지토리입니다.

## What is CLMM?

기존의 AMM(Automated Market Maker) 모델은 유동성 공급자가 자산을 풀에 예치하고, 거래자는 이 풀에서 자산을 교환하는 구조입니다. 이때 유동성 공급자는 자산을 예치한 만큼의 수수료를 받습니다. 하지만, AMM 모델은 가격이 급등락할 경우 유동성 공급자가 손실을 입는 문제점이 있습니다. 이를 해결하기 위해 Concentrated Liquidity Model(집중 유동성 모델)이 등장했습니다.

## Uniswap V3, and Orca

이 레포지토리에서는 CLMM의 대표적인 구현체 두 서비스를 시뮬레이션합니다.
하나는 이더리움의 Uniswap V3이고, 다른 하나는 솔라나의 Orca입니다. 두 DEX 모두 많은 거래량이 나오고 있는 서비스입니다.
두 서비스는 전체적으로는 비슷하지만, 내부에서 틱을 관리하는 방법 등에서 차이를 보입니다.

## How to run

이 레포지토리는 Jest Test를 이용하여 실행할 수 있도록 개발했습니다.

```bash
yarn

jest /tests/math.test.ts
jest /tests/orca_style_pool.test.ts
jest /tests/uniswap_style_pool.test.ts
```