const {
    time,
    loadFixture,
    constants,
  } = require("@nomicfoundation/hardhat-network-helpers");
  const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
  const { expect } = require("chai");
let bigInt = require("big-integer");
const exp = require("constants");

const startDRVNCoins = bigInt("5000000000000000000000000000");
  
const vestingDuration = 360 * 24 * 60 * 60;
const vestingStart = 360 * 24 * 60 * 60;


async function deployDRVN() {
    const [owner, firstAccount, secondAccount] = await ethers.getSigners();

    // deploy DRVN
    let DRVN = await ethers.getContractFactory("DRVNCoin");
    let name = "test";
    let symbol = "testing";
    DRVN = await DRVN.deploy(name, symbol, 35);

    return { DRVN, name, symbol, owner, firstAccount, secondAccount};
}

describe("DRVN", function () {
    describe("Deployment", function () {
        it("Checking initial balance", async function () {
            const { DRVN, name, symbol, owner } = await loadFixture(deployDRVN);
            expect(await DRVN.balanceOf(DRVN.address)).to.equal(startDRVNCoins.toString());
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
            
            await expect(DRVN.connect(firstAccount).sendTokens("Advisors", DRVN.address, false)).to.be.revertedWith("Ownable: caller is not the owner");     
        });
        
        it("Should fail while passing address zero", async function () {
            const { DRVN } = await loadFixture(deployDRVN);
            
            await expect(DRVN.sendTokens("Advisors", ethers.constants.AddressZero, false)).to.be.revertedWith("DRVN: supplyAddress should not be zero");     
        });

        it("Should send tokens to team manager", async function () {
            const { DRVN, owner } = await loadFixture(deployDRVN);
            
            await DRVN.sendTokens("Team", owner.address, false);
            
            expect(await DRVN.balanceOf(owner.address)).to.be.equal("675000000000000000000000000");
        });

        it("Should fail when sending twice", async function () {
            const { DRVN, owner } = await loadFixture(deployDRVN);
            
            await DRVN.sendTokens("Team", owner.address, false);
            
            await expect(DRVN.sendTokens("Team", owner.address, false)).to.be.revertedWith("DRVN: not eligible");
        });
    });
});

describe("Team Vesting test", function () {
    describe("Test Team supply vesting", function () {
        it("Test creation", async function () {
            const { DRVN, firstAccount } = await loadFixture(deployDRVN);

            let teamSupply = await DRVN.supplyData("Team");
            await DRVN.sendTokens("Team", firstAccount.address, true);
            
            let vestContract = await DRVN.vestingContracts("Team");
            expect(await DRVN.balanceOf(vestContract)).to.be.equal(teamSupply);
        });

        it("Should be zero after 359 day", async function () {
            const { DRVN, firstAccount } = await loadFixture(deployDRVN);

            await DRVN.sendTokens("Team", firstAccount.address, true);
            
            let vestContract = await DRVN.vestingContracts("Team");
            const vestingWallet = await ethers.getContractFactory("VestingContract");
            const contract = await vestingWallet.attach(
                vestContract
            );

            // increase time whole duration
            await network.provider.send("evm_increaseTime", [vestingStart - 3]);
            await network.provider.send("evm_mine");
            await contract.functions['release()']();

            expect(await DRVN.balanceOf(firstAccount.address)).to.be.equal(0);
        });

        it("Should be half after 360 + 180 day", async function () {
            const { DRVN, firstAccount } = await loadFixture(deployDRVN);
            let teamSupply = await DRVN.supplyData("Team");

            await DRVN.sendTokens("Team", firstAccount.address, true);
            
            let vestContract = await DRVN.vestingContracts("Team");
            const vestingWallet = await ethers.getContractFactory("VestingContract");
            const contract = await vestingWallet.attach(
                vestContract
            );

            // increase time whole duration
            await network.provider.send("evm_increaseTime", [vestingStart - 1 + vestingDuration / 2]);
            await network.provider.send("evm_mine");
            await contract.functions['release()']();

            let answer = BigInt(teamSupply) / BigInt(2);

            expect(await DRVN.balanceOf(firstAccount.address)).to.be.equal(answer.toString());
        });

        it("Should be released whole team supply 360 + 360 day", async function () {
            const { DRVN, firstAccount } = await loadFixture(deployDRVN);

            let teamSupply = await DRVN.supplyData("Team");
            await DRVN.sendTokens("Team", firstAccount.address, true);
            
            let vestContract = await DRVN.vestingContracts("Team");
            const vestingWallet = await ethers.getContractFactory("VestingContract");
            const contract = await vestingWallet.attach(
                vestContract
            );

            // increase time whole duration
            await network.provider.send("evm_increaseTime", [vestingStart + vestingDuration]);
            await network.provider.send("evm_mine");
            await contract.functions['release()']();

            expect(await DRVN.balanceOf(firstAccount.address)).to.be.equal(teamSupply.toString());
        });

        it("Should be released 3/4 team supply after 360 + 270 days", async function () {
            const { DRVN, firstAccount } = await loadFixture(deployDRVN);

            let teamSupply = await DRVN.supplyData("Team");
            await DRVN.sendTokens("Team", firstAccount.address, true);
            
            let vestContract = await DRVN.vestingContracts("Team");
            const vestingWallet = await ethers.getContractFactory("VestingContract");
            const contract = await vestingWallet.attach(
                vestContract
            );

            // passed 3/4 time
            await network.provider.send("evm_increaseTime", [vestingStart + 3 * vestingDuration / 4 - 1]);
            await network.provider.send("evm_mine");
            await contract.functions['release()']();

            let answer = BigInt(3) * BigInt(teamSupply) / BigInt(4);
            expect(await DRVN.balanceOf(firstAccount.address)).to.be.equal(answer.toString());
        });
    });
});


describe("DRVNERC20Extension DRVN", function(){

    describe("Test setting recipient", function () {

        it("Should set recipient correctly", async function () {
            const { DRVN, firstAccount } = await loadFixture(deployDRVN);

            await DRVN.setRecipient(firstAccount.address);
            expect(await DRVN.recipient()).to.be.equal(firstAccount.address);

        });

        it("Should revert while calling no owner", async function () {
            const { DRVN, firstAccount } = await loadFixture(deployDRVN);
            expect(DRVN.connect(firstAccount).setRecipient(firstAccount.address))
                .to.be.revertedWith("Ownable: caller is not the owner");
        });

    });

    describe("Test setting liquidity", function () {

        it("Should set liquidity correctly", async function () {
            const { DRVN, firstAccount } = await loadFixture(deployDRVN);

            await DRVN.setLiquidityAddress(firstAccount.address, true);
            expect(await DRVN.isLiquidity(firstAccount.address)).to.be.equal(true);

        });

        it("Should revert while calling no owner", async function () {
            const { DRVN, firstAccount } = await loadFixture(deployDRVN);
            expect(DRVN.connect(firstAccount).setLiquidityAddress(firstAccount.address, true))
                .to.be.revertedWith("Ownable: caller is not the owner");
        });

    });

    describe("Test transfer", function () {
        it("Should transfer whole amount when the address is not in liquidity contract", async function () {
            const { DRVN, firstAccount, secondAccount } = await loadFixture(deployDRVN);
            await DRVN.sendTokens("Dex Liquidity", firstAccount.address, false);

            await DRVN.connect(firstAccount).transfer(secondAccount.address, 100);

            expect(await DRVN.balanceOf(secondAccount.address)).to.be.equal(100);
        });

        it("Should revert when passing the liquidity address, but recipient is null address", async function () {
            const { DRVN, firstAccount, secondAccount } = await loadFixture(deployDRVN);
            await DRVN.sendTokens("Dex Liquidity", firstAccount.address, false);

            await DRVN.setLiquidityAddress(firstAccount.address, true);

            await expect(DRVN.connect(firstAccount).transfer(secondAccount.address, 100))
                .to.be.revertedWith("DRVNCoin: zero recipient address");
        });

        it("Should transfer 5 percent on fee address", async function () {
            const { DRVN, firstAccount, secondAccount, owner } = await loadFixture(deployDRVN);
            await DRVN.sendTokens("Dex Liquidity", firstAccount.address, false);

            await DRVN.setRecipient(owner.address);
            await DRVN.setLiquidityAddress(firstAccount.address, true);

            await DRVN.connect(firstAccount).transfer(secondAccount.address, 1000);

            expect(await DRVN.balanceOf(owner.address)).to.be.equal(35);
            expect(await DRVN.balanceOf(secondAccount.address)).to.be.equal(965);
        });

        it("Should transfer 5 percent on fee address", async function () {
            const { DRVN, firstAccount, secondAccount, owner } = await loadFixture(deployDRVN);
            await DRVN.sendTokens("Dex Liquidity", firstAccount.address, false);

            await DRVN.setRecipient(owner.address);
            await DRVN.setLiquidityAddress(secondAccount.address, true);

            await DRVN.connect(firstAccount).transfer(secondAccount.address, 10000);

            expect(await DRVN.balanceOf(owner.address)).to.be.equal(350);
            expect(await DRVN.balanceOf(secondAccount.address)).to.be.equal(9650);
        });

    });

    describe("Test transfer from", function () {
        it("Should transfer from whole amount when the address is not in liquidity contract", async function () {
            const { DRVN, firstAccount, secondAccount } = await loadFixture(deployDRVN);
            await DRVN.sendTokens("Dex Liquidity", firstAccount.address, false);

            await DRVN.connect(firstAccount).approve(secondAccount.address, 1000);
            await DRVN.connect(secondAccount).transferFrom(firstAccount.address, secondAccount.address, 1000);

            expect(await DRVN.balanceOf(secondAccount.address)).to.be.equal(1000);
        });

        it("Should revert when passing the liquidity address, but recipient is null address", async function () {
            const { DRVN, firstAccount, secondAccount } = await loadFixture(deployDRVN);
            await DRVN.sendTokens("Dex Liquidity", firstAccount.address, false);

            await DRVN.setLiquidityAddress(firstAccount.address, true);

            await DRVN.connect(firstAccount).approve(secondAccount.address, 100);
            await expect(DRVN.connect(secondAccount).transferFrom(firstAccount.address, secondAccount.address, 100))
                .to.be.revertedWith("DRVNCoin: zero recipient address");
        });

        it("Should transfer from 5 percent on fee address", async function () {
            const { DRVN, firstAccount, secondAccount, owner } = await loadFixture(deployDRVN);
            await DRVN.sendTokens("Dex Liquidity", firstAccount.address, false);

            await DRVN.setRecipient(owner.address);
            await DRVN.setLiquidityAddress(firstAccount.address, true);

            await DRVN.connect(firstAccount).approve(secondAccount.address, 1000);
            await DRVN.connect(secondAccount).transferFrom(firstAccount.address, secondAccount.address, 1000);

            expect(await DRVN.balanceOf(owner.address)).to.be.equal(35);
            expect(await DRVN.balanceOf(secondAccount.address)).to.be.equal(965);
        });

        it("Should transfer from whole amount correctly", async function () {
            const { DRVN, firstAccount, secondAccount, owner } = await loadFixture(deployDRVN);
            await DRVN.sendTokens("Dex Liquidity", firstAccount.address, false);

            await DRVN.setRecipient(owner.address);

            await DRVN.connect(firstAccount).approve(secondAccount.address, 1000);
            await DRVN.connect(secondAccount).transferFrom(firstAccount.address, secondAccount.address, 1000);

            expect(await DRVN.balanceOf(secondAccount.address)).to.be.equal(1000);
        });
    });

});