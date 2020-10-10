import { BuidlerConfig, usePlugin } from '@nomiclabs/buidler/config';
import { Wallet } from '@ethersproject/wallet';

// No need for this line since buidler-waffle already does it
// usePlugin("@nomiclabs/buidler-ethers");
usePlugin('@nomiclabs/buidler-waffle');
usePlugin('buidler-deploy');

// Use the ganache mnemonic to generate buidlerevm accounts. We can then verify
// deterministic deployments across both networks.
const insecure_mnemonic =
	'system disease spend wreck student immune domain mind wish body same glove';
const buidlerEvmAccounts = new Array<{ privateKey: string; balance: string }>(
	10,
);
for (let i = 0; i < buidlerEvmAccounts.length; i++) {
	const wallet = Wallet.fromMnemonic(insecure_mnemonic, "m/44'/60'/0'/0/" + i);
	buidlerEvmAccounts[i] = {
		privateKey: wallet.privateKey,
		// 10_000 ETH
		balance: '0x10000000000000000000000',
	};
}

const config: BuidlerConfig = {
	defaultNetwork: 'buidlerevm',
	networks: {
		buidlerevm: {
			accounts: buidlerEvmAccounts,
		},
		localhost: {
			live: false, // default for localhost & buidlerevm
			url: 'http://127.0.0.1:8545',
		},
		ganache: {
			live: false,
			url: 'http://127.0.0.1:7545',
		},
	},
	solc: {
		version: '0.7.3',
		optimizer: {
			enabled: true,
			runs: 200,
		},
	},
	paths: {
		sources: './contracts',
		tests: './test',
		cache: './build/cache',
		artifacts: './build/artifacts',
	},
	// buidler-deploy
	namedAccounts: {
		deployer: 0, // deployer uses first account by default
		tester: 1,
	},
};

export default config;
