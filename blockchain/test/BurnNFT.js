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
    burnNFT = await burnNFT.deploy(name, symbol, baseUri, GTT.address); 

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
        it("Should fail when not enough balance", async function () {
            const { burnNFT, firstAccount } = await loadFixture(getContracts);
            await expect(burnNFT.connect(firstAccount).mint()).to.be.revertedWith("BurnNFT: not enough money");
        });

        it("Should mint correctly", async function () {
            const { burnNFT, firstAccount, baseUri } = await loadFixture(getContracts);
            await burnNFT.connect(firstAccount).mint({value: ethers.utils.parseEther('0.01')});
            
            expect(await burnNFT.ownerOf(1)).to.be.equal(firstAccount.address);
            expect(await burnNFT.tokenURI(1)).to.be.equal(baseUri+'1');
        });

        it("should fail after minting 1000 burn nft", async function () {
            const { burnNFT, firstAccount } = await loadFixture(getContracts);
            
            for (let k = 0; k < 1000; ++ k)
                await burnNFT.connect(firstAccount).mint({value: ethers.utils.parseEther('0.01')});

            await expect(burnNFT.connect(firstAccount).mint({value: ethers.utils.parseEther('0.01')}))
                .to.be.revertedWith("BurnNFT: can't mint, max burn nft supply reached");
        });
    });

    describe("test burning generated GTT", function () {
        it("should fail when calling no owner", async function () {
            const { burnNFT, firstAccount, owner, GTT } = await loadFixture(getContracts);
            await burnNFT.connect(firstAccount).mint({value: ethers.utils.parseEther('0.01')});

            await expect(burnNFT.connect(owner).burn(1, 4)).to.be.revertedWith("BurnNFT: sender is not the owner of the token");
        });

        it("should be burn 4 when burn was called", async function () {
            const { burnNFT, firstAccount, owner, GTT } = await loadFixture(getContracts);
            await burnNFT.connect(firstAccount).mint({value: ethers.utils.parseEther('0.01')});

            // give the allowance to burn nft contract
            await GTT.distribute(firstAccount.address, 4);
            await GTT.connect(firstAccount).increaseAllowance(burnNFT.address, 4);

            await GTT.setAllowedBurn(burnNFT.address, true);
            await burnNFT.connect(firstAccount).burn(1, 4);


            expect(await GTT.balanceOf(firstAccount.address)).to.be.equal(0);
            expect(await GTT.balanceOf(burnNFT.address)).to.be.equal(0);
        });
    });
});