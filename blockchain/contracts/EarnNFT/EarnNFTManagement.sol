// SPDX-License-Identifier: MIT
pragma solidity 0.8.15;

import "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

import "../chainlink/ApiConsumer.sol";
import "./IEarnNFT.sol";
import "../GTT.sol";

// enum for electic vehicle
enum EType { CAR, BICYCLE, SCOOTER }

// enum for NFT type
enum Level { COMMON, UNCOMMON, RARE, EPIC }

// struct NFT information
struct NFTInformation {
    Level nftType;
    EType eType;
    uint256 powerClaimed;
}

contract EarnNFTManagement is Initializable, ContextUpgradeable, OwnableUpgradeable  {
    using Counters for Counters.Counter;

    // car token counter
    Counters.Counter public carCounter;

    // bicycle token counter
    Counters.Counter public bicycleCounter;

    // scooter token counter
    Counters.Counter public scooterCounter;

    // gtt coin
    IGTT public gttCoin;

    // gtt coin
    IEarnNFT public earnNFT;

    // mapping for nft information
    mapping(uint256=>NFTInformation) public nftInfo;

    // max car possible supply
    uint256 public maxCarSupply;

    // max bicycle possible supply
    uint256 public maxBicycleSupply;

    // max scooter possible supply
    uint256 public maxScooterSupply;

    // commong token price
    uint256 public constant commonTokenCarPrice = 0.01 ether;

    // commong token price
    uint256 public constant commonTokenBicyclePrice = 0.01 ether;

    // commong token price
    uint256 public constant commonTokenScooterPrice = 0.01 ether;

    // mapping for allowed addresses
    mapping(address=>bool) public isAllowed;

    // api consumer
    ApiConsumer public apiConsumer;

    /**
     * @dev Emitted when mint method is called
     */
    event Mint(address indexed sender, EType indexed eType, uint256 indexed tokenId);

    /**
     * @dev Emitted when merge method is called
     */
    event Merge(address indexed sender, uint256 indexed tokenId1, uint256 indexed tokenId2, uint256 newToken);


    /** 
     * @dev Sets main dependencies and constants
     * @param earnNFTAddress_ ERC721 contract address
     * @param gttAddress_ GTT ERC20 address
     * @param url url of backend endpoint
    */

    function initialize(
        address earnNFTAddress_,
        address gttAddress_,
        string memory url
    )
    public initializer 
    {
        __Context_init();
        __Ownable_init();

        gttCoin = IGTT(gttAddress_);
        earnNFT = IEarnNFT(earnNFTAddress_);

        // define initial eType supplies
        maxCarSupply = 7000;
        maxBicycleSupply = 1000;
        maxScooterSupply = 2000;

        apiConsumer = new ApiConsumer(address(this), url);
    }

    /**
     * @dev setting maxCarSupply
     * @param maxCarSupply_ car supply
    */
    
    function setMaxCarSupply(uint256 maxCarSupply_) external onlyOwner {
        maxCarSupply = maxCarSupply_;
    }

    /**
     * @dev setting maxBicycleSupply
     * @param maxBicycleSupply_ car supply
    */
    
    function setMaxBicycleSupply(uint256 maxBicycleSupply_) external onlyOwner {
        maxBicycleSupply = maxBicycleSupply_;
    }

    /**
     * @dev setting maxScooterSupply
     * @param maxScooterSupply_ car supply
    */
    
    function setMaxScooterSupply(uint256 maxScooterSupply_) external onlyOwner {
        maxScooterSupply = maxScooterSupply_;
    }

    /**
     * @dev buying the token
     * @param eType vehicle type
    */

    function mint(EType eType) external payable {

        if (eType == EType.CAR) {
            carCounter.increment();
            uint256 carCount = carCounter.current();
            require(commonTokenCarPrice == msg.value, "EarnNFTManagement: not enough money");
            require(carCount <= maxCarSupply, "EarnNFTManagement: can't mint, max car supply reached");
        }
        
        if (eType == EType.BICYCLE) {
            bicycleCounter.increment();
            uint256 _bicycleCount = bicycleCounter.current();
            require(commonTokenBicyclePrice == msg.value, "EarnNFTManagement: not enough money");
            require(_bicycleCount <= maxBicycleSupply, "EarnNFTManagement: can't mint, max bicycle supply reached");
        }

        if (eType == EType.SCOOTER) {
            scooterCounter.increment();
            uint256 _scooterCount = scooterCounter.current();
            require(commonTokenScooterPrice == msg.value, "EarnNFTManagement: not enough money");
            require(_scooterCount <= maxScooterSupply, "EarnNFTManagement: can't mint, max scooter supply reached");
        }

        uint256 tokenId = earnNFT.mint(msg.sender);

        nftInfo[tokenId] = NFTInformation(
            Level.COMMON, // nft type is common
            eType, // EVehile
            0 // power claimed
        );

        emit Mint(msg.sender, eType, tokenId);
    }

    /**
     * @dev merging two nft
     * @param tokenId1 first nft id for merging
     * @param tokenId2 second nft id for merging
    */

    function merge(uint256 tokenId1, uint256 tokenId2) external {
        require(earnNFT.ownerOf(tokenId1) == msg.sender 
                    && earnNFT.ownerOf(tokenId2) == msg.sender, 
                    "EarnNFTManagement: sender is not the owner of the tokens");
        require(nftInfo[tokenId1].eType == nftInfo[tokenId2].eType, 
            "EarnNFTManagement: EType of nft does not match");

        // calculate new nft power and level
        uint256 levelUint = uint256(nftInfo[tokenId1].nftType) + uint256(nftInfo[tokenId2].nftType) + 1;
        require(levelUint <= uint256(Level.EPIC), "EarnNFTManagement: Power is too high");

        // adding the token
        uint256 tokenId = earnNFT.mint(msg.sender);

        nftInfo[tokenId] = NFTInformation(
            Level(levelUint), // nft type is common
            nftInfo[tokenId1].eType, // vehicle
            0 // power claimed
        );

        // burning merged tokens
        earnNFT.burn(tokenId1);
        earnNFT.burn(tokenId2);

        emit Merge(msg.sender, tokenId1, tokenId2, tokenId);
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
            "EarnNFTManagement: sender is not earn api consumer client"
        );

        gttCoin.mint(earnNFT.ownerOf(tokenId), amount - nftInfo[tokenId].powerClaimed);
        nftInfo[tokenId].powerClaimed = amount;
    }

    /**
     * @dev withdraw the amount of coins from contract address to owner
    */

    function withdraw() external onlyOwner {
        (bool success,) = payable(owner()).call{value : address(this).balance}("");
        require(success, "EarnNFTManagement: unsuccessful withdraw");
    }

}