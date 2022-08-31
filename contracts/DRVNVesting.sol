// SPDX-License-Identifier: MIT

pragma solidity 0.8.15;

library DRVNVesting {
    function vestingSchedule(uint256 _totalAllocation, uint256 _startDate, uint256 _timestamp) internal pure returns (uint256) {
        uint256 start = _startDate + 360 days;
        uint256 duration = 360 days;
        if (_timestamp < start) {
            return 0;
        } else if (_timestamp > start + duration) {
            return _totalAllocation;
        } else {
            return _totalAllocation / 2 + (_totalAllocation * (_timestamp - start)) / (2 * duration);
        }
    }
}
