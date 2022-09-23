// SPDX-License-Identifier: MIT

pragma solidity 0.8.15;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

import "./GTTBurnWallet.sol";

interface IGTT is IERC20 {

    /**
     * @dev burns coins on burn wallet ballance
     * @param count count of coins
    */

    function burn(uint256 count) external;

    /**
     * @dev Returns the amount of tokens in existence.
     */
    function totalSupply() external view returns (uint256);

    /**
     * @dev Returns the amount of tokens owned by `account`.
     */
    function balanceOf(address account) external view returns (uint256);

    /**
     * @dev get decimals of the coin
    */
    function decimals() external view  returns (uint8);

    /**
     * @dev minting the coins
     * @param account account to mint coins
     * @param amount_ amount of coins
    */

    function mint(address account, uint256 amount_) external;
}

contract GTT is ERC20, Ownable, Pausable {

    // burn wallet contract
    GTTBurnWallet public burnWallet;

    // start coins
    uint256 public constant startCoins = 200_000 * 10**18;

    // mapping for allowed mint addresses
    mapping(address=>bool) public isAllowedMinting;

    // mapping for allowed burn addresses
    mapping(address=>bool) public isAllowedBurn;

    /**
     * @dev Constructing the contract minting 200000 coin to the contract address and setting name, symbol
    */

    constructor(
        string memory name_, 
        string memory symbol_
    )
    ERC20(name_, symbol_)
    {

        // minting starting coins
        _mint(address(this), startCoins);

        burnWallet = new GTTBurnWallet(address(this), owner());

        // burn allowed
        isAllowedBurn[address(burnWallet)] = true;
    }

    /**
     * @dev modifier to detect the caller is the burnWallet address
    */

    modifier onlyAllowedBurn() {
        require(isAllowedBurn[msg.sender], "GTT: address does not have burn access");
        _;
    }

    /**
     * @dev modifier to detect if address is allowed minting
    */

    modifier whenAllowedMinting() {
        require(isAllowedMinting[msg.sender], "GTT: address does not have mint access");
        _;
    }

    /**
     * @dev burns coins on burn wallet ballance
     * @param count count of coins
    */

    function burn(uint256 count) external onlyAllowedBurn {
        _burn(msg.sender, count);
    }

    /**
     * @dev distribute the coins to accounts
     * @param account address of account
     * @param counts counts of coins
    */

    function distribute(address account, uint256 counts) external onlyOwner {
        require(account != address(0), "GTT: account should not be zero address");
        _transfer(address(this), account, counts);
    }

    /**
     * @dev setting allowed minting address
     * @param allowedAddress allowed address
     * @param allowed True/False bool for enable minting or not
    */
    
    function setAllowedMint(address allowedAddress, bool allowed) external onlyOwner {
        isAllowedMinting[allowedAddress] = allowed;
    }

    /**
     * @dev setting allowed burning list
     * @param addresses array of counts of allowed addresses
     * @param allowed True/False bool for enable burning or not
    */
    
    function setAllowedBurn(address addresses, bool allowed) external onlyOwner {
        isAllowedBurn[addresses] = allowed;
    }

    /**
     * @dev minting the coins
     * @param account account to mint coins
     * @param amount_ amount of coins
    */

    function mint(address account, uint256 amount_) external whenAllowedMinting {
        _mint(account, amount_);
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
