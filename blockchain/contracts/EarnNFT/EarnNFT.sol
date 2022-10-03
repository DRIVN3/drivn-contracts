// SPDX-License-Identifier: MIT
pragma solidity 0.8.15;


import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract EarnNFT is ERC721Enumerable, Ownable {
    using Counters for Counters.Counter;

    // token counter
    Counters.Counter public tokenIdCounter;

    // max token supply
    uint256 public constant maxSupply = 10000;

    // mapping for allowed addresses
    mapping(address=>bool) public isAllowed;

    // base token URI
    string public baseTokenURI;

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
     * @dev modifier to detect if address is allowed for specific operation
    */

    modifier whenAllowed() {
        require(isAllowed[msg.sender], "EarnNFT: address is not allowed to call this function");
        _;
    }

    /**
     * @dev minting the token on certain address
    */

    function mint(address account) external whenAllowed returns (uint256) {
        tokenIdCounter.increment();
        uint256 tokenId = tokenIdCounter.current();
        
        require(tokenId < maxSupply, "EarnNFT: max supply reached");

        _mint(account, tokenId);
        return tokenId;
    }

    /**
     * @dev burning the token
     * @param tokenId id of token
    */

    function burn(uint256 tokenId) external whenAllowed {
        _burn(tokenId);
    }


    /**
     * @dev setting allowed addresses for nft usage
     * @param allowedAddress allowed address
     * @param allowed True/False bool for enable certain operations
    */
    
    function setAllowed(address allowedAddress, bool allowed) external onlyOwner {
        isAllowed[allowedAddress] = allowed;
    }


    /**
     * @dev Set the base URI
     * @param baseURI_ Base path to metadata
    */

    function setBaseURI(string memory baseURI_) public onlyOwner {
        baseTokenURI = baseURI_;
    }

    /**
     * @dev Get current base uri 
    */

    function _baseURI() internal view override returns (string memory) {
        return baseTokenURI;
    }

}
