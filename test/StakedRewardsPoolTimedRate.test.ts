import { expect, use } from 'chai';
import { solidity } from 'ethereum-waffle';
import { deployments } from '@nomiclabs/buidler';
import { parseUnits } from 'ethers/lib/utils';
import { BigNumber } from '@ethersproject/bignumber';

import { MockErc20 } from '../build/types/ethers/MockErc20';
import { MockErc20Factory } from '../build/types/ethers/MockErc20Factory';
import { StakedRewardsPoolTimedRate } from '../build/types/ethers/StakedRewardsPoolTimedRate';
import { StakedRewardsPoolTimedRateFactory } from '../build/types/ethers/StakedRewardsPoolTimedRateFactory';
// TODO remove this disable
/* eslint-disable @typescript-eslint/no-unused-vars */
import { hasOneOfTitles } from './helpers/hasTitle';

use(solidity);

// Define useful variables
const contractName = 'StakedRewardsPoolTimedRate';
const rewardsDecimals = 18;
const stakingDecimals = 18;
const unsupportedDecimals = 18;
function parseRewardsToken(value: string): BigNumber {
	return parseUnits(value, rewardsDecimals);
}
function parseStakingToken(value: string): BigNumber {
	return parseUnits(value, stakingDecimals);
}
function parseUnsupportedToken(value: string): BigNumber {
	return parseUnits(value, unsupportedDecimals);
}
const initRewardsBalance = parseRewardsToken('10000');
const initStakingBalance = parseStakingToken('10000');
const initUnsupportedBalance = parseRewardsToken('10000');

// Define fixture for snapshots
const setupTest = deployments.createFixture(
	async ({ getNamedAccounts, ethers }) => {
		// Ensure fresh deployments
		// await deployments.fixture();

		// Get accounts
		const { deployer, tester } = await getNamedAccounts();
		const deployerSigner = ethers.provider.getSigner(deployer);
		const testerSigner = ethers.provider.getSigner(tester);

		// Deploy mock ERC20's
		const decimals = 18;
		const rewardsToken = await new MockErc20Factory(deployerSigner).deploy(
			'Rewards Token',
			'RERC20',
			rewardsDecimals,
			initRewardsBalance,
		);
		const stakingToken = await new MockErc20Factory(deployerSigner).deploy(
			'Staking Token',
			'SERC20',
			stakingDecimals,
			initStakingBalance,
		);
		const unsupportedToken = await new MockErc20Factory(deployerSigner).deploy(
			'Unsupported Token',
			'UERC20',
			unsupportedDecimals,
			initUnsupportedBalance,
		);

		// Get handles for contract
		const contract = await new StakedRewardsPoolTimedRateFactory(
			deployerSigner,
		).deploy(rewardsToken.address, stakingToken.address, decimals, 0, 10);

		const testerContract = contract.connect(testerSigner);

		return {
			deployer,
			tester,
			contract,
			testerContract,
			rewardsToken,
			stakingToken,
			unsupportedToken,
		};
	},
);

describe(contractName, function () {
	let deployer: string;
	let tester: string;
	let contract: StakedRewardsPoolTimedRate;
	let testerContract: StakedRewardsPoolTimedRate;
	let rewardsToken: MockErc20;
	let stakingToken: MockErc20;
	let unsupportedToken: MockErc20;

	beforeEach(async function () {
		// Snapshot deployments
		({
			deployer,
			tester,
			contract,
			testerContract,
			rewardsToken,
			stakingToken,
			unsupportedToken,
		} = await setupTest());
	});

	it('State is correct', async function () {
		// Log addresses
		// console.log({ deployer });
		// console.log({ tester });
		// console.log(`contract: ${contract.address}`);

		// Check period
		expect(await contract.periodStartTime()).to.eq(
			0,
			'period start time mismatch',
		);
		expect(await contract.periodEndTime()).to.eq(
			10,
			'period end time mismatch',
		);
		expect(await contract.periodDuration()).to.eq(
			10,
			'period duration mismatch',
		);
		expect(await contract.hasStarted()).to.eq(
			true,
			'period hasStarted mismatch',
		);
		expect(await contract.hasEnded()).to.eq(true, 'period hasEnded mismatch');
		expect(await contract.timeRemainingInPeriod()).to.eq(
			0,
			'time remaining in period mismatch',
		);
	});

	/* StakedRewardsPool implementations */

	describe('updateReward', function () {
		it('should work');
	});

	describe('updateRewardFor', function () {
		it('should work');
	});

	describe('earned', function () {
		it('should work');
	});

	describe('getReward', function () {
		it('should work');
	});

	describe('exit', function () {
		it('should work');
	});

	/* StakedRewardsPoolTimedRate-specific */

	describe('setNewPeriod', function () {
		it('should update periodStartTime');

		it('should update periodEndTime');

		it('should update periodDuration');
	});

	describe('hasEnded', function () {
		it('should work');
	});

	describe('hasStarted', function () {
		it('should work');
	});

	describe('timeRemainingInPeriod', function () {
		it('should work');
	});

	describe('lastTimeRewardApplicable', function () {
		it('should work');
	});

	describe('accruedRewardPerToken', function () {
		it('should work');
	});

	describe('addToRewardsAllocation', function () {
		it('should emit RewardAdded event');
	});
});
