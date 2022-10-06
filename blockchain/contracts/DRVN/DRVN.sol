// SPDX-License-Identifier: MIT

pragma solidity 0.8.15;

import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";

import "../extension/DRVNERC20Extension.sol";
import "./DRVNVesting.sol";

contract DRVNCoin is DRVNERC20Extension, ERC20Permit, ERC20Votes, Pausable {
    using Address for address;

    // start coins
    uint256 public constant startCoins = 5_000_000_000 * 10**18;

    // supply for (Team, Advisors, Liquidity and etc.)
    mapping(string => uint256) public supplyData;

    // mapping for supplyName and vesting contract
    mapping(string => address) public vestingContracts;

    /**
     * @dev Constructing the contract minting 5000000000 coin to the contract address and setting name, symbol
    */

    constructor(
        string memory name_, 
        string memory symbol_,
        uint256 feePercentage_
    )
    DRVNERC20Extension(name_, symbol_, feePercentage_)
    ERC20Permit(symbol_)
    {

        // minting starting coins
        _mint(address(this), startCoins);

        // initializing supplys

        supplyData["Private"] = 375_000_000 * 10 ** decimals();
        supplyData["PreSale"] = 825_000_000 * 10 ** decimals();
        supplyData["Team"] = 675_000_000 * 10 ** decimals();
        supplyData["Advisors"] = 250_000_000 * 10 ** decimals();
        supplyData["Travel Sustainable & Earn"] = 1_000_000_000 * 10 ** decimals();
        supplyData["Ecosystem / Treasury"] = 1_000_000_000 * 10 ** decimals();
        supplyData["Dex Liquidity"] = 375_000_000 * 10 ** decimals();
        supplyData["Holdback"] = 500_000_000 * 10 ** decimals();
    }

    /**
     * @dev sending the supply proper contract like: Team, Advisors and etc.
     * @param supplyName name of the supply which should be given the contract address
     * @param supplyAddress address of supply 
     * @param vest switch for creating vesting wallet or not for this supply
    */

    function sendTokens(string calldata supplyName, address supplyAddress, bool vest) external onlyOwner {
        require(supplyAddress != address(0), "DRVN: supplyAddress should not be zero");
        uint256 supply = supplyData[supplyName];
        require(supply > 0, "DRVN: not eligible");
        supplyData[supplyName] = 0;
        
        if (vest) {
            // creating vesting wallet contract
            VestingContract vestingWallet = new VestingContract(
                supplyAddress, 
                block.timestamp + 360 days,
                360 days, 
                address(this)
            );
            vestingContracts[supplyName] = address(vestingWallet);
            _transfer(address(this), address(vestingWallet), supply);
            return;
        }
    
        _transfer(address(this), supplyAddress, supply);
    }


    /**
     * @dev pausing the contract, where transfers or minting will be retricted
    */

    function pause() public onlyOwner {
        _pause();
    }

    /**
     * @dev unpausing the contract, where transfers or minting will be possible
    */

    function unpause() public onlyOwner {
        _unpause();
    }

    /**
     * @dev overriding before token transfer from ERC20 contract, adding whenNotPaused modifier to restrict transfers while paused.
    */
    function _beforeTokenTransfer(address from, address to, uint256 amount)
    internal
    whenNotPaused
    override
    {
        super._beforeTokenTransfer(from, to, amount);
    }

    /**
     * @dev overriding after token transfer from ERC20 contract.
    */

    function _afterTokenTransfer(address from, address to, uint256 amount)
        internal
        override(ERC20, ERC20Votes)
    {
        super._afterTokenTransfer(from, to, amount);
    }

    /**
     * @dev overriding _mint function.
    */

    function _mint(address to, uint256 amount)
        internal
        override(ERC20, ERC20Votes)
    {
        super._mint(to, amount);
    }

    /**
     * @dev overriding _burn function.
    */

    function _burn(address account, uint256 amount)
        internal
        override(ERC20, ERC20Votes)
    {
        super._burn(account, amount);
    }

    /**
     * @dev overriding transfer function.
    */

    function transfer(address to, uint256 amount) 
    public 
    override(ERC20, DRVNERC20Extension)
    returns (bool)
    {
        return super.transfer(to, amount);
    }

    function transferFrom(
            address from,
            address to,
            uint256 amount
    ) 
    public 
    override(ERC20, DRVNERC20Extension) 
    returns (bool) {
            super.transferFrom(from, to, amount);
    }
}
