// SPDX-License-Identifier: MIT

pragma solidity 0.8.15;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Address.sol";

contract DRVNCoin is ERC20, Ownable, Pausable {
    using Address for address;

    // start coins
    uint256 public constant startCoins = 5_000_000_000 * 10**18;

    // supply for (Team, Advisors, Liquidity and etc.)
    mapping(string => uint256) public supplyData;

    /**
     * @dev Constructing the contract minting 5000000000 coin to the contract address and setting name, symbol
    */

    constructor(
        string memory name_, 
        string memory symbol_
    )
    ERC20(name_, symbol_)
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
     * @param contractAddress_ address of contract 
    */

    function sendTokens(string memory supplyName, address contractAddress_) external onlyOwner {
        require(contractAddress_.isContract(), "DRVN: contractAddress_ is not a contract");

        uint256 supply = supplyData[supplyName];
        require(supply > 0, "DRVN: not eligible");
        _transfer(address(this), contractAddress_, supply);
        supplyData[supplyName] = 0;
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
}
