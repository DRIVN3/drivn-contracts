const {
    time,
    loadFixture,
    constants,
  } = require("@nomicfoundation/hardhat-network-helpers");
  const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
  const { expect } = require("chai");
let bigInt = require("big-integer");
const exp = require("constants");

const startGTTCoins = bigInt("200000000000000000000000");
  
async function deployGTT() {
    const [owner, firstAccount, secondAccount] = await ethers.getSigners();

    // deploy GTT
    let GTT = await ethers.getContractFactory("GTT");
    let name = "test";
    let symbol = "testing";
    GTT = await GTT.deploy(name, symbol, 50);

    // attach burn wallet 
    let burnWallet = await ethers.getContractFactory("GTTBurnWallet");
    burnWallet = await burnWallet.attach(await GTT.burnWallet());

    return { GTT, name, symbol, owner, firstAccount, secondAccount, burnWallet};
}

describe("GTT", function () {
    describe("Deployment", function () {
        it("Checking initial balance", async function () {
            const { GTT, name, symbol, owner } = await loadFixture(deployGTT);
            expect(await GTT.balanceOf(GTT.address)).to.equal(startGTTCoins.toString());
            expect(await GTT.name()).to.be.equal(name);
            expect(await GTT.symbol()).to.be.equal(symbol);
            expect(await GTT.owner()).to.be.equal(owner.address);
        });
    });

    describe("Test distribute", function () {
        
        it("Should fail while calling not owner", async function () {
            const { GTT, owner, firstAccount } = await loadFixture(deployGTT);
            await expect(GTT.connect(firstAccount).distribute(owner.address, 1)).to.be.revertedWith("Ownable: caller is not the owner")
        });

        it("Should fail when giving zero address", async function () {
            const { GTT } = await loadFixture(deployGTT);
            await expect(GTT.distribute(ethers.constants.AddressZero, 1)).to.be.revertedWith("GTT: account should not be zero address")
        });

        it("Should address get tokens after distribute calls", async function () {
            const { GTT, firstAccount } = await loadFixture(deployGTT);

            // distributing two different accoutns
            await GTT.distribute(firstAccount.address, 10)

            // checking balances
            expect(await GTT.balanceOf(firstAccount.address)).to.be.equal(10)
        });
        
    });


    describe("Test pause", function () {
        it("Should revert airdrop when paused", async function () {
            const { GTT, firstAccount } = await loadFixture(deployGTT);
            // test pause
            await GTT.pause();
            await expect(GTT.distribute(firstAccount.address, 2)).to.be.revertedWith("Pausable: paused");        
        });

        it("Should fail transfer when paused", async function () {
            const { GTT, firstAccount } = await loadFixture(deployGTT);
            // test pause
            await GTT.pause();
            await expect(GTT.transfer(firstAccount.address, 2)).to.be.revertedWith("Pausable: paused");        
        });

        it("Should revert airdrop when paused", async function () {
            const { GTT, firstAccount } = await loadFixture(deployGTT);
            await GTT.pause();        
            await GTT.unpause();
            await GTT.distribute(firstAccount.address, 2)
            expect(await GTT.balanceOf(firstAccount.address)).to.equal(2);
        });

    });
    
    describe("Test Burn", function () {
        it("Should revert if the caller is not a burn GTT wallet", async function () {
            const { GTT } = await loadFixture(deployGTT);
            await expect(GTT.burn(100)).to.be.revertedWith("GTT: address does not have burn access");        
        });

        it("Should burn proper amount of coins", async function () {
            const { GTT, burnWallet, owner } = await loadFixture(deployGTT);
            
            await GTT.distribute(owner.address, 200);
            await GTT.transfer(burnWallet.address, 150);
            await burnWallet.burn()

            expect(await GTT.balanceOf(burnWallet.address)).to.be.equal(0)
            expect(await GTT.totalSupply()).to.be.equal(startGTTCoins.minus(150).toString())
        });
    });

    describe("Test Setting Allowed Minting addresses", function () {
        it("Should be false at starting", async function () {
            const { GTT, firstAccount } = await loadFixture(deployGTT);
            expect(await GTT.isAllowedMinting(firstAccount.address)).to.be.equal(false);        
        });
        
        it("Should be true after setting", async function () {
            const { GTT, firstAccount } = await loadFixture(deployGTT);
            await GTT.setAllowedMint(firstAccount.address, true);
            expect(await GTT.isAllowedMinting(firstAccount.address)).to.be.equal(true);        
        });
        
        it("Should fail if caller is not owner", async function () {
            const { GTT, firstAccount } = await loadFixture(deployGTT);

            await expect(GTT.connect(firstAccount).setAllowedMint(firstAccount.address, true))
                .to.be.revertedWith("Ownable: caller is not the owner");        
        });
    });

    describe("Test Setting Allowed Burning addresses", function () {
        it("Should be false at starting", async function () {
            const { GTT, firstAccount } = await loadFixture(deployGTT);
            expect(await GTT.isAllowedBurn(firstAccount.address)).to.be.equal(false);        
        });

        it("Should be true after setting", async function () {
            const { GTT, firstAccount } = await loadFixture(deployGTT);
            await GTT.setAllowedBurn(firstAccount.address, true);
            expect(await GTT.isAllowedBurn(firstAccount.address)).to.be.equal(true);        
        });

        it("Should fail if caller is not owner", async function () {
            const { GTT, firstAccount } = await loadFixture(deployGTT);
            await expect(GTT.connect(firstAccount).setAllowedBurn(firstAccount.address, true))
                .to.be.revertedWith("Ownable: caller is not the owner");        
        });
    });

    describe("Test Mint", function () {
        it("Should revert when address does not have minting address", async function () {
            const { GTT, owner } = await loadFixture(deployGTT);
            await expect(GTT.mint(owner.address, 100)).to.be.revertedWith("GTT: address does not have mint access");        
        });

        it("Should enable minting after setting allowed", async function () {
            const { GTT, owner, firstAccount } = await loadFixture(deployGTT);
            await GTT.setAllowedMint(owner.address, true);

            const toMint = 100;
            await GTT.connect(owner).mint(firstAccount.address, toMint);
            expect(await GTT.balanceOf(firstAccount.address)).to.be.equal(toMint)
        });
    });
});

