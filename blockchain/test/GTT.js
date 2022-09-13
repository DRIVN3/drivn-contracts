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
    GTT = await GTT.deploy(name, symbol);

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
            await GTT.setAllowedMint([firstAccount.address], true);
            expect(await GTT.isAllowedMinting(firstAccount.address)).to.be.equal(true);        
        });
        
        it("Should fail if caller is not owner", async function () {
            const { GTT, firstAccount } = await loadFixture(deployGTT);

            await expect(GTT.connect(firstAccount).setAllowedMint([firstAccount.address], true))
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
            await GTT.setAllowedMint([owner.address], true);

            const toMint = 100;
            await GTT.connect(owner).mint(firstAccount.address, toMint);
            expect(await GTT.balanceOf(firstAccount.address)).to.be.equal(toMint)
        });
    });
});