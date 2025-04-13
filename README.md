# Dive into CLMM

https://www.web3gb.com/Concentrated-Liquidity-Market-Maker-EN-1d4160ffffb68070bf1cecf7d467ee8e

This repository explores the fundamental theory behind decentralized exchanges—concentrated liquidity provision—and provides an example implementation to examine in code.

## What is CLMM?

The traditional AMM (Automated Market Maker) model involves liquidity providers depositing assets into a pool, and traders then exchanging assets from this pool. In this setup, liquidity providers earn fees proportional to the assets they have deposited. However, the AMM model poses a problem: if prices fluctuate sharply, liquidity providers can incur losses. The Concentrated Liquidity Model (CLMM) was introduced to address this issue.

## Uniswap V3, and Orca

In this repository, we simulate two representative implementations of CLMM:
* Uniswap V3 on Ethereum
* Orca on Solana
Both of these DEX platforms handle large trading volumes. They share a similar overall structure but differ in certain internal details, such as how they manage ticks.

# How to run

This repository is set up to be run using Jest tests:

```bash
yarn

jest /tests/math.test.ts
jest /tests/orca_style_pool.test.ts
jest /tests/uniswap_style_pool.test.ts\
```