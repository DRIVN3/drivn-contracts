// SPDX-License-Identifier: MIT
pragma solidity 0.8.15;


import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "../GTT.sol";

// enum for electic vehicle
enum EType { CAR, BICYCLE, SCOOTER }

// struct NFT information
struct NFTInformation {
    EType vehicle;
    uint256 lastUsage;
    uint256 powerLeft;
    uint256 maxPower;
}

contract BurnNFT is ERC721, Ownable {

    using Counters for Counters.Counter;

    /**
     * @dev Emitted when mint method is called
     */
    event Mint(address indexed sender, EType indexed vehicle, uint256 indexed tokenId);

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

    // power of burn nft
    uint256 public burnNFTPower;

    // mapping for nft earning gap
    mapping(EType=>uint256) public vehicleGTTGap;

    // max car possible supply
    uint256 public constant maxCarSupply = 700;

    // max bicycle possible supply
    uint256 public constant maxBicycleSupply = 100;

    // max scooter possible supply
    uint256 public constant maxScooterSupply = 200;

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

    // mapping for nft-vehicle movement
    mapping(uint256 => uint256) public nftPowerUsed;

    // mapping for GTT claimed
    mapping(uint256 => uint256) public nftPowerClaimed;

    // gtt burn wallet
    address public burnWalletAddress;

    // gtt coin
    IGTT public gttCoin;

    /**
     * @dev Sets main dependencies and constants
     * @param name_ 721A nft name
     * @param symbol_ 721A nft symbol
     * @param baseURI baseUri for mint
    */

    constructor(string memory name_, 
        string memory symbol_, 
        string memory baseURI,
        address gttAddress_,
        address burnWalletAddress_
    ) 
    ERC721(name_, symbol_){
        setBaseURI(baseURI);

        // define nft GTT earning gap
        vehicleGTTGap[EType.CAR] = 4 * 10 ** 18;
        vehicleGTTGap[EType.SCOOTER] = 9 * 10 ** 18 / 2;
        vehicleGTTGap[EType.BICYCLE] = 5 * 10 ** 18;

        burnNFTPower = 1 * powerMultiplier();

        burnWalletAddress = burnWalletAddress_;
        gttCoin = IGTT(gttAddress_);
    }


    /**
     * @dev modifier to detect if address is allowed for specific operation
    */

    modifier whenAlloed() {
        require(isAllowed[msg.sender], "BurnNFT: address is not allowed to call this function");
        _;
    }

    /**
     * @dev buying the token
     * @param vehicle vehicle type
    */

    function mint(EType vehicle) external payable {

        if (vehicle == EType.CAR) {
            _carCounter.increment();
            uint256 carCount = _carCounter.current();
            require(commonTokenCarPrice == msg.value, "BurnNFT: not enough money");
            require(carCount <= maxCarSupply, "BurnNFT: can't mint, max car supply reached");
        }
        
        if (vehicle == EType.BICYCLE) {
            _bicycleCounter.increment();
            uint256 _bicycleCount = _bicycleCounter.current();
            require(commonTokenBicyclePrice == msg.value, "BurnNFT: not enough money");
            require(_bicycleCount <= maxBicycleSupply, "BurnNFT: can't mint, max bicycle supply reached");
        }

        if (vehicle == EType.SCOOTER) {
            _scooterCounter.increment();
            uint256 _scooterCount = _scooterCounter.current();
            require(commonTokenScooterPrice == msg.value, "BurnNFT: not enough money");
            require(_scooterCount <= maxScooterSupply, "BurnNFT: can't mint, max scooter supply reached");
        }

        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();
        _mint(msg.sender, tokenId);

        nftInfo[tokenId] = NFTInformation(
            vehicle, // EVehile
            0, // last usage
            burnNFTPower, // powerLeft
            burnNFTPower // max power,
        );

        emit Mint(msg.sender, vehicle, tokenId);
    }

    /**
     * @dev setting allowed addresses for nft usage
     * @param addresses array of counts of allowed addresses
     * @param allowed True/False bool for enable certain operations
    */
    
    function setAllowed(address[] calldata addresses, bool allowed) external onlyOwner {
        for (uint256 i = 0; i < addresses.length; ++i) {
            isAllowed[addresses[i]] = allowed;
        }
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
        uint256 replenishPower = nftInfo[tokenId].powerLeft + (block.timestamp - nftInfo[tokenId].lastUsage) * maxPower / 86400;
        replenishPower =  replenishPower <= maxPower ? replenishPower : maxPower;
        return replenishPower;
    }
    
    /**
     * @dev updates the vehicle traffic
     * @param tokenId nft token id
    */ 

    function generate(uint256 tokenId, uint256 durationSeconds) external {
        uint256 currentPower = calculatePower(tokenId);
        require(currentPower >= durationSeconds, "BurnNFT: durationSeconds exceeds current power's limit");

        currentPower = currentPower - durationSeconds;
        nftInfo[tokenId].powerLeft = currentPower;
        nftInfo[tokenId].lastUsage = block.timestamp;

        nftPowerUsed[tokenId] += durationSeconds;
    }

    /**
     * @dev burning GTT tokens, transfering earning coins into burn wallet
     * @param tokenId nft token id
    */ 

    function burn(uint256 tokenId) external {
        require(ownerOf(tokenId) == msg.sender, "BurnNFT: sender is not the owner of the token");

        uint256 earningGap = vehicleGTTGap[nftInfo[tokenId].vehicle];
        uint256 earned = (nftPowerUsed[tokenId] - nftPowerClaimed[tokenId]) * earningGap / 900;
        nftPowerClaimed[tokenId] = nftPowerUsed[tokenId];

        gttCoin.mint(burnWalletAddress, earned);
    }

}
