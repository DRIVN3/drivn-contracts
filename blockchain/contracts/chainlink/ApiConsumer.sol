// SPDX-License-Identifier: MIT
pragma solidity 0.8.15;

import '@chainlink/contracts/src/v0.8/ChainlinkClient.sol';
import '@chainlink/contracts/src/v0.8/ConfirmedOwner.sol';
import "@openzeppelin/contracts/utils/Strings.sol";

interface IManagement {
    function generateCallBack(uint256 tokenId, uint256 amount) external;
}

contract ApiConsumer is ChainlinkClient, ConfirmedOwner {
    using Chainlink for Chainlink.Request;

    bytes32 private jobId;
    uint256 private fee;
    string public url;

    IManagement public management;

    event RequestMultipleFulfilled(bytes32 indexed requestId, uint256 _volume, uint256 _tokenId);

    /**
     * @dev Initialize the link token and target oracle
     * @param earnNFTManagementAddress_ Eanr nft address to get callback
     * @param url_ get url
    */
    constructor(address earnNFTManagementAddress_, string memory url_) ConfirmedOwner(msg.sender) {
        setChainlinkToken(0x326C977E6efc84E512bB9C30f76E30c160eD06FB);
        setChainlinkOracle(0xedaa6962Cf1368a92e244DdC11aaC49c0A0acC37);
        jobId = 'd3439590d6b047a38f1cd984154b1c0e';
        fee = 0;
        management = IManagement(earnNFTManagementAddress_);
        url = url_;
    }

    /**
     * Create a Chainlink request to retrieve API response, find the target
     */
    function requestData(uint256 tokenId_) public returns (bytes32 requestId) {
        Chainlink.Request memory req = buildChainlinkRequest(jobId, address(this), this.fulfillMultipleParameters.selector);

        // Set the path to find the desired data in the API response, where the response format is:
        // {
        //     "GTT": 3
        // }        

        // Set the URL to perform the GET request on
        req.add('get', string.concat(url, Strings.toString(tokenId_)));

        req.add('path1', 'GTT'); 
        req.add('path2', 'tokenId'); 

        int256 timesAmount = 1;
        req.addInt('times', timesAmount);

        // Sends the request
        return sendOperatorRequest(req, fee);
    }

    /**
     * @notice Fulfillment function for multiple parameters in a single request
     * @dev This is called by the oracle. recordChainlinkFulfillment must be used.
     */
    function fulfillMultipleParameters(bytes32 _requestId, uint256 _volume, uint256 _tokenId) public recordChainlinkFulfillment(_requestId) {
        emit RequestMultipleFulfilled(_requestId, _volume, _tokenId);
        management.generateCallBack(_tokenId, _volume);
    }

    /**
     * Allow withdraw of Link tokens from the contract
     */
    function withdrawLink() public onlyOwner {
        LinkTokenInterface link = LinkTokenInterface(chainlinkTokenAddress());
        require(link.transfer(msg.sender, link.balanceOf(address(this))), 'Unable to transfer');
    }
}
