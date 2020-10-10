// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;

import "@openzeppelin/contracts/math/Math.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

import "./interfaces/IStakedRewardsPoolTimedRate.sol";
import "./StakedRewardsPool.sol";

// Accuracy in block.timestamps is not needed.
// https://consensys.github.io/smart-contract-best-practices/recommendations/#the-15-second-rule
/* solhint-disable not-rely-on-time */

contract StakedRewardsPoolTimedRate is
	StakedRewardsPool,
	IStakedRewardsPoolTimedRate
{
	using SafeMath for uint256;

	/* Immutable Public State */

	bytes32 public constant DISTRIBUTOR_ADMIN_ROLE = keccak256(
		"DISTRIBUTOR_ADMIN_ROLE"
	);
	bytes32 public constant DISTRIBUTOR_ROLE = keccak256("DISTRIBUTOR_ROLE");

	bytes32 public constant PERIOD_SETTER_ADMIN_ROLE = keccak256(
		"PERIOD_SETTER_ADMIN_ROLE"
	);
	bytes32 public constant PERIOD_SETTER_ROLE = keccak256("PERIOD_SETTER_ROLE");

	/* Mutable Private State */

	uint256 private _accruedRewardPerToken;
	mapping(address => uint256) private _accruedRewardPerTokenPaid;
	uint256 private _lastUpdateTime;
	uint256 private _periodEndTime;
	uint256 private _periodStartTime;
	uint256 private _rewardRate;

	/* Modifiers */

	modifier whenStarted {
		require(
			hasStarted(),
			"StakedRewardsPoolTimedRate: current rewards distribution period has not yet begun"
		);
		_;
	}

	/* Constructor */

	constructor(
		IERC20 rewardsToken,
		uint8 rewardsTokenDecimals,
		IERC20 stakingToken,
		uint8 stakingTokenDecimals,
		uint256 periodStartTime,
		uint256 periodEndTime
	)
		StakedRewardsPool(
			rewardsToken,
			rewardsTokenDecimals,
			stakingToken,
			stakingTokenDecimals
		)
	{
		_periodStartTime = periodStartTime;
		_periodEndTime = periodEndTime;

		// Setup distributor roles
		_setRoleAdmin(DISTRIBUTOR_ROLE, DISTRIBUTOR_ADMIN_ROLE);
		_setupRole(DISTRIBUTOR_ADMIN_ROLE, _msgSender());
		_setupRole(DISTRIBUTOR_ROLE, _msgSender());

		// Setup set staking period roles
		_setRoleAdmin(PERIOD_SETTER_ROLE, PERIOD_SETTER_ADMIN_ROLE);
		_setupRole(PERIOD_SETTER_ADMIN_ROLE, _msgSender());
		_setupRole(PERIOD_SETTER_ROLE, _msgSender());
	}

	/* Public Views */

	// Represents the ratio of reward token to staking token accrued thus far,
	// multiplied by 10**stakingTokenDecimal in case of a fraction.
	function accruedRewardPerToken() public view override returns (uint256) {
		uint256 totalSupply = totalSupply();
		if (totalSupply == 0) {
			return _accruedRewardPerToken;
		}

		uint256 dt = lastTimeRewardApplicable().sub(_lastUpdateTime);
		if (dt == 0) {
			return _accruedRewardPerToken;
		}

		uint256 accruedReward = _rewardRate.mul(dt);

		return
			_accruedRewardPerToken.add(
				accruedReward.mul(_getStakingTokenBase()).div(totalSupply)
			);
	}

	function earned(address account)
		public
		view
		override(IStakedRewardsPool, StakedRewardsPool)
		returns (uint256)
	{
		// Divide by stakingTokenBase in accordance with accruedRewardPerToken()
		return
			balanceOf(account)
				.mul(accruedRewardPerToken().sub(_accruedRewardPerTokenPaid[account]))
				.div(_getStakingTokenBase())
				.add(_rewards[account]);
	}

	function hasStarted() public view override returns (bool) {
		return block.timestamp >= _periodStartTime;
	}

	function hasEnded() public view override returns (bool) {
		return block.timestamp >= _periodEndTime;
	}

	function lastTimeRewardApplicable() public view override returns (uint256) {
		// Returns 0 if we have never run a staking period.
		// Returns _periodEndTime if we have but we're not in a staking period.
		if (!hasStarted()) {
			return _lastUpdateTime;
		}
		return Math.min(block.timestamp, _periodEndTime);
	}

	function periodDuration() public view override returns (uint256) {
		return _periodEndTime.sub(_periodStartTime);
	}

	function periodEndTime() public view override returns (uint256) {
		return _periodEndTime;
	}

	function periodStartTime() public view override returns (uint256) {
		return _periodStartTime;
	}

	function timeRemainingInPeriod()
		public
		view
		override
		whenStarted
		returns (uint256)
	{
		if (hasEnded()) {
			return 0;
		}
		return _periodEndTime.sub(block.timestamp);
	}

	/* Public Mutators */

	function addToRewardsAllocation(uint256 amount)
		public
		override
		nonReentrant
	{
		require(
			hasRole(DISTRIBUTOR_ROLE, msg.sender),
			"StakedRewardsPoolTimedRate: must have distributor role to add to the rewards allocation"
		);
		_addToRewardsAllocation(amount);
	}

	function setNewPeriod(uint256 startTime, uint256 endTime) public override {
		require(
			hasRole(PERIOD_SETTER_ROLE, msg.sender),
			"StakedRewardsPoolTimedRate: must have period setter role to set a new period"
		);
		require(
			!hasStarted() || hasEnded(),
			"StakedRewardsPoolTimedRate: cannot change an ongoing staking period"
		);
		require(
			endTime > startTime,
			"StakedRewardsPoolTimedRate: endTime must be greater than startTime"
		);
		// The lastTimeRewardApplicable() function would not allow rewards for a
		// past period that was never started.
		require(
			startTime > block.timestamp,
			"StakedRewardsPoolTimedRate: startTime must be greater than the current block time"
		);
		// Ensure that rewards are fully granted before changing the period.
		_updateAccrual();
		_periodStartTime = startTime;
		_periodEndTime = endTime;
	}

	/* Internal Mutators */

	// Ensure that the amount param is equal to the amount you've added to the contract, otherwise the funds will run out before _periodEndTime.
	// If called during an ongoing staking period, the amount will be allocated
	// to the current staking period.
	// If called before or after a staking period, the amount will only be
	// applied to the next staking period.
	function _addToRewardsAllocation(uint256 amount) internal {
		_updateAccrual();

		// Update reward rate based on remaining time
		uint256 remainingTime;
		if (!hasStarted() || hasEnded()) {
			remainingTime = periodDuration();
		} else {
			remainingTime = timeRemainingInPeriod();
		}

		_rewardRate = _rewardRate.add(amount.div(remainingTime));

		emit RewardAdded(amount);
	}

	function _updateAccrual() internal {
		_accruedRewardPerToken = accruedRewardPerToken();
		_lastUpdateTime = lastTimeRewardApplicable();
	}

	// This logic is needed for any interaction that may manipulate rewards.
	function _updateRewardFor(address account) internal override {
		_updateAccrual();
		// Allocate due rewards.
		_rewards[account] = earned(account);
		// Remove ability to earn rewards on or before the current timestamp.
		_accruedRewardPerTokenPaid[account] = _accruedRewardPerToken;
	}
}
