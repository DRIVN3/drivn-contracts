const {
    time,
    loadFixture,
    constants,
  } = require("@nomicfoundation/hardhat-network-helpers");
  const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
  const { expect } = require("chai");
let bigInt = require("big-integer");
const exp = require("constants");

const startGTTCoins = bigInt("5000000000000000000000000000");
  
const vestingDuration = 360 * 24 * 60 * 60;
const vestingStart = 360 * 24 * 60 * 60;


async function deployDRVN() {
    const [owner, firstAccount, secondAccount] = await ethers.getSigners();

    // deploy DRVN
    let DRVN = await ethers.getContractFactory("DRVNCoin");
    let name = "test";
    let symbol = "testing";
    DRVN = await DRVN.deploy(name, symbol);

    let DRVNTeamManager = await ethers.getContractFactory("DRVNTeamManager");
    DRVNTeamManager = await DRVNTeamManager.deploy(DRVN.address);

    return { DRVN, name, symbol, owner, firstAccount, secondAccount, DRVNTeamManager};
}

describe("DRVN", function () {
    describe("Deployment", function () {
        it("Checking initial balance", async function () {
            const { DRVN, name, symbol, owner } = await loadFixture(deployDRVN);
            expect(await DRVN.balanceOf(DRVN.address)).to.equal(startGTTCoins.toString());
            expect(await DRVN.name()).to.be.equal(name);
            expect(await DRVN.symbol()).to.be.equal(symbol);
            expect(await DRVN.owner()).to.be.equal(owner.address);
        });
    });

    describe("Test pause", function () {
        it("Should fail transfer when paused", async function () {
            const { DRVN, firstAccount } = await loadFixture(deployDRVN);
            // test pause
            await DRVN.pause();
            await expect(DRVN.transfer(firstAccount.address, 2)).to.be.revertedWith("Pausable: paused");     
            await DRVN.unpause();   
        });
    });

    describe("Test Send Tokens", function () {
        it("Should fail when calling non owner", async function () {
            const { DRVN, firstAccount } = await loadFixture(deployDRVN);
            
            await expect(DRVN.connect(firstAccount).sendTokens("Advisors", DRVN.address)).to.be.revertedWith("Ownable: caller is not the owner");     
        });
        
        it("Should fail while passing address zero", async function () {
            const { DRVN, firstAccount } = await loadFixture(deployDRVN);
            
            await expect(DRVN.sendTokens("Advisors", ethers.constants.AddressZero)).to.be.revertedWith("DRVN: should not send to zero address");     
        });

        it("Should fail while passing non contract address", async function () {
            const { DRVN, owner } = await loadFixture(deployDRVN);
            
            await expect(DRVN.sendTokens("Advisors", owner.address)).to.be.revertedWith("DRVN: contractAddress_ is not a contract");     
        });

        it("Should send tokens to team manager", async function () {
            const { DRVN, DRVNTeamManager } = await loadFixture(deployDRVN);
            
            await DRVN.sendTokens("Team", DRVNTeamManager.address);
            
            expect(await DRVN.balanceOf(DRVNTeamManager.address)).to.be.equal("675000000000000000000000000");
        });

        it("Should fail when sending twice", async function () {
            const { DRVN, DRVNTeamManager } = await loadFixture(deployDRVN);
            
            await DRVN.sendTokens("Team", DRVNTeamManager.address);
            
            await expect(DRVN.sendTokens("Team", DRVNTeamManager.address)).to.be.revertedWith("DRVN: not eligible");
        });
    });
});

describe("DRVNTeamManager", function () {
    describe("Deployment", function () {
        it("Checking address of DRVN coin", async function () {
            const { DRVN, DRVNTeamManager } = await loadFixture(deployDRVN);

            expect(await DRVNTeamManager.drvnCoin()).to.be.equal(DRVN.address);
        });
    });

    describe("Test setTeamWallet ", function () {
        it("Should fail while calling non owner", async function () {
            const {  DRVNTeamManager, owner, firstAccount } = await loadFixture(deployDRVN);

            await expect(DRVNTeamManager.connect(firstAccount).setTeamWallet(owner.address)).to.be.revertedWith("Ownable: caller is not the owner");
        });

        it("Should be setted correct address", async function () {
            const {  DRVNTeamManager, owner } = await loadFixture(deployDRVN);

            await DRVNTeamManager.setTeamWallet(owner.address);

            expect(await DRVNTeamManager.teamWallet()).to.be.equal(owner.address);
        });
    });

    describe("Test releasable amount ", function () {
        it("Should be zero before 360 day", async function () {
            const { DRVNTeamManager } = await loadFixture(deployDRVN);

            expect(await DRVNTeamManager.teamReleasableAmount()).to.be.equal(0);
        });

        it("Should be team supply / 2 after 360 day", async function () {
            const { DRVN, DRVNTeamManager } = await loadFixture(deployDRVN);

            await DRVN.sendTokens("Team", DRVNTeamManager.address);

            await network.provider.send("evm_increaseTime", [vestingStart - 1]);
            await network.provider.send("evm_mine");

            let answer = BigInt(await DRVNTeamManager.teamSupply()) / BigInt(2);
            expect(await DRVNTeamManager.teamReleasableAmount()).to.be.equal(answer.toString());
        });

        it("Should be released whole team supply 360 + 360 day", async function () {
            const { DRVN, DRVNTeamManager } = await loadFixture(deployDRVN);

            await DRVN.sendTokens("Team", DRVNTeamManager.address);

            await network.provider.send("evm_increaseTime", [vestingStart + vestingDuration]);
            await network.provider.send("evm_mine");

            let answer = BigInt(await DRVNTeamManager.teamSupply());
            expect(await DRVNTeamManager.teamReleasableAmount()).to.be.equal(answer.toString());
        });

        it("Should be released 3/4 team supply after 360 + 180 days", async function () {
            const { DRVN, DRVNTeamManager } = await loadFixture(deployDRVN);

            await DRVN.sendTokens("Team", DRVNTeamManager.address);

            await network.provider.send("evm_increaseTime", [vestingStart + vestingDuration / 2 - 1]);
            await network.provider.send("evm_mine");

            let answer = BigInt(3) * BigInt(await DRVNTeamManager.teamSupply()) / BigInt(4);
            expect(await DRVNTeamManager.teamReleasableAmount()).to.be.equal(answer.toString());
        });
    });

    describe("Test Release", function () {
        it("Should fail when owner is not the caller", async function () {
            const { DRVN, DRVNTeamManager, firstAccount } = await loadFixture(deployDRVN);

            await DRVNTeamManager.setTeamWallet(firstAccount.address);
            await DRVN.sendTokens("Team", DRVNTeamManager.address);
            
            await expect(DRVNTeamManager.connect(firstAccount).release()).to.be.revertedWith("Ownable: caller is not the owner")
        });

        it("Should fail when team wallet address is zero", async function () {
            const { DRVN, DRVNTeamManager } = await loadFixture(deployDRVN);

            await DRVN.sendTokens("Team", DRVNTeamManager.address);
            
            await expect(DRVNTeamManager.release()).to.be.revertedWith("TeamManager: team address not set")
        });


        it("Should be released whole team supply 360 + 360 day", async function () {
            const { DRVN, DRVNTeamManager, firstAccount } = await loadFixture(deployDRVN);

            await DRVN.sendTokens("Team", DRVNTeamManager.address);
            await DRVNTeamManager.setTeamWallet(firstAccount.address);

            await network.provider.send("evm_increaseTime", [vestingStart + vestingDuration]);
            await network.provider.send("evm_mine");
            await DRVNTeamManager.release();

            let answer = BigInt(await DRVNTeamManager.teamSupply());

            expect(await DRVN.balanceOf(firstAccount.address)).to.be.equal(answer.toString());
        });

        it("Should be released 3/4 team supply after 360 + 180 days", async function () {
            const { DRVN, DRVNTeamManager, firstAccount } = await loadFixture(deployDRVN);

            await DRVN.sendTokens("Team", DRVNTeamManager.address);
            await DRVNTeamManager.setTeamWallet(firstAccount.address);

            await network.provider.send("evm_increaseTime", [vestingStart + vestingDuration / 2 - 3]);
            await network.provider.send("evm_mine");
            await DRVNTeamManager.release();

            let answer = BigInt(3) * BigInt(await DRVNTeamManager.teamSupply()) / BigInt(4);
            expect(await DRVN.balanceOf(firstAccount.address)).to.be.equal(answer.toString());
        });
    });
});
