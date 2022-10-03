// SPDX-License-Identifier: MIT
pragma solidity 0.8.15;

/**
    interface for EarnNFT
*/

interface IEarnNFT {

    /**
     * @dev minting the token on certain address
     * @param account address of mint receiver
    */
    function mint(address account) external returns (uint256);

    /**
     * @dev burning the token
     * @param tokenId id of token
    */
    function burn(uint256 tokenId) external;

    /**
     * @dev gets the ownerOf certain tokenId
     * @param tokenId id of token
    */
    function ownerOf(uint256 tokenId) external view returns(address);

}