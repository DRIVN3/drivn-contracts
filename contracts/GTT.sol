// SPDX-License-Identifier: MIT

pragma solidity 0.8.15;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

interface IGTT {

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

}

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

contract GTT is ERC20, Ownable, Pausable {

    // burn wallet contract
    GTTBurnWallet public burnWallet;

    // start coins
    uint256 public constant startCoins = 200000 * 10**18;

    // mapping for allowed addresses
    mapping(address=>bool) public isAllowedMinting;

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

    }

    /**
     * @dev modifier to detect the caller is the burnWallet address
    */

    modifier onlyBurnWallet() {
        require(msg.sender == address(burnWallet), "GTT: address does not have burn access");
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

    function burn(uint256 count) external onlyBurnWallet {
        _burn(msg.sender, count);
    }

    /**
     * @dev airdrop the coins to accounts
     * @param accounts array of accounts
     * @param counts array of counts of coins
    */

    function airdrop(address[] calldata accounts, uint256[] calldata counts) external onlyOwner {
        require(accounts.length == counts.length, "GTT: invalid Data lengths mismatch");

        for (uint256 i = 0; i < accounts.length; ++i) {
            require(accounts[i] != address(0), "GTT: zero address included");
            _transfer(address(this), accounts[i], counts[i]);
        }
    }

    /**
     * @dev setting allowed list
     * @param addresses array of counts of coins
     * @param allowed True/False bool for enable minting or not
    */
    
    function setAllowed(address[] calldata addresses, bool allowed) external onlyOwner {
        for (uint256 i = 0; i < addresses.length; ++i) {
            isAllowedMinting[addresses[i]] = allowed;
        }
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
