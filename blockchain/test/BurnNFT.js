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
    burnNFT = await burnNFT.deploy(name, symbol, baseUri); 

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
        });
    });


    describe("test BurnNFT minting", function () {
        it("Should mint correctly", async function () {
            const { burnNFT, firstAccount, baseUri } = await loadFixture(getContracts);
            await burnNFT.connect(firstAccount).mint(SCOOTER);
            
            expect(await burnNFT.ownerOf(1)).to.be.equal(firstAccount.address);
            expect(await burnNFT.tokenURI(1)).to.be.equal(baseUri+'1');
        });

        it("Should get scooter NFT info correctly", async function () {
            const { burnNFT, firstAccount, baseUri } = await loadFixture(getContracts);
            await burnNFT.connect(firstAccount).mint(SCOOTER);
            
            nftInfo = await burnNFT.nftInfo(1);
            expect(nftInfo.eType).to.be.equal(SCOOTER);
        });

        it("should fail after minting 1000 burn nft", async function () {
            const { burnNFT, firstAccount } = await loadFixture(getContracts);
            
            for (let k = 0; k < 1000; ++ k)
                await burnNFT.connect(firstAccount).mint(BICYCLE);

            await expect(burnNFT.connect(firstAccount).mint(BICYCLE))
                .to.be.revertedWith("BurnNFT: can't mint, max burn nft supply reached");
        });
    });

    describe("test generated pseudo GTT", function () {
        it("should fail when calling not allowed user", async function () {
            const { burnNFT, firstAccount, owner } = await loadFixture(getContracts);
            await burnNFT.connect(firstAccount).mint(SCOOTER);

            await expect(burnNFT.connect(owner).generate(1, 450))
                .to.be.revertedWith("BurnNFT: address is not allowed to call this function");
        });

        it("should be generate pseudo power of 2 GTT when generate was called", async function () {
            const { burnNFT, firstAccount, owner } = await loadFixture(getContracts);
            await burnNFT.connect(firstAccount).mint(CAR);

            await burnNFT.setAllowed(owner.address, true);
            await burnNFT.connect(owner).generate(1, 450);

            let info = await burnNFT.nftInfo(1);
            expect(info.score).to.be.equal("2000000000000000000");
        });

        it("should be generate pseudo power of 4 GTT when generate was called", async function () {
            const { burnNFT, firstAccount, owner } = await loadFixture(getContracts);
            await burnNFT.connect(firstAccount).mint(CAR);

            await burnNFT.setAllowed(owner.address, true);
            await burnNFT.connect(owner).generate(1, 900);

            let info = await burnNFT.nftInfo(1);
            expect(info.score).to.be.equal("4000000000000000000");
        });

        it("should be generate pseudo power of 6 GTT when generate fully and replenished half", async function () {
            const { burnNFT, firstAccount, owner } = await loadFixture(getContracts);
            await burnNFT.connect(firstAccount).mint(CAR);

            await burnNFT.setAllowed(owner.address, true);
            await burnNFT.connect(owner).generate(1, 900);
            
            const halfDay = 12 * 60 * 60;
            await network.provider.send("evm_increaseTime", [halfDay]);
            await network.provider.send("evm_mine");

            await burnNFT.connect(owner).generate(1, 450);
            let info = await burnNFT.nftInfo(1);
            expect(info.score).to.be.equal("6000000000000000000");
        });

        it("should equal half power after half day passed when fully wasted power", async function () {
            const { burnNFT, firstAccount, owner } = await loadFixture(getContracts);
            await burnNFT.connect(firstAccount).mint(CAR);

            await burnNFT.setAllowed(owner.address, true);
            await burnNFT.connect(owner).generate(1, 900);
            
            const halfDay = 12 * 60 * 60;
            await network.provider.send("evm_increaseTime", [halfDay]);
            await network.provider.send("evm_mine");

            expect(await burnNFT.calculatePower(1))
                .to.be.equal(450);
        });

    });
});