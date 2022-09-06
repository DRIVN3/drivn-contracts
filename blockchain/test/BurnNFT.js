const { expect } = require("chai");
const { ethers, network, upgrades } = require("hardhat");
const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');

const utils = ethers.utils;
let bigInt = require("big-integer");

const COMMON = 0;
const COMMONPOWER = 1;
const CAR = 0, BICYCLE = 1, SCOOTER = 2;

async function getContracts() {
    let GTT = await ethers.getContractFactory("GTT");
    GTT = await GTT.deploy("test", "testing");

    const [owner, firstAccount, secondAccount] = await ethers.getSigners();

    let burnNFT = await ethers.getContractFactory("BurnNFT"); 
    let name = "test";
    let symbol = "testing";  
    let baseUri = "testing";
    burnNFT = await burnNFT.deploy(name, symbol, baseUri, GTT.address, await GTT.burnWallet()); 

    return { burnNFT, owner, firstAccount, secondAccount, name, symbol, baseUri, GTT } 
}


describe("BurnNFT", function () { 
    describe("BurnNFT deployment", function () {
        describe("Deployment", function () {
            it("Checking the contracts", async function () {
                const { burnNFT, name, symbol, owner } = await loadFixture(getContracts);
                expect(await burnNFT.name()).to.be.equal(name);
                expect(await burnNFT.symbol()).to.be.equal(symbol);
                expect(await burnNFT.owner()).to.be.equal(owner.address);
            });

            it("Checking power decimals", async function () {
                const { burnNFT } = await loadFixture(getContracts);
                expect(await burnNFT.powerMultiplier()).to.be.equal(900);
            });
        });
    });

    describe("Setting allowed", function () {
        it("Should be false initial", async function () {
            const { burnNFT, owner } = await loadFixture(getContracts);
            expect(await burnNFT.isAllowed(owner.address)).to.be.equal(false);
        });

        it("Should be true after setting", async function () {
            const { burnNFT, owner } = await loadFixture(getContracts);
            
            await burnNFT.setAllowed([owner.address], true);
            expect(await burnNFT.isAllowed(owner.address)).to.be.equal(true);
        });
    });

    describe("test BurnNFT minting", function () {
        it("Should fail when not enough balance", async function () {
            const { burnNFT, firstAccount } = await loadFixture(getContracts);
            await expect(burnNFT.connect(firstAccount).mint(CAR)).to.be.revertedWith("BurnNFT: not enough money");
        });

        it("Should mint correctly", async function () {
            const { burnNFT, firstAccount, baseUri } = await loadFixture(getContracts);
            await burnNFT.connect(firstAccount).mint(CAR, {value: ethers.utils.parseEther('0.01')});
            
            expect(await burnNFT.ownerOf(1)).to.be.equal(firstAccount.address);
            expect(await burnNFT.tokenURI(1)).to.be.equal(baseUri+'1');
        });

        it("Should get correct information after minting car", async function () {
            const { burnNFT, firstAccount } = await loadFixture(getContracts);
            await burnNFT.connect(firstAccount).mint(CAR, {value: ethers.utils.parseEther('0.01')});
            

            let multiplier = await burnNFT.powerMultiplier();
            let nftInfo = await burnNFT.nftInfo(1);
            expect(nftInfo.vehicle).to.be.equal(CAR);
            expect(nftInfo.lastUsage).to.be.equal(0);
            expect(nftInfo.powerLeft).to.be.equal(COMMONPOWER * multiplier);
            expect(nftInfo.maxPower).to.be.equal(COMMONPOWER * multiplier);
        });

        it("Should get correct information after minting bycicle", async function () {
            const { burnNFT, firstAccount } = await loadFixture(getContracts);
            await burnNFT.connect(firstAccount).mint(BICYCLE, {value: ethers.utils.parseEther('0.01')});
            
            let multiplier = await burnNFT.powerMultiplier();
            let nftInfo = await burnNFT.nftInfo(1);
            expect(nftInfo.vehicle).to.be.equal(BICYCLE);
            expect(nftInfo.lastUsage).to.be.equal(0);
            expect(nftInfo.powerLeft).to.be.equal(COMMONPOWER * multiplier);
            expect(nftInfo.maxPower).to.be.equal(COMMONPOWER * multiplier);
        });

        it("Should get correct information after minting scooter", async function () {
            const { burnNFT, firstAccount } = await loadFixture(getContracts);
            await burnNFT.connect(firstAccount).mint(SCOOTER, {value: ethers.utils.parseEther('0.01')});
            
            let multiplier = await burnNFT.powerMultiplier();
            let nftInfo = await burnNFT.nftInfo(1);
            expect(nftInfo.vehicle).to.be.equal(SCOOTER);
            expect(nftInfo.lastUsage).to.be.equal(0);
            expect(nftInfo.powerLeft).to.be.equal(COMMONPOWER * multiplier);
            expect(nftInfo.maxPower).to.be.equal(COMMONPOWER * multiplier);
        });

        it("should fail after minting 101 bicycle", async function () {
            const { burnNFT, firstAccount } = await loadFixture(getContracts);
            
            for (let k = 0; k < 100; ++ k)
                await burnNFT.connect(firstAccount).mint(BICYCLE, {value: ethers.utils.parseEther('0.01')});

            await expect(burnNFT.connect(firstAccount).mint(BICYCLE, {value: ethers.utils.parseEther('0.01')}))
                .to.be.revertedWith("BurnNFT: can't mint, max bicycle supply reached");
        });

        it("should fail after minting 201 scooter", async function () {
            const { burnNFT, firstAccount } = await loadFixture(getContracts);
            
            for (let k = 0; k < 200; ++ k)
                await burnNFT.connect(firstAccount).mint(SCOOTER, {value: ethers.utils.parseEther('0.01')});

            await expect(burnNFT.connect(firstAccount).mint(SCOOTER, {value: ethers.utils.parseEther('0.01')}))
                .to.be.revertedWith("BurnNFT: can't mint, max scooter supply reached");
        });
    });

    describe("test calculate power", function () {
        it("calculatePower when it's full should return max power", async function () {
            const { burnNFT, firstAccount } = await loadFixture(getContracts);
            await burnNFT.connect(firstAccount).mint(CAR, {value: ethers.utils.parseEther('0.01')});
            let power = await burnNFT.calculatePower(1);
            expect(power).to.be.equal(COMMONPOWER * await burnNFT.powerMultiplier());
        });
    });

    describe("test generate nft", function () {
        it("should fail while calling non allowed address", async function () {
            const { burnNFT, firstAccount } = await loadFixture(getContracts);
            await burnNFT.connect(firstAccount).mint(CAR, {value: ethers.utils.parseEther('0.01')});
            await expect(burnNFT.generate(1, 100)).to.be.revertedWith("BurnNFT: address is not allowed to call this function");
        });

        it("should fail when duration is not fit in power limit", async function () {
            const { burnNFT, firstAccount, owner } = await loadFixture(getContracts);
            await burnNFT.connect(firstAccount).mint(CAR, {value: ethers.utils.parseEther('0.01')});
            await burnNFT.setAllowed([owner.address], true);

            await expect(burnNFT.generate(1, 901))
                .to.be.revertedWith("BurnNFT: durationSeconds exceeds current power's limit");
        });

        it("should power correctly", async function () {
            const { burnNFT, firstAccount, owner } = await loadFixture(getContracts);
            await burnNFT.connect(firstAccount).mint(CAR, {value: ethers.utils.parseEther('0.01')});
            await burnNFT.setAllowed([owner.address], true);

            await burnNFT.generate(1, 500);

            const nftInfo = await burnNFT.nftInfo(1);

            const blockNumBefore = await ethers.provider.getBlockNumber();
            const blockBefore = await ethers.provider.getBlock(blockNumBefore);
            const timestampBefore = blockBefore.timestamp;
            expect(nftInfo.lastUsage).to.be.equal(timestampBefore);
            expect(nftInfo.powerLeft).to.be.equal(400);
        });

        it("should be zero power left when BURN NFT waste 900", async function () {
            const { burnNFT, firstAccount, owner } = await loadFixture(getContracts);
            await burnNFT.connect(firstAccount).mint(CAR, {value: ethers.utils.parseEther('0.01')});
            await burnNFT.connect(firstAccount).mint(CAR, {value: ethers.utils.parseEther('0.01')});
            await burnNFT.setAllowed([owner.address], true);

            await burnNFT.generate(1, 500);
            await burnNFT.generate(1, 400);

            const nftInfo = await burnNFT.nftInfo(1);

            const blockNumBefore = await ethers.provider.getBlockNumber();
            const blockBefore = await ethers.provider.getBlock(blockNumBefore);
            const timestampBefore = blockBefore.timestamp;
            expect(nftInfo.lastUsage).to.be.equal(timestampBefore);
            expect(nftInfo.powerLeft).to.be.equal(0);
        });

        it("should be half of power after waste and pass 12 hour", async function () {
            const { burnNFT, firstAccount, owner } = await loadFixture(getContracts);
            await burnNFT.connect(firstAccount).mint(CAR, {value: ethers.utils.parseEther('0.01')});
            await burnNFT.setAllowed([owner.address], true);

            await burnNFT.generate(1, 500);
            await burnNFT.generate(1, 400);

            const halfDay = 12 * 60 * 60;
            await network.provider.send("evm_increaseTime", [halfDay]);
            await network.provider.send("evm_mine");

            let power = await burnNFT.calculatePower(1);
            expect(power).to.be.equal(COMMONPOWER * await burnNFT.powerMultiplier() / 2);
        });
    });

    describe("test burning generated GTT", function () {
        it("should fail when calling no owner", async function () {
            const { burnNFT, firstAccount, owner, GTT } = await loadFixture(getContracts);
            await burnNFT.connect(firstAccount).mint(CAR, {value: ethers.utils.parseEther('0.01')});

            await expct(burnNFT.connect(owner).burn(1)).to.be.revertedWith("BurnNFT: sender is not the owner of the token");
        });

        it("should be 8 GTT power when wasted twice", async function () {
            const { burnNFT, firstAccount, owner, GTT } = await loadFixture(getContracts);
            await burnNFT.connect(firstAccount).mint(CAR, {value: ethers.utils.parseEther('0.01')});
            await burnNFT.setAllowed([owner.address], true);

            await burnNFT.generate(1, 900);

            await GTT.setAllowed([burnNFT.address], true);
            await burnNFT.connect(firstAccount).burn(1);

            expect(await GTT.balanceOf(await GTT.burnWallet())).to.be.equal("4000000000000000000");

            const halfDay = 24 * 60 * 60;
            await network.provider.send("evm_increaseTime", [halfDay]);
            await network.provider.send("evm_mine");
            await burnNFT.generate(1, 900);
            await burnNFT.connect(firstAccount).burn(1);

            expect(await GTT.balanceOf(await GTT.burnWallet())).to.be.equal("8000000000000000000")
        });
    });
});