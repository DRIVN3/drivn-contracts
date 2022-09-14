// SPDX-License-Identifier: MIT
pragma solidity 0.8.15;


import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "../GTT.sol";


contract BurnNFT is ERC721Enumerable, Ownable {

    using Counters for Counters.Counter;

    /**
     * @dev Emitted when mint method is called
     */
    event Mint(address indexed sender, uint256 indexed tokenId);

    /**
     * @dev Emitted when mint method is called
     */
    event Burn(address indexed sender, uint256 indexed tokenId, uint256 indexed amount);

    // base token URI
    string internal _baseTokenURI;

    // price of burn nft
    uint256 public constant burnNftPrice = 0.01 ether;

    // max supply 
    uint256 public constant maxBurnNftSupply = 1000;

    // token counter
    Counters.Counter private _tokenIdCounter;

    // gtt coin
    IGTT public gttCoin;

    // gtt coin
    mapping(uint256 => uint256) public nftPower;

    /**
     * @dev Sets main dependencies and constants
     * @param name_ 721A nft name
     * @param symbol_ 721A nft symbol
     * @param baseURI baseUri for mint
    */

    constructor(string memory name_, 
        string memory symbol_, 
        string memory baseURI,
        address gttAddress_
    ) 
    ERC721(name_, symbol_){
        setBaseURI(baseURI);
        gttCoin = IGTT(gttAddress_);
    }


    /**
     * @dev buying the token
    */

    function mint() external payable {

        require(burnNftPrice == msg.value, "BurnNFT: not enough money");
        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();
        require(tokenId <= maxBurnNftSupply, "BurnNFT: can't mint, max burn nft supply reached");

        _mint(msg.sender, tokenId);

        emit Mint(msg.sender, tokenId);
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
     * @dev burning GTT tokens and increases nft power
     * @param tokenId nft token id
     * @param amount amount of tokens
    */ 

    function burn(uint256 tokenId, uint256 amount) external {
        require(ownerOf(tokenId) == msg.sender, "BurnNFT: sender is not the owner of the token");

        gttCoin.transferFrom(msg.sender, address(this), amount);
        gttCoin.burn(amount);

        nftPower[tokenId] += amount;

        emit Burn(msg.sender, tokenId, amount);
    }

}