describe("DRVNERC20Extension GTT", function(){

    describe("Test setting recipient", function () {

        it("Should set recipient correctly", async function () {
            const { GTT, firstAccount } = await loadFixture(deployGTT);

            await GTT.setRecipient(firstAccount.address);
            expect(await GTT.recipient()).to.be.equal(firstAccount.address);

        });

        it("Should revert while calling no owner", async function () {
            const { GTT, firstAccount } = await loadFixture(deployGTT);
            expect(GTT.connect(firstAccount).setRecipient(firstAccount.address))
                .to.be.revertedWith("Ownable: caller is not the owner");
        });

    });

    describe("Test setting liquidity", function () {

        it("Should set liquidity correctly", async function () {
            const { GTT, firstAccount } = await loadFixture(deployGTT);

            await GTT.setLiquidityAddress(firstAccount.address, true);
            expect(await GTT.isLiquidity(firstAccount.address)).to.be.equal(true);

        });

        it("Should revert while calling no owner", async function () {
            const { GTT, firstAccount } = await loadFixture(deployGTT);
            expect(GTT.connect(firstAccount).setLiquidityAddress(firstAccount.address, true))
                .to.be.revertedWith("Ownable: caller is not the owner");
        });

    });

    describe("Test setting fee percentage", function () {

        it("Should be 5 at start", async function () {
            const { GTT } = await loadFixture(deployGTT);
            expect(await GTT.feePercentage()).to.be.equal(50);
        });

        it("Should set recipient correctly", async function () {
            const { GTT } = await loadFixture(deployGTT);
            await GTT.setFeePercentage(3);
            expect(await GTT.feePercentage()).to.be.equal(3);
        });

        it("Should revert while calling no owner", async function () {
            const { GTT, firstAccount } = await loadFixture(deployGTT);
            expect(GTT.connect(firstAccount).setFeePercentage(2))
                .to.be.revertedWith("Ownable: caller is not the owner");
        });

    });

    describe("Test transfer", function () {
        it("Should transfer whole amount when the address is not in liquidity contract", async function () {
            const { GTT, firstAccount, secondAccount } = await loadFixture(deployGTT);
            await GTT.distribute(firstAccount.address, 100);

            await GTT.connect(firstAccount).transfer(secondAccount.address, 100);

            expect(await GTT.balanceOf(secondAccount.address)).to.be.equal(100);
        });

        it("Should revert when passing the liquidity address, but recipient is null address", async function () {
            const { GTT, firstAccount, secondAccount } = await loadFixture(deployGTT);
            await GTT.distribute(firstAccount.address, 100);

            await GTT.setLiquidityAddress(firstAccount.address, true);

            await expect(GTT.connect(firstAccount).transfer(secondAccount.address, 100))
                .to.be.revertedWith("GTT: zero recipient address");
        });

        it("Should transfer 5 percent on fee address", async function () {
            const { GTT, firstAccount, secondAccount, owner } = await loadFixture(deployGTT);
            await GTT.distribute(firstAccount.address, 100);

            await GTT.setRecipient(owner.address);
            await GTT.setLiquidityAddress(firstAccount.address, true);

            await GTT.connect(firstAccount).transfer(secondAccount.address, 100);

            expect(await GTT.balanceOf(owner.address)).to.be.equal(5);
            expect(await GTT.balanceOf(secondAccount.address)).to.be.equal(95);
        });
    });

    describe("Test transfer from", function () {
        it("Should transfer whole amount when the address is not in liquidity contract", async function () {
            const { GTT, firstAccount, secondAccount } = await loadFixture(deployGTT);
            await GTT.distribute(firstAccount.address, 100);

            await GTT.connect(firstAccount).approve(secondAccount.address, 100);
            await GTT.connect(secondAccount).transferFrom(firstAccount.address, secondAccount.address, 100);

            expect(await GTT.balanceOf(secondAccount.address)).to.be.equal(100);
        });

        it("Should revert when passing the liquidity address, but recipient is null address", async function () {
            const { GTT, firstAccount, secondAccount } = await loadFixture(deployGTT);
            await GTT.distribute(firstAccount.address, 100);

            await GTT.setLiquidityAddress(firstAccount.address, true);

            await GTT.connect(firstAccount).approve(secondAccount.address, 100);
            await expect(GTT.connect(secondAccount).transferFrom(firstAccount.address, secondAccount.address, 100))
                .to.be.revertedWith("GTT: zero recipient address");
        });

        it("Should transfer 5 percent on fee address", async function () {
            const { GTT, firstAccount, secondAccount, owner } = await loadFixture(deployGTT);
            await GTT.distribute(firstAccount.address, 100);

            await GTT.setRecipient(owner.address);
            await GTT.setLiquidityAddress(firstAccount.address, true);

            await GTT.connect(firstAccount).approve(secondAccount.address, 100);
            await GTT.connect(secondAccount).transferFrom(firstAccount.address, secondAccount.address, 100);

            expect(await GTT.balanceOf(owner.address)).to.be.equal(5);
            expect(await GTT.balanceOf(secondAccount.address)).to.be.equal(95);
        });
    });

});