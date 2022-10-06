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

    // transaction fee (multiplied on 1000)
    uint256 public feePercentage;

    // fee multiplier
    uint256 public constant feeMultiplier = 1000;

    /**
     * @dev Constructing the contract
    */

    constructor(
        string memory name_, 
        string memory symbol_,
        uint256 feePercentage_
    )
    ERC20(name_, symbol_)
    {
        feePercentage = feePercentage_;
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
     * @dev setting receipent address
     * @param recipient_ receipent address
    */
    
    function setRecipient(address recipient_) external onlyOwner {
        recipient = recipient_;
    }

    /**
     * @dev setting feePercentage
     * @param feePercentage_ receipent address
    */
    
    function setFeePercentage(uint256 feePercentage_) external onlyOwner {
        feePercentage = feePercentage_;
    }
    
    /**
     * @dev ERC20 transfer override. checking if sender or to addresess are in liquidity.
    */

    function transfer(address to, uint256 amount) public virtual override returns (bool) {
        address owner = _msgSender();

        if (isLiquidity[owner] || isLiquidity[to]) {
            require(recipient != address(0), "DRVNERC20Extension: zero recipient address");
            uint256 fee = amount * feePercentage / feeMultiplier;
            amount = amount * (feeMultiplier-feePercentage) / feeMultiplier;
            _transfer(owner, recipient, fee);
        }

        _transfer(owner, to, amount);
        return true;
    }

    /**
     * @dev ERC20 transferFrom override. checking if sender or to addresess are in liquidity.
    */

    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) public virtual override returns (bool) {
        address spender = _msgSender();
        _spendAllowance(from, spender, amount);
       
        if (isLiquidity[from] || isLiquidity[to]) {
            require(recipient != address(0), "DRVNERC20Extension: zero recipient address");
            uint256 fee = amount * feePercentage / feeMultiplier;
            amount = amount * (feeMultiplier-feePercentage) / feeMultiplier;
            _transfer(from, recipient, fee);
        }

        _transfer(from, to, amount);
        return true;
    }

}
