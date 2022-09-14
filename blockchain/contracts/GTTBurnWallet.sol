// SPDX-License-Identifier: MIT

pragma solidity 0.8.15;

import "@openzeppelin/contracts/access/Ownable.sol";

import "./GTT.sol";

contract GTTBurnWallet is Ownable {
    
    // GTT token
    IGTT immutable token;

    /**
        * @dev Constructing the GTTBurnWallet contract
        * @param owner_ address of owner
    */

    constructor(
        address GTT_,
        address owner_
    )
    {
        _transferOwnership(owner_);
        token = IGTT(GTT_);
    }

    /**
     * @dev burning GTT coins
    */

    function burn() external onlyOwner {
        uint256 toBurn = token.balanceOf(address(this));
        token.burn(toBurn);
    }
}
