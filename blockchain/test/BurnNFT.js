const { expect } = require("chai");
const { ethers, network, upgrades } = require("hardhat");
const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');

const utils = ethers.utils;
let bigInt = require("big-integer");

const COMMON = 0;
const COMMONPOWER = 1;
const CAR = 0, BICYCLE = 1, SCOOTER = 2;

const burnNFTPRice = ethers.utils.parseEther('0.01');

async function getContracts() {

    const [owner, firstAccount, secondAccount] = await ethers.getSigners();

    let burnNFT = await ethers.getContractFactory("BurnNFT"); 
    let name = "test";
    let symbol = "testing";  
    let baseUri = "testing";
    burnNFT = await burnNFT.deploy(name, symbol, baseUri); 

    let burnNFTManagement = await ethers.getContractFactory("BurnNFTManagement");
    burnNFTManagement = await upgrades.deployProxy(burnNFTManagement, [burnNFT.address, "testurl"]);
    await burnNFTManagement.deployed();

    await burnNFT.setAllowed(burnNFTManagement.address, true);

    return { burnNFT, burnNFTManagement, owner, firstAccount, secondAccount, name, symbol, baseUri } 
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
        it("Should fail when minting > 1000 nft", async function () {
            const { burnNFTManagement } = await loadFixture(getContracts);
            await burnNFTManagement.setMaxBurnNFTSupply(0);
            await expect(burnNFTManagement.mint(0, {value: burnNFTPRice}))
                .to.be.revertedWith("BurnNFTManagement: max supply reached");
        });

        it("Should fail while minting not allowed", async function () {
            const { burnNFT, owner } = await loadFixture(getContracts);
            await expect(burnNFT.mint(owner.address))
                .to.be.revertedWith("BurnNFT: address is not allowed to call this function");
        });

        it("Should mint correctly", async function () {
            const { burnNFT, burnNFTManagement, firstAccount, baseUri } = await loadFixture(getContracts);
            await burnNFTManagement.connect(firstAccount).mint(SCOOTER, {value: burnNFTPRice});
            
            expect(await burnNFT.ownerOf(1)).to.be.equal(firstAccount.address);
            expect(await burnNFT.tokenURI(1)).to.be.equal(baseUri+'1');
        });

        it("Should get scooter NFT info correctly", async function () {
            const { burnNFT, burnNFTManagement, firstAccount, baseUri } = await loadFixture(getContracts);
            await burnNFTManagement.connect(firstAccount).mint(SCOOTER, {value: burnNFTPRice});
            
            nftInfo = await burnNFTManagement.nftInfo(1);
            expect(nftInfo.eType).to.be.equal(SCOOTER);
        });

        it("should fail after twice", async function () {
            const { burnNFTManagement, firstAccount } = await loadFixture(getContracts);
            await burnNFTManagement.connect(firstAccount).mint(BICYCLE, {value: burnNFTPRice});
            await expect(burnNFTManagement.connect(firstAccount).mint(BICYCLE), {value: burnNFTPRice})
                .to.be.revertedWith("BurnNFTManagement: you have already minted once");
        });
    });

    describe("test EarnNFTManagement generating callback", function () {

        it("Should fail while calling with no api consumer", async function () {
            const { burnNFTManagement, firstAccount } = await loadFixture(getContracts);
            await expect(burnNFTManagement.connect(firstAccount).generateCallBack(1, 3))
                .to.be.revertedWith("BurnNFTManagement: sender is not earn api consumer client");
        });

        it("should equal 3 after call generateCallBack function", async function () {
            const { burnNFTManagement, firstAccount, GTT } = await loadFixture(getContracts);

            await burnNFTManagement.connect(firstAccount).mint(CAR, {value: burnNFTPRice});
            await burnNFTManagement.generateCallBack(1, 3);

            let info = await burnNFTManagement.nftInfo(1);
            expect(await info.score).to.be.equal(3);
        });

        it("should not generated again when allready generated 3", async function () {
            const { burnNFTManagement, firstAccount, GTT } = await loadFixture(getContracts);

            await burnNFTManagement.connect(firstAccount).mint(CAR, {value: burnNFTPRice});
            await burnNFTManagement.generateCallBack(1, 3);
            await burnNFTManagement.generateCallBack(1, 3);
            await burnNFTManagement.generateCallBack(1, 3);

            let info = await burnNFTManagement.nftInfo(1);
            expect(await info.score).to.be.equal(3);
        });

    });

    describe("test BurnNFTManagement withdraw", function () {
        it("Should fail while calling no owner", async function () {
            const { burnNFTManagement, firstAccount } = await loadFixture(getContracts);
            await expect(burnNFTManagement.connect(firstAccount).withdraw())
                .to.be.revertedWith("Ownable: caller is not the owner");
        });

        it("Should withdraw correctly", async function () {
            const { burnNFTManagement, firstAccount, owner } = await loadFixture(getContracts);
            await burnNFTManagement.connect(firstAccount).mint(CAR, {value: burnNFTPRice});
            
            expect(await ethers.provider.getBalance(burnNFTManagement.address)).to.be.equal(burnNFTPRice);
            await burnNFTManagement.withdraw();
            expect(await ethers.provider.getBalance(burnNFTManagement.address)).to.be.equal(0);
        });            
    });


});