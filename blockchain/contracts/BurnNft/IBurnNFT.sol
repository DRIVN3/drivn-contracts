// SPDX-License-Identifier: MIT
pragma solidity 0.8.15;

/**
    interface for EarnNFT
*/

interface IBurnNFT {

    /**
     * @dev minting the token on certain address
     * @param account address of mint receiver
     * @param tokenId token
    */

    function mint(address account, uint256 tokenId) external;

    /**
     * @dev gets the ownerOf certain tokenId
     * @param tokenId id of token
    */

    function ownerOf(uint256 tokenId) external view returns(address);

    /**
     * @dev Returns the number of tokens in ``owner``'s account.
    */
    
    function balanceOf(address owner) external view returns (uint256 balance);

}