// SPDX-License-Identifier: MIT

pragma solidity 0.8.15;

import "@openzeppelin/contracts/access/Ownable.sol";

import "./DRVNVesting.sol";


contract PrivateSales is Ownable {

    // DRVN token
    IERC20 public immutable token;

    // coin price
    uint256 public constant coinPrice = 0.01 ether;

    // private sale enable flag
    bool public privateSalesEnabled;

    // mapping between address and it's created VestingContracts contracts
    mapping(address => address[]) public vestingWallets;

    // mapping for allowed addresses
    mapping(address=>bool) public isAllowed;

    constructor(address token_)  {
        token = IERC20(token_);
    }

    /** 
     * @dev setting privateSalesEnabled variable
     * @param enabled boolean True if enables, False otherwise
    */

    function setPrivateSalesEnabled(bool enabled) external onlyOwner {
        privateSalesEnabled = enabled;
    }

    /** 
     * @dev setting allowed addresses
     * @param allowed boolean True if enables, False otherwise
    */

    function setAllowed(address[] calldata addresses, bool allowed) public onlyOwner {
        for (uint256 i = 0; i < addresses.length; ++i) {
            isAllowed[addresses[i]] = allowed;
        }
    }

    /**
     * @dev modifier to detect if address is allowed for buying coins
    */
    modifier whenAllowed() {
        require(isAllowed[msg.sender], "PrivateSales: address is not allowed to call this function");
        _;
    }

    /**
     * @dev createVestWallet function will crete the VestWallet
     * @param beneficiaryAddress is a address of the beneficiary
     * @param durationDays duration of vesting in days after it starts
     * @param amount amount of coins
    */

    function _createVestWallet(
        address beneficiaryAddress,
        uint64 durationDays,
        uint256 amount
    ) internal {

        uint64 durationSeconds = durationDays;

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
     * @dev Buy the coins in private Coins supply. Checks current prive of BNB to USD and buy the coins properly
    */

    function buy() external payable whenAllowed {
        require(privateSalesEnabled, "PrivateSales: sale is not enabled");
        require(msg.value > 0, "PrivateSales: should not be zero amount");
        
        uint256 amount = msg.value * 10 ** 18 / coinPrice;
        _createVestWallet(msg.sender, 360 days, amount);
    }

    /**
     * @dev withdraw the amount of coins from contract address to owner
    */

    function withdraw() external onlyOwner {
        (bool success,) = payable(owner()).call{value : address(this).balance}("");
        require(success, "PrivateSales: unsuccessful withdraw");
    }
}
