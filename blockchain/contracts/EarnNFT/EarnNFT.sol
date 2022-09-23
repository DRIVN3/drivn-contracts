// SPDX-License-Identifier: MIT
pragma solidity 0.8.15;


import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "../GTT.sol";

// enum for electic vehicle
enum EType { CAR, BICYCLE, SCOOTER }

// enum for NFT type
enum Level { COMMON, UNCOMMON, RARE, EPIC }

// struct NFT information
struct NFTInformation {
    Level nftType;
    EType eType;
    uint256 lastUsage;
    uint256 powerLeft;
    uint256 maxPower;
    uint256 powerUsed;
    uint256 powerClaimed;
}

contract EarnNFT is ERC721Enumerable, Ownable {

    using Counters for Counters.Counter;

    // token counter
    Counters.Counter public tokenIdCounter;

    // car token counter
    Counters.Counter public carCounter;

    // bicycle token counter
    Counters.Counter public bicycleCounter;

    // scooter token counter
    Counters.Counter public scooterCounter;

    // mapping for nft information
    mapping(uint256=>NFTInformation) public nftInfo;

    // mapping for nft information
    mapping(Level=>uint256) public nftTypePower;

    // mapping for nft earning gap
    mapping(EType=>uint256) public vehicleGTTGap;

    // max car possible supply
    uint256 public constant maxCarSupply = 7000;

    // max bicycle possible supply
    uint256 public constant maxBicycleSupply = 1000;

    // max scooter possible supply
    uint256 public constant maxScooterSupply = 2000;

    // base token URI
    string internal _baseTokenURI;

    // commong token price
    uint256 public commonTokenCarPrice = 0.01 ether;

    // commong token price
    uint256 public commonTokenBicyclePrice = 0.01 ether;

    // commong token price
    uint256 public commonTokenScooterPrice = 0.01 ether;

    // mapping for allowed addresses
    mapping(address=>bool) public isAllowed;

    // gtt coin
    IGTT public gttCoin;

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
     * @param name_ 721A nft name
     * @param symbol_ 721A nft symbol
     * @param baseURI baseUri for mint
    */

    constructor(string memory name_, 
    string memory symbol_, 
    string memory baseURI, 
    address gttAddress_) 
    ERC721(name_, symbol_){
        setBaseURI(baseURI);

        gttCoin = IGTT(gttAddress_);

        // define powers
        nftTypePower[Level.COMMON] = 1 * powerMultiplier();
        nftTypePower[Level.UNCOMMON] = 2 * powerMultiplier();
        nftTypePower[Level.RARE] = 3 * powerMultiplier();
        nftTypePower[Level.EPIC] = 4 * powerMultiplier();

        // define nft GTT earning gap
        vehicleGTTGap[EType.CAR] = 4 * 10 ** gttCoin.decimals();
        vehicleGTTGap[EType.SCOOTER] = 9 * 10 ** gttCoin.decimals() / 2;
        vehicleGTTGap[EType.BICYCLE] = 5 * 10 ** gttCoin.decimals();
    }


    /**
     * @dev modifier to detect if address is allowed for specific operation
    */

    modifier whenAllowed() {
        require(isAllowed[msg.sender], "EarnNFT: address is not allowed to call this function");
        _;
    }

    /**
     * @dev buying the token
     * @param eType vehicle type
    */

    function mint(EType eType) external payable {

        if (eType == EType.CAR) {
            carCounter.increment();
            uint256 carCount = carCounter.current();
            require(commonTokenCarPrice == msg.value, "EarnNFT: not enough money");
            require(carCount <= maxCarSupply, "EarnNFT: can't mint, max car supply reached");
        }
        
        if (eType == EType.BICYCLE) {
            bicycleCounter.increment();
            uint256 _bicycleCount = bicycleCounter.current();
            require(commonTokenBicyclePrice == msg.value, "EarnNFT: not enough money");
            require(_bicycleCount <= maxBicycleSupply, "EarnNFT: can't mint, max bicycle supply reached");
        }

        if (eType == EType.SCOOTER) {
            scooterCounter.increment();
            uint256 _scooterCount = scooterCounter.current();
            require(commonTokenScooterPrice == msg.value, "EarnNFT: not enough money");
            require(_scooterCount <= maxScooterSupply, "EarnNFT: can't mint, max scooter supply reached");
        }

        tokenIdCounter.increment();
        uint256 tokenId = tokenIdCounter.current();
        _mint(msg.sender, tokenId);

        nftInfo[tokenId] = NFTInformation(
            Level.COMMON, // nft type is common
            eType, // EVehile
            0, // last usage
            nftTypePower[Level.COMMON], // powerLeft
            nftTypePower[Level.COMMON], // max power,
            0, // power used
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
        require(ownerOf(tokenId1) == msg.sender 
                    && ownerOf(tokenId2) == msg.sender, 
                    "EarnNFT: sender is not the owner of the tokens");
        require(nftInfo[tokenId1].eType == nftInfo[tokenId2].eType, 
            "EarnNFT: EType of nft does not match");

        // calculate new nft power and level
        uint256 newPower = nftInfo[tokenId1].maxPower + nftInfo[tokenId2].maxPower;
        uint256 levelUint = uint256(nftInfo[tokenId1].nftType) + uint256(nftInfo[tokenId2].nftType) + 1;
        require(levelUint <= uint256(Level.EPIC), "EarnNFT: Power is too high");

        // adding the token
        tokenIdCounter.increment();
        uint256 tokenId = tokenIdCounter.current();
        _mint(msg.sender, tokenId);

        nftInfo[tokenId] = NFTInformation(
            Level(levelUint), // nft type is common
            nftInfo[tokenId1].eType, // vehicle
            0, // last usage
            newPower, // powerLeft
            newPower, // maxPower
            0, // power used
            0 // power claimed
        );

        // burning mergin tokens
        _burn(tokenId1);
        _burn(tokenId2);

        emit Merge(msg.sender, tokenId1, tokenId2, tokenId);
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
        _baseTokenURI = baseURI_;
    }

    /**
     * @dev Get current base uri 
    */

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    /**
     * @dev pure function for returning decimals of power
    */

    function powerMultiplier() public pure returns (uint256) {
        return 900;
    }

    /**
     * @dev calculates power left for given token id
     * @param tokenId nft token id
    */

    function calculatePower(uint256 tokenId) public view returns (uint256) {
        uint256 maxPower = nftInfo[tokenId].maxPower;
        uint256 replenishPower = nftInfo[tokenId].powerLeft + (block.timestamp - nftInfo[tokenId].lastUsage) * maxPower / 1 days;
        replenishPower =  replenishPower <= maxPower ? replenishPower : maxPower;
        return replenishPower;
    }
    

    /**
     * @dev gets the current claim coins amount by token
     * @param tokenId nft token id
    */ 
    
    function getClaimAmount(uint256 tokenId) public view returns(uint256) {
        NFTInformation memory tokenInfo = nftInfo[tokenId];
        uint256 earningGap = vehicleGTTGap[tokenInfo.eType];
        uint256 earned = (tokenInfo.powerUsed - tokenInfo.powerClaimed) * earningGap / 900;
        return earned;
    }


    /**
     * @dev updates the vehicle traffic
     * @param tokenId nft token id
     * @param durationSeconds movement durations in seconds
     * @param claim claims if true else not claims 
    */ 

    function generate(uint256 tokenId, uint256 durationSeconds, bool claim) external whenAllowed {
        uint256 currentPower = calculatePower(tokenId);

        if (currentPower < durationSeconds) {
            durationSeconds = currentPower;
        }

        NFTInformation storage tokenInfo = nftInfo[tokenId];
        currentPower = currentPower - durationSeconds;
        tokenInfo.powerLeft = currentPower;
        tokenInfo.lastUsage = block.timestamp;

        tokenInfo.powerUsed += durationSeconds;

        if (claim) {
            _claimGeneratedCoins(tokenId);
        }
    }

    /**
     * @dev claiming GTT tokens
     * @param tokenId nft token id
    */ 

    function claimGeneratedCoins(uint256 tokenId) external {
        require(ownerOf(tokenId) == msg.sender, "EarnNFT: sender is not the owner of the token");
        _claimGeneratedCoins(tokenId);
    }

    /**
     * @dev internal claiming GTT tokens
     * @param tokenId nft token id
    */ 

    function _claimGeneratedCoins(uint256 tokenId) internal {
        uint256 earned = getClaimAmount(tokenId);
        nftInfo[tokenId].powerClaimed = nftInfo[tokenId].powerUsed;
        gttCoin.mint(ownerOf(tokenId), earned);
    }

}
