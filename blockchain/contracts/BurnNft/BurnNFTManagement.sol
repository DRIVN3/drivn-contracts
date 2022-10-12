// SPDX-License-Identifier: MIT
pragma solidity 0.8.15;

import "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

import "../chainlink/ApiConsumer.sol";
import "./IBurnNFT.sol";

// enum for electic vehicle
enum EType { CAR, BICYCLE, SCOOTER }

// struct NFT information
struct NFTInformation {
    EType eType;
    uint256 score;
}

contract BurnNFTManagement is Initializable, ContextUpgradeable, OwnableUpgradeable  {
    using Counters for Counters.Counter;

    // token counter
    Counters.Counter public burnNFTCounter;

    // max supply 
    uint256 public maxBurnNFTSupply;

    // mapping for nft information
    mapping(uint256=>NFTInformation) public nftInfo;

    // burn nft instance
    IBurnNFT public burnNFT;
    
    // api consumer
    ApiConsumer public apiConsumer;

    /**
     * @dev Emitted when mint method is called
     */
    event Mint(address indexed sender, uint256 indexed tokenId);

    /**
     * @dev Emitted when mint method is called
     */
    event Burn(address indexed sender, uint256 indexed tokenId, uint256 indexed amount);

    /** 
     * @dev Sets main dependencies and constants
     * @param burnNFTAddress_ ERC721 contract address
     * @param url url of backend endpoint
    */

    function initialize(
        address burnNFTAddress_,
        string memory url
    )
    public initializer 
    {
        __Context_init();
        __Ownable_init();

        burnNFT = IBurnNFT(burnNFTAddress_);

        // setting max burn nft supply
        maxBurnNFTSupply = 1000;

        apiConsumer = new ApiConsumer(address(this), url);
    }


    /**
     * @dev buying the token
    */

    function mint(EType eType) external {
        require(burnNFT.balanceOf(msg.sender) == 0, "BurnNFTManagement: you have already minted once");
        
        burnNFTCounter.increment();
        uint256 burnNFTCount = burnNFTCounter.current();
        
        require(burnNFTCount < maxBurnNFTSupply, "BurnNFTManagement: max supply reached");

        uint256 tokenId = burnNFT.mint(msg.sender);
        
        nftInfo[tokenId] = NFTInformation(
            eType, // EVehile
            0 // score
        );

        emit Mint(msg.sender, tokenId);
    }

    /**
     * @dev setting maxBurnNftSupply
     * @param maxBurnNFTSupply_ car supply
    */
    
    function setMaxBurnNFTSupply(uint256 maxBurnNFTSupply_) external onlyOwner {
        maxBurnNFTSupply = maxBurnNFTSupply_;
    }
    
    /**
     * @dev updates the vehicle traffic
     * @param tokenId nft token id
    */ 

    function generate(uint256 tokenId) external {
        apiConsumer.requestData(tokenId);
    }

    /** 
     * @dev callback for Api Consumer
     * @param tokenId id of token
     * @param amount amount of coins
    */

    function generateCallBack(uint256 tokenId, uint256 amount) external {
        require(
            msg.sender == address(apiConsumer) || msg.sender == owner(), 
            "BurnNFTManagement: sender is not earn api consumer client"
        );

        nftInfo[tokenId].score = amount;
    }

}