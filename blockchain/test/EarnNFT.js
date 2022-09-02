const { expect } = require("chai");
const { ethers, network, upgrades } = require("hardhat");
const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');

const utils = ethers.utils;
let bigInt = require("big-integer");

const COMMON = 0, UNCOMMON = 1, RARE = 2, EPIC = 3;
const COMMONPOWER = 1, UNCOMMONPOWER = 2, RAREPOWER = 3, EPICPOWER = 4;
const CAR = 0, BICYCLE = 1, SCOOTER = 2;

async function getContracts() {
    const [owner, firstAccount, secondAccount] = await ethers.getSigners();

    let earnNFT = await ethers.getContractFactory("EarnNFT"); 
    let name = "test";
    let symbol = "testing";  
    let baseUri = "testing";
    earnNFT = await earnNFT.deploy(name, symbol, baseUri); 

    return { earnNFT, owner, firstAccount, secondAccount, name, symbol, baseUri } 
}


describe("EarnNFt", function () { 
    describe("EarnNFT deployment", function () {
        describe("Deployment", function () {
            it("Checking the contracts", async function () {
                const { earnNFT, name, symbol, baseUri, owner } = await loadFixture(getContracts);
                expect(await earnNFT.name()).to.be.equal(name);
                expect(await earnNFT.symbol()).to.be.equal(symbol);
                expect(await earnNFT.owner()).to.be.equal(owner.address);
            });

            it("Checking power decimals", async function () {
                const { earnNFT } = await loadFixture(getContracts);
                expect(await earnNFT.powerMultiplier()).to.be.equal(3600);
            });

            it("Checking getTypeByPower", async function () {
                const { earnNFT } = await loadFixture(getContracts);
                expect(await earnNFT.getTypeByPower(await earnNFT.powerMultiplier())).to.be.equal(COMMON);
            });
        });
    });

    describe("test EarnNft minting", function () {
        it("Should fail when not enough balance", async function () {
            const { earnNFT, firstAccount } = await loadFixture(getContracts);
            await expect(earnNFT.connect(firstAccount).mint(CAR)).to.be.revertedWith("EarnNFT: not enough money");
        });

        it("Should mint correctly", async function () {
            const { earnNFT, firstAccount, baseUri } = await loadFixture(getContracts);
            await earnNFT.connect(firstAccount).mint(CAR, {value: ethers.utils.parseEther('0.01')});
            
            expect(await earnNFT.ownerOf(1)).to.be.equal(firstAccount.address);
            expect(await earnNFT.tokenURI(1)).to.be.equal(baseUri+'1');
        });

        it("Should get correct information after minting car", async function () {
            const { earnNFT, firstAccount } = await loadFixture(getContracts);
            await earnNFT.connect(firstAccount).mint(CAR, {value: ethers.utils.parseEther('0.01')});
            

            let multiplier = await earnNFT.powerMultiplier();
            let nftInfo = await earnNFT.nftInfo(1);
            expect(nftInfo.nftType).to.be.equal(COMMON);
            expect(nftInfo.vehicle).to.be.equal(CAR);
            expect(nftInfo.lastUsage).to.be.equal(0);
            expect(nftInfo.powerLeft).to.be.equal(COMMONPOWER * multiplier);
            expect(nftInfo.maxPower).to.be.equal(COMMONPOWER * multiplier);
        });

        it("Should get correct information after minting bycicle", async function () {
            const { earnNFT, firstAccount } = await loadFixture(getContracts);
            await earnNFT.connect(firstAccount).mint(BICYCLE, {value: ethers.utils.parseEther('0.01')});
            
            let multiplier = await earnNFT.powerMultiplier();
            let nftInfo = await earnNFT.nftInfo(1);
            expect(nftInfo.nftType).to.be.equal(COMMON);
            expect(nftInfo.vehicle).to.be.equal(BICYCLE);
            expect(nftInfo.lastUsage).to.be.equal(0);
            expect(nftInfo.powerLeft).to.be.equal(COMMONPOWER * multiplier);
            expect(nftInfo.maxPower).to.be.equal(COMMONPOWER * multiplier);
        });

        it("Should get correct information after minting scooter", async function () {
            const { earnNFT, firstAccount } = await loadFixture(getContracts);
            await earnNFT.connect(firstAccount).mint(SCOOTER, {value: ethers.utils.parseEther('0.01')});
            
            let multiplier = await earnNFT.powerMultiplier();
            let nftInfo = await earnNFT.nftInfo(1);
            expect(nftInfo.nftType).to.be.equal(COMMON);
            expect(nftInfo.vehicle).to.be.equal(SCOOTER);
            expect(nftInfo.lastUsage).to.be.equal(0);
            expect(nftInfo.powerLeft).to.be.equal(COMMONPOWER * multiplier);
            expect(nftInfo.maxPower).to.be.equal(COMMONPOWER * multiplier);
        });

        it("should fail after minting 1001 bicycle", async function () {
            const { earnNFT, firstAccount } = await loadFixture(getContracts);
            
            for (let k = 0; k < 1000; ++ k)
                await earnNFT.connect(firstAccount).mint(BICYCLE, {value: ethers.utils.parseEther('0.01')});

            await expect(earnNFT.connect(firstAccount).mint(BICYCLE, {value: ethers.utils.parseEther('0.01')}))
                .to.be.revertedWith("EarnNFT: can't mint, max bicycle supply reached");
        });
    });

    describe("test EarnNft merging", function () {
        it("Should fail when merge is called with no owner of the tokens", async function () {
            const { earnNFT, firstAccount, secondAccount } = await loadFixture(getContracts);
            await earnNFT.connect(firstAccount).mint(CAR, {value: ethers.utils.parseEther('0.01')});
            await earnNFT.connect(firstAccount).mint(CAR, {value: ethers.utils.parseEther('0.01')});
            await earnNFT.connect(secondAccount).mint(CAR, {value: ethers.utils.parseEther('0.01')});

            await expect(earnNFT.connect(secondAccount).merge(1, 2)).to.be.revertedWith("EarnNFT: sender is not the owner of the tokens");
            await expect(earnNFT.connect(secondAccount).merge(3, 2)).to.be.revertedWith("EarnNFT: sender is not the owner of the tokens");
        });

        it("Should fail while merging two different vehicle token", async function () {
            const { earnNFT, firstAccount } = await loadFixture(getContracts);
            await earnNFT.connect(firstAccount).mint(CAR, {value: ethers.utils.parseEther('0.01')});
            await earnNFT.connect(firstAccount).mint(BICYCLE, {value: ethers.utils.parseEther('0.01')});

            await expect(earnNFT.connect(firstAccount).merge(1, 2)).to.be.revertedWith("EarnNFT: type of EVehicle does not match");
        });

        it("Should merge two common token", async function () {
            const { earnNFT, firstAccount } = await loadFixture(getContracts);
            await earnNFT.connect(firstAccount).mint(CAR, {value: ethers.utils.parseEther('0.01')});
            await earnNFT.connect(firstAccount).mint(CAR, {value: ethers.utils.parseEther('0.01')});

            await earnNFT.connect(firstAccount).merge(1, 2);
            
            // the tokens get burned
            await expect(earnNFT.ownerOf(1)).to.be.revertedWith("ERC721: invalid token ID");
            await expect(earnNFT.ownerOf(2)).to.be.revertedWith("ERC721: invalid token ID");

            // the merge happens correctly
            expect(await earnNFT.ownerOf(3)).to.be.equal(firstAccount.address);
            
            let multiplier = await earnNFT.powerMultiplier();

            let nftInfo = await earnNFT.nftInfo(3);
            expect(nftInfo.nftType).to.be.equal(UNCOMMON);
            expect(nftInfo.lastUsage).to.be.equal(0);
            expect(nftInfo.powerLeft).to.be.equal(UNCOMMONPOWER * multiplier);
            expect(nftInfo.maxPower).to.be.equal(UNCOMMONPOWER * multiplier);
        });

        it("Should get the RARE CAR nft token", async function () {
            const { earnNFT, firstAccount, secondAccount } = await loadFixture(getContracts);
            await earnNFT.connect(firstAccount).mint(CAR, {value: ethers.utils.parseEther('0.01')});
            await earnNFT.connect(firstAccount).mint(CAR, {value: ethers.utils.parseEther('0.01')});
            await earnNFT.connect(firstAccount).mint(CAR, {value: ethers.utils.parseEther('0.01')});

            await earnNFT.connect(firstAccount).merge(1, 2);
            await earnNFT.connect(firstAccount).merge(3, 4);

            // the tokens get burned
            await expect(earnNFT.ownerOf(1)).to.be.revertedWith("ERC721: invalid token ID");
            await expect(earnNFT.ownerOf(2)).to.be.revertedWith("ERC721: invalid token ID");
            await expect(earnNFT.ownerOf(3)).to.be.revertedWith("ERC721: invalid token ID");
            await expect(earnNFT.ownerOf(4)).to.be.revertedWith("ERC721: invalid token ID");

            // the merge happens correctly
            expect(await earnNFT.ownerOf(5)).to.be.equal(firstAccount.address);

            let multiplier = await earnNFT.powerMultiplier();
            let nftInfo = await earnNFT.nftInfo(5);
            expect(nftInfo.nftType).to.be.equal(RARE);
            expect(nftInfo.vehicle).to.be.equal(CAR);
            expect(nftInfo.lastUsage).to.be.equal(0);
            expect(nftInfo.powerLeft).to.be.equal(RAREPOWER * multiplier);
            expect(nftInfo.maxPower).to.be.equal(RAREPOWER * multiplier);
        });

        it("Should get the EPIC Bicycle nft token", async function () {
            const { earnNFT, firstAccount } = await loadFixture(getContracts);
            await earnNFT.connect(firstAccount).mint(BICYCLE, {value: ethers.utils.parseEther('0.01')});
            await earnNFT.connect(firstAccount).mint(BICYCLE, {value: ethers.utils.parseEther('0.01')});
            await earnNFT.connect(firstAccount).mint(BICYCLE, {value: ethers.utils.parseEther('0.01')});
            await earnNFT.connect(firstAccount).merge(1, 2);
            await earnNFT.connect(firstAccount).merge(3, 4);

            await earnNFT.connect(firstAccount).mint(BICYCLE, {value: ethers.utils.parseEther('0.01')});
            await earnNFT.connect(firstAccount).merge(5, 6);

            // the tokens get burned
            await expect(earnNFT.ownerOf(1)).to.be.revertedWith("ERC721: invalid token ID");
            await expect(earnNFT.ownerOf(2)).to.be.revertedWith("ERC721: invalid token ID");
            await expect(earnNFT.ownerOf(3)).to.be.revertedWith("ERC721: invalid token ID");
            await expect(earnNFT.ownerOf(4)).to.be.revertedWith("ERC721: invalid token ID");
            await expect(earnNFT.ownerOf(5)).to.be.revertedWith("ERC721: invalid token ID");
            await expect(earnNFT.ownerOf(6)).to.be.revertedWith("ERC721: invalid token ID");

            // the merge happens correctly
            expect(await earnNFT.ownerOf(7)).to.be.equal(firstAccount.address);

            let multiplier = await earnNFT.powerMultiplier();
            let nftInfo = await earnNFT.nftInfo(7);
            expect(nftInfo.nftType).to.be.equal(EPIC);
            expect(nftInfo.vehicle).to.be.equal(BICYCLE);
            expect(nftInfo.lastUsage).to.be.equal(0);
            expect(nftInfo.powerLeft).to.be.equal(EPICPOWER * multiplier);
            expect(nftInfo.maxPower).to.be.equal(EPICPOWER * multiplier);
        });

        it("Should fail while merging Rare and UNCOMMON SCOOTER", async function () {
            const { earnNFT, firstAccount, secondAccount } = await loadFixture(getContracts);
            await earnNFT.connect(firstAccount).mint(SCOOTER, {value: ethers.utils.parseEther('0.01')});
            await earnNFT.connect(firstAccount).mint(SCOOTER, {value: ethers.utils.parseEther('0.01')});
            await earnNFT.connect(firstAccount).mint(SCOOTER, {value: ethers.utils.parseEther('0.01')});

            await earnNFT.connect(firstAccount).merge(1, 2);
            // RARE in 5 id
            await earnNFT.connect(firstAccount).merge(3, 4);

            // UNCOMMON 8 ID
            await earnNFT.connect(firstAccount).mint(SCOOTER, {value: ethers.utils.parseEther('0.01')});
            await earnNFT.connect(firstAccount).mint(SCOOTER, {value: ethers.utils.parseEther('0.01')});
            await earnNFT.connect(firstAccount).merge(6, 7);

            await expect(earnNFT.connect(firstAccount).merge(5, 8)).to.be.revertedWith("EarnNFT: Power is too high");
        });

    });
});