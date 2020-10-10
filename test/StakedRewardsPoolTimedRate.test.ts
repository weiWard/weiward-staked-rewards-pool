import { expect, use } from 'chai';
import { solidity } from 'ethereum-waffle';
import { ethers } from '@nomiclabs/buidler';
import { hexZeroPad } from 'ethers/lib/utils';
// import { Contract } from 'ethers';
// import { Web3Provider } from '@ethersproject/providers';

use(solidity);

const contractName = 'StakedRewardsPoolTimedRate';

describe(contractName, () => {
	it('deploy', async function () {
		const rewardsTokenAddress = hexZeroPad('0x0', 20);
		const stakingTokenAddress = hexZeroPad('0x0', 20);
		const factory = await ethers.getContractFactory(contractName);
		const contract = await factory.deploy(
			rewardsTokenAddress,
			18,
			stakingTokenAddress,
			18,
			0,
			10,
		);
		expect(await contract.rewardsToken()).to.eq(rewardsTokenAddress);
		await contract.addToRewardsAllocation(10);
	});
});
