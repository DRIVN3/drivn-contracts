// SPDX-License-Identifier: MIT
pragma solidity 0.8.15;


import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "../GTT.sol";

// enum for electic vehicle
enum EType { CAR, BICYCLE, SCOOTER }

// struct NFT information
struct NFTInformation {
    EType eType;
    uint256 lastUsage;
    uint256 powerLeft;
    uint256 maxPower;
}

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

    // max supply 
    uint256 public constant maxBurnNftSupply = 1000;

    // token counter
    Counters.Counter private _tokenIdCounter;

    // burn power
    uint256 public constant burnPower = 900;

    // nft traffic score
    mapping(uint256 => uint256) public nftScore;

    // mapping for nft information
    mapping(uint256=>NFTInformation) public nftInfo;

    // mapping for allowed addresses
    mapping(address=>bool) public isAllowed;

    // mapping for nft earning gap
    mapping(EType=>uint256) public vehicleGTTGap;

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

        // define nft GTT earning gap
        vehicleGTTGap[EType.CAR] = 4 * 10 ** 18;
        vehicleGTTGap[EType.SCOOTER] = 9 * 10 ** 18 / 2;
        vehicleGTTGap[EType.BICYCLE] = 5 * 10 ** 18;
    }


    /**
     * @dev buying the token
    */

    function mint(EType eType) external payable {

        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();
        require(tokenId <= maxBurnNftSupply, "BurnNFT: can't mint, max burn nft supply reached");

        _mint(msg.sender, tokenId);
        
        nftInfo[tokenId] = NFTInformation(
            eType, // EVehile
            0, // last usage
            burnPower, // powerLeft
            burnPower // max power,
        );

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


    /**
     * @dev updates the vehicle traffic
     * @param tokenId nft token id
     * @param durationSeconds movement durations in seconds
    */ 

    function generate(uint256 tokenId, uint256 durationSeconds) external whenAllowed {
        uint256 currentPower = calculatePower(tokenId);

        if (currentPower < durationSeconds) {
            durationSeconds = currentPower;
        }

        currentPower = currentPower - durationSeconds;
        nftInfo[tokenId].powerLeft = currentPower;
        nftInfo[tokenId].lastUsage = block.timestamp;
        
        uint256 earningGap = vehicleGTTGap[nftInfo[tokenId].eType];
        nftScore[tokenId] += durationSeconds * earningGap / 900;
    }

}
