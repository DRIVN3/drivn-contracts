// SPDX-License-Identifier: MIT

pragma solidity 0.8.15;

import "@openzeppelin/contracts/access/Ownable.sol";

import "./DRVNVesting.sol";


contract PublicSales is Ownable {

    // DRVN token
    IERC20 public immutable token;

    // coin price
    uint256 public constant coinPrice = 0.01 ether;

    // private sale enable flag
    bool public publicSalesEnabled;

    // mapping between address and it's created VestingContracts contracts
    mapping(address => address[]) public vestingWallets;

    constructor(address token_)  {
        token = IERC20(token_);
    }

    /** 
     * @dev setting publicSalesEnabled variable
     * @param enabled boolean True if enables, False otherwise
    */

    function setPublicSalesEnabled(bool enabled) external onlyOwner {
        publicSalesEnabled = enabled;
    }

    /**
     * @dev createVestWallet function will crete the VestWallet
     * @param beneficiaryAddress is a address of the beneficiary
     * @param durationSeconds duration of vesting in seconds after it starts
     * @param amount amount of coins
    */

    function _createVestWallet(
        address beneficiaryAddress,
        uint64 durationSeconds,
        uint256 amount
    ) internal {

        // creating vesting wallet contract
        VestingContract vestingWallet = new VestingContract(
            beneficiaryAddress, 
            block.timestamp + 360 days,
            durationSeconds, 
            address(token)
        );

        // transfer vesting amount to VestingWallet contract
        token.transfer(address(vestingWallet), amount);

        // adding created contract in this mapping
        vestingWallets[beneficiaryAddress].push(address(vestingWallet));
    }

    /**
     * @dev function gets a created VestWallet contracts for provided account
     * @param account is a address the account
    */

    function getAccountVestingWallets(address account) external view returns (address[] memory) {
        return vestingWallets[account];
    }

    /**
     * @dev Buy the coins in private Coins supply
    */

    function buy() external payable {
        require(publicSalesEnabled, "PublicSales: sale is not enabled");
        require(msg.value > 0, "PublicSales: should not be zero amount");
        
        uint256 amount = msg.value * 10 ** 18 / coinPrice;
        _createVestWallet(msg.sender, 360 days, amount);
    }

    /**
     * @dev withdraw the amount of coins from contract address to owner
    */

    function withdraw() external onlyOwner {
        (bool success,) = payable(owner()).call{value : address(this).balance}("");
        require(success, "PublicSales: unsuccessful withdraw");
    }
}
