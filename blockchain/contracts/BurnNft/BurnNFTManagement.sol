// SPDX-License-Identifier: MIT
pragma solidity 0.8.15;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

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
    using ECDSA for bytes32;

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

    // burn nft price
    uint256 public burnNFTPrice;

    // signer of the message
    address public messageSigner;

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

        burnNFTPrice = 0.01 ether;

        apiConsumer = new ApiConsumer(address(this), url);
    }


    /**
     * @dev buying the token
    */

    function mint(EType eType) external payable {
        require(burnNFT.balanceOf(msg.sender) == 0, "BurnNFTManagement: you have already minted once");
        require(msg.value == burnNFTPrice, "BurnNFTManagement: not enough money");

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
     * @dev setting the message signer
     * @param messageSigner_ signer of the message
    */

    function setMessageSigner(address messageSigner_) external onlyOwner {
        messageSigner = messageSigner_;
    }

    /** 
     * @dev generating pseudo coins for burn nft
     * @param tokenId id of token
     * @param amount amount of coins
    */

    function generate(uint256 tokenId, uint256 amount, bytes memory allowSignature) external {
        bytes32 message = keccak256(abi.encodePacked(tokenId, amount));
        bytes32 hash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", message));
        address signatureAddress = hash.recover(allowSignature);
        require(signatureAddress == messageSigner, "BurnNFTManagement: invalid signature");

        nftInfo[tokenId].score = amount;
    }

    /**
     * @dev withdraw the amount of coins from contract address to owner
    */

    function withdraw() external onlyOwner {
        (bool success,) = payable(owner()).call{value : address(this).balance}("");
        require(success, "EarnNFTManagement: unsuccessful withdraw");
    }

}