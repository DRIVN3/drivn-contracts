// SPDX-License-Identifier: MIT

pragma solidity 0.8.15;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


contract DRVNERC20Extension is ERC20, Ownable {
    
    // mapping for allowed burn addresses
    mapping(address=>bool) public isLiquidity;    

    // address where all fee's are transferred
    address public recipient;
    
    /**
     * @dev Constructing the contract
    */

    constructor(
        string memory name_, 
        string memory symbol_
    )
    ERC20(name_, symbol_)
    {
    }


    /**
     * @dev setting LP address
     * @param liquidityAddress contract from LP 
     * @param value True/False bool for checking LP address
    */
    
    function setLiquidityAddress(address liquidityAddress, bool value) external onlyOwner {
        isLiquidity[liquidityAddress] = value;
    }

    /**
     * @dev receipent address
     * @param recipient_ receipent address
    */
    
    function setRecipient(address recipient_) external onlyOwner {
        recipient = recipient_;
    }
    
    /**
     * @dev ERC20 transfer override. checking if sender or to addresess are in liquidity.
    */

    function transfer(address to, uint256 amount) public virtual override returns (bool) {
        address owner = _msgSender();

        if (isLiquidity[owner] || isLiquidity[to]) {
            require(recipient != address(0), "DRVNERC20Extension: zero recipient address");
            uint256 fee = amount * 5 / 100;
            amount = amount * 95 / 100;
            _transfer(owner, recipient, fee);
        }

        _transfer(owner, to, amount);
        return true;
    }

}
