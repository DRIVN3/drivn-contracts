// SPDX-License-Identifier: MIT
pragma solidity 0.8.15;


import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

// enum for electic vehicle
enum EVehicle { CAR, BICYCLE, SCOOTER }

// enum for NFT type
enum Type { COMMON, UNCOMMON, RARE, EPIC }

// struct NFT information
struct NFTInformation {
    Type nftType;
    EVehicle vehicle;
    uint256 lastUsage;
    uint256 powerLeft;
    uint256 maxPower;
}

contract EarnNFT is ERC721, Ownable {

    using Counters for Counters.Counter;

    /**
     * @dev Emitted when mint method is called
     */
    event Mint(EVehicle vehicle);

    /**
     * @dev Emitted when merge method is called
     */
    event Merge(uint256 tokenId1, uint256 tokenId2);

    // token counter
    Counters.Counter private _tokenIdCounter;

    // car token counter
    Counters.Counter private _carCounter;

    // bicycle token counter
    Counters.Counter private _bicycleCounter;

    // scooter token counter
    Counters.Counter private _scooterCounter;

    // mapping for nft information
    mapping(uint256=>NFTInformation) public nftInfo;

    // mapping for nft information
    mapping(Type=>uint256) public nftTypePower;

    // max car possible supply
    uint256 public constant maxCarSupply = 10000;

    // max bicycle possible supply
    uint256 public constant maxBicycleSupply = 10000;

    // max scooter possible supply
    uint256 public constant maxScooterSupply = 10000;

    // base token URI
    string internal _baseTokenURI;

    // commong token price
    uint256 public commonTokenCarPrice = 0.01 ether;

    // commong token price
    uint256 public commonTokenBicyclePrice = 0.01 ether;

    // commong token price
    uint256 public commonTokenScooterPrice = 0.01 ether;


    /**
     * @dev Sets main dependencies and constants
     * @param name_ 721A nft name
     * @param symbol_ 721A nft symbol
     * @param baseURI baseUri for mint
    */

    constructor(string memory name_, string memory symbol_, string memory baseURI) 
    ERC721(name_, symbol_){
        setBaseURI(baseURI);

        // define powers
        nftTypePower[Type.COMMON] = 1 * powerMultiplier();
        nftTypePower[Type.UNCOMMON] = 2 * powerMultiplier();
        nftTypePower[Type.RARE] = 3 * powerMultiplier();
        nftTypePower[Type.EPIC] = 4 * powerMultiplier();
    }

    /**
     * @dev buying the token
    */

    function mint(EVehicle vehicle) external payable {

        if (vehicle == EVehicle.CAR) {
            _carCounter.increment();
            uint256 carCount = _carCounter.current();
            require(commonTokenCarPrice == msg.value, "EarnNFT: not enough money");
            require(carCount < maxCarSupply, "EarnNFT: can't mint, max car supply reached");
        }
        
        if (vehicle == EVehicle.BICYCLE) {
            _bicycleCounter.increment();
            uint256 _bicycleCount = _bicycleCounter.current();
            require(commonTokenBicyclePrice == msg.value, "EarnNFT: not enough money");
            require(_bicycleCount < maxBicycleSupply, "EarnNFT: can't mint, max bicycle supply reached");
        }

        if (vehicle == EVehicle.SCOOTER) {
            _scooterCounter.increment();
            uint256 _scooterCount = _scooterCounter.current();
            require(commonTokenScooterPrice == msg.value, "EarnNFT: not enough money");
            require(_scooterCount < maxScooterSupply, "EarnNFT: can't mint, max scooter supply reached");
        }

        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();
        _mint(msg.sender, tokenId);

        nftInfo[tokenId] = NFTInformation(
            Type.COMMON, // nft type is common
            vehicle, // EVehile
            0, // last usage
            nftTypePower[Type.COMMON], // powerLeft
            nftTypePower[Type.COMMON] // max power
        );

        emit Mint(vehicle);
    }

    /**
     * @dev merging two nft
     * @param tokenId1 first nft id for merging
     * @param tokenId2 second nft id for merging
    */

    function merge(uint256 tokenId1, uint256 tokenId2) external {
        require(ownerOf(tokenId1) == msg.sender 
                    && ownerOf(tokenId2) == msg.sender, 
                    "EarnNFT: sender is not the owner of the tokens");
        require(nftInfo[tokenId1].vehicle == nftInfo[tokenId2].vehicle, 
            "EarnNFT: type of EVehicle does not match");

        uint256 newPower = nftInfo[tokenId1].maxPower + nftInfo[tokenId2].maxPower;
        Type nftType = getTypeByPower(newPower);    

        // adding the token
        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();
        _mint(msg.sender, tokenId);

        nftInfo[tokenId] = NFTInformation(
            nftType, // nft type is common
            nftInfo[tokenId1].vehicle, // vehicle
            0, // last usage
            newPower, // powerLeft
            newPower // maxPower
        );

        // burning mergin tokens
        _burn(tokenId1);
        _burn(tokenId2);

        emit Merge(tokenId1, tokenId2);
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
        @dev pure function for returning decimals of power
    */

    function powerMultiplier() public pure returns (uint256) {
        return 3600;
    }

    /**
        @dev pure function for returning type by power
    */

    function getTypeByPower(uint256 power) public pure returns (Type) {
        require(power <= 4 * powerMultiplier(), "EarnNFT: Power is too high");
        if (power == 1 * powerMultiplier())
            return Type.COMMON;  
        if (power == 2 * powerMultiplier()) 
            return Type.UNCOMMON;
        if (power == 3 * powerMultiplier())
            return Type.RARE;
        if (power == 4 * powerMultiplier())
            return Type.EPIC;
    }

}
