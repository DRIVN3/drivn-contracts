// SPDX-License-Identifier: MIT
pragma solidity 0.8.15;


import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract BurnNFT is ERC721Enumerable, Ownable {
    using Counters for Counters.Counter;

    // token counter
    Counters.Counter public tokenIdCounter;

    // max supply 
    uint256 public constant maxBurnNftSupply = 1000;

    // base token URI
    string internal _baseTokenURI;

    // mapping for allowed addresses
    mapping(address=>bool) public isAllowed;

    /**
     * @dev Sets main dependencies and constants
     * @param name_ 721A nft name
     * @param symbol_ 721A nft symbol
     * @param baseURI baseUri for mint
    */

    constructor(
        string memory name_, 
        string memory symbol_, 
        string memory baseURI
    ) 
    ERC721(name_, symbol_){
        setBaseURI(baseURI);
    }


    /**
     * @dev minting the token on certain address
     * @param account address of mint receiver
    */

    function mint(address account) external whenAllowed returns (uint256) {
        tokenIdCounter.increment();
        uint256 tokenId = tokenIdCounter.current();
        
        require(tokenId < maxBurnNftSupply, "BurnNFT: max supply reached");

        _mint(account, tokenId);
        return tokenId;
    }

    /**
     * @dev Set the base URI
     * @param baseURI_ Base path to metadata
    */

    function setBaseURI(string memory baseURI_) public onlyOwner {
        _baseTokenURI = baseURI_;
    }

    /**
     * @dev Get current base uri 
    */

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }
    
    /**
     * @dev modifier to detect if address is allowed for specific operation
    */

    modifier whenAllowed() {
        require(isAllowed[msg.sender], "BurnNFT: address is not allowed to call this function");
        _;
    }

    /**
     * @dev setting allowed addresses for nft usage
     * @param allowedAddress allowed address
     * @param allowed True/False bool for enable certain operations
    */
    
    function setAllowed(address allowedAddress, bool allowed) external onlyOwner {
        isAllowed[allowedAddress] = allowed;
    }
}
