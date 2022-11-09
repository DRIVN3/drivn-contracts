// SPDX-License-Identifier: MIT

pragma solidity 0.8.15;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/TokenTimelock.sol";

import "./DRVNVesting.sol";


contract PreSales is Ownable {

    // DRVN token
    IERC20 public immutable token;

    // coin price
    uint256 public constant coinPrice = 0.01 ether;

    // private sale enable flag
    bool public preSalesEnabled;

    // mapping between address and it's created tokenTimeLock contracts
    mapping(address => address[]) public lockContracts;

    constructor(address token_)  {
        token = IERC20(token_);
    }

    /** 
     * @dev setting preSalesEnabled variable
     * @param enabled boolean True if enables, False otherwise
    */

    function setPreSalesEnabled(bool enabled) external onlyOwner {
        preSalesEnabled = enabled;
    }

    /**
     * @dev _createTimeLock function will crete the time lock function
     * @param beneficiaryAddress is a address of the beneficiary
     * @param releaseTime release time of coins 
     * @param amount amount of coins
    */

    function _createTimeLock(
        address beneficiaryAddress,
        uint256 releaseTime,
        uint256 amount
    ) internal {

        // creating vesting wallet contract
        TokenTimelock lock = new TokenTimelock(
            token,
            beneficiaryAddress, 
            releaseTime
        );

        // transfer vesting amount to VestingWallet contract
        token.transfer(address(lock), amount);

        // adding created contract in this mapping
        lockContracts[beneficiaryAddress].push(address(lock));
    }

    /**
     * @dev function gets a created lock contracts for provided account
     * @param account is a address the account
    */

    function getAccountLockContracts(address account) external view returns (address[] memory) {
        return lockContracts[account];
    }

    /**
     * @dev Buy the coins in private Coins supply
    */

    function buy() external payable {
        require(preSalesEnabled, "PreSales: sale is not enabled");
        require(msg.value > 0, "PreSales: should not be zero amount");
        
        uint256 amount = msg.value * 10 ** 18 / coinPrice;
        _createTimeLock(msg.sender, block.timestamp + 7 days, amount);
    }

    /**
     * @dev withdraw the amount of coins from contract address to owner
    */

    function withdraw() external onlyOwner {
        (bool success,) = payable(owner()).call{value : address(this).balance}("");
        require(success, "PreSales: unsuccessful withdraw");
    }
}
