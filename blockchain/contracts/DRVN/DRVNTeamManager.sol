// SPDX-License-Identifier: MIT

pragma solidity 0.8.15;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./DRVN.sol";
import "./DRVNVesting.sol";

contract DRVNTeamManager is Ownable {
    
    // drvn coin
    IERC20 public immutable drvnCoin;
    
    // team wallet address
    address public teamWallet;

    // wallet frozen flag
    bool public teamWalletFrozen = false;

    // released coins
    uint256 public teamReleased;
    
    // deployment contract startdate
    uint256 public startDate;

    // team total supply
    uint256 public constant teamSupply = 675000000 * 10 ** 18;

    /**
     * @dev Constructing the team manager Contract
    */

    constructor(address drvnCoinAddress_) {
        drvnCoin = IERC20(drvnCoinAddress_);
        startDate = block.timestamp;
    }

    /**
     * @dev setting the team wallet address
     * @param teamWalletAddress address of team wallet
    */

    function setTeamWallet(address teamWalletAddress) external onlyOwner {
        teamWallet = teamWalletAddress;
    }

    /**
     * @dev get available releasable amount
    */

    function teamReleasableAmount() public view returns (uint256) {
        return DRVNVesting.vestingSchedule(teamSupply, startDate + 360 days, 360 days, block.timestamp) - teamReleased;
    }

    /**
     * @dev release coins for team wallet
    */

    function release() external onlyOwner {
        require(teamWallet != address(0), "TeamManager: team address not set");
        uint256 amount = teamReleasableAmount();
        drvnCoin.transfer(teamWallet, amount);
        teamReleased += amount;
    }
}
