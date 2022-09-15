// SPDX-License-Identifier: MIT

pragma solidity 0.8.15;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DRVNLiquidity is Ownable {
    
    // drvn coin
    IERC20 public immutable drvnCoin;
    
    constructor(address drvnCoinAddress_) {
        drvnCoin = IERC20(drvnCoinAddress_);
    }

    /**
     * @dev airdroping coins to liquidity pool creator address
     * @param account address of creator
     * @param amount amount of coins
    */

    function distribute(address account, uint256 amount) external onlyOwner {
        drvnCoin.transfer(account, amount);
    }

}
