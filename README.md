# weiward-staked-rewards-pool

## Prerequisites

1. Install npm and pnpm, preferably using nvm or nvm-windows.

	```bash
	nvm install 12.19.0
	nvm use 12.19.0
	npm i -g pnpm
	# Check installation
	node --version
	npm --version
	pnpm --version
	```

## Build

```bash
# Install dependencies
pnpm install
# Lint
npm run lint
# Compile contracts
npm run compile
# Generate TypeScript contract interfaces from ABI's
npm run gen-types
# Deploy to buidlerevm
npm run deploy
# Verify on Etherscan
npm run verify -- --network mainnet
# Export ABI and addresses for deployed contracts to build/abi.json.
npm run export -- --network mainnet
# Export ABI and addresses for deployed contracts across all networks to build/abi.json.
npm run export:all
```

## Deploy

After installing dependencies, you may run all deployments (NOT RECOMMENDED) or
you may deploy specific contracts by specifying tags.

Copy [.env.example](.env.example) to `.env` and replace the fields with your credentials. See the section on [.env Variables](.env-Variables) for a description of each variable.

Currently, you may deploy contracts using either a local node or [Infura](https://infura.io/).

```bash
# Install dependencies
pnpm install
# Deploy all contracts to buidlerevm
npx run deploy
```

### .env Variables

| Variable | Type | Description | Default |
| --- | --- | --- | --- |
| MNEMONIC | string | The mnemonic for your wallet needed to deploy from your account. The default is always used for the buidlerevm network. Ganache does not require this either. | `system disease spend wreck student immune domain mind wish body same glove` |
| INFURA_TOKEN | string | The [Infura](https://infura.io/) Project ID needed to use Infura. | |
| ETHERSCAN_API_KEY | string | Your API key for verifying contracts on [Etherscan](https://etherscan.io/apis). | |
| DEPLOYER_ACCOUNT_INDEX | int | The index in your wallet of the account you would like to use for deploying contracts. | `0` |
| TESTER_ACCOUNT_INDEX | int | The index in your wallet of an account you would like to use when running `npm run test`. | `1` |

### Available Networks

The deploy process currently supports the following named networks. More can be added
easily in [buidler.config.ts](buidler.config.ts).

```bash
npx buidler deploy --network http://127.0.0.1:8545
```

| Network | URL | Description |
| --- | --- | --- |
| buidlerevm | N/A | The default network and EVM made by Buidler. Ideal for testing. |
| localhost | `http://127.0.0.1:8545` | A local node for testing. DO NOT use for live networks. |
| ganache | `http://127.0.0.1:7545` | The default ganache port. |
| production | `http://127.0.0.1:8545` | A local node running a live network |
| goerli_infura | `https://goerli.infura.io/v3/${INFURA_TOKEN}` | Infura project endpoint for the Görli testnet. |
| kovan_infura | `https://kovan.infura.io/v3/${INFURA_TOKEN}` | Infura project endpoint for the Kovan testnet. |
| rinkeby_infura | `https://rinkeby.infura.io/v3/${INFURA_TOKEN}` | Infura project endpoint for the Rinkeby testnet. |
| ropsten_infura | `https://ropsten.infura.io/v3/${INFURA_TOKEN}` | Infura project endpoint for the Ropsten testnet. |
| mainnet_infura | `https://mainnet.infura.io/v3/${INFURA_TOKEN}` | Infura project endpoint for the Ethereum mainnet. |

### Contract Tags

#### yLandWETHUNIV2Pool

[Yearn Land](yland.finance) uses this to offer farming yLand by staking a liquidity pair. It is a rewards pool for staking yLand-WETH UNI-V2 pair tokens and earning yLand as a reward over a defined period of time.

Once yLand is deposited to the contract, an administrator may update the contract to increase the reward schedule for the current or future staking period.

contract: [StakedRewardsPoolTimedRate](contracts/StakedRewardsPoolTimedRate.sol)

```bash
# Deploy using a local node
npx buidler deploy --network production --tags yLandWETHUNIV2Pool
# Deploy to ropsten using Infura
npx buidler deploy --network ropsten_infura --tags yLandWETHUNIV2Pool
# Deploy to mainnet using Infura
npx buidler deploy --network mainnet_infura --tags yLandWETHUNIV2Pool
```
