const { expect } = require("chai");
const { ethers, network, upgrades } = require("hardhat");
const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');

const utils = ethers.utils;
let bigInt = require("big-integer");

const COMMON = 0, UNCOMMON = 1, RARE = 2, EPIC = 3;
const COMMONPOWER = 1, UNCOMMONPOWER = 2, RAREPOWER = 3, EPICPOWER = 4;
const CAR = 0, BICYCLE = 1, SCOOTER = 2;

async function getContracts() {
    let GTT = await ethers.getContractFactory("GTT");
    GTT = await GTT.deploy("test", "testing");

    const [owner, firstAccount, secondAccount] = await ethers.getSigners();

    let earnNFT = await ethers.getContractFactory("EarnNFT"); 
    let name = "test";
    let symbol = "testing";  
    let baseUri = "testing";
    earnNFT = await earnNFT.deploy(name, symbol, baseUri, GTT.address); 

    return { earnNFT, owner, firstAccount, secondAccount, name, symbol, baseUri, GTT } 
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
                expect(await earnNFT.powerMultiplier()).to.be.equal(900);
            });

            it("Checking getLevelByPower", async function () {
                const { earnNFT } = await loadFixture(getContracts);
                expect(await earnNFT.getLevelByPower(await earnNFT.powerMultiplier())).to.be.equal(COMMON);
            });
        });
    });

    describe("Setting allowed", function () {
        it("Should be false initial", async function () {
            const { earnNFT, owner } = await loadFixture(getContracts);
            expect(await earnNFT.isAllowed(owner.address)).to.be.equal(false);
        });

        it("Should be true after setting", async function () {
            const { earnNFT, owner } = await loadFixture(getContracts);
            
            await earnNFT.setAllowed([owner.address], true);
            expect(await earnNFT.isAllowed(owner.address)).to.be.equal(true);
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

        it("should fail after minting 2001 scooter", async function () {
            const { earnNFT, firstAccount } = await loadFixture(getContracts);
            
            for (let k = 0; k < 2000; ++ k)
                await earnNFT.connect(firstAccount).mint(SCOOTER, {value: ethers.utils.parseEther('0.01')});

            await expect(earnNFT.connect(firstAccount).mint(SCOOTER, {value: ethers.utils.parseEther('0.01')}))
                .to.be.revertedWith("EarnNFT: can't mint, max scooter supply reached");
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

            await expect(earnNFT.connect(firstAccount).merge(1, 2)).to.be.revertedWith("EarnNFT: EType of nft does not match");
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

    describe("test calculate power", function () {
        it("calculatePower when it's full should return max power", async function () {
            const { earnNFT, firstAccount } = await loadFixture(getContracts);
            await earnNFT.connect(firstAccount).mint(CAR, {value: ethers.utils.parseEther('0.01')});
            let power = await earnNFT.calculatePower(1);
            expect(power).to.be.equal(COMMONPOWER * await earnNFT.powerMultiplier());
        });
    });

    describe("test generate nft", function () {
        it("should fail while calling non allowed address", async function () {
            const { earnNFT, firstAccount } = await loadFixture(getContracts);
            await earnNFT.connect(firstAccount).mint(CAR, {value: ethers.utils.parseEther('0.01')});
            await expect(earnNFT.generate(1, 100)).to.be.revertedWith("EarnNFT: address is not allowed to call this function");
        });

        it("should fail when duration is not fit in power limit", async function () {
            const { earnNFT, firstAccount, owner } = await loadFixture(getContracts);
            await earnNFT.connect(firstAccount).mint(CAR, {value: ethers.utils.parseEther('0.01')});
            await earnNFT.setAllowed([owner.address], true);

            await expect(earnNFT.generate(1, 901))
                .to.be.revertedWith("EarnNFT: durationSeconds exceeds current power's limit");
        });

        it("should change power correctly", async function () {
            const { earnNFT, firstAccount, owner } = await loadFixture(getContracts);
            await earnNFT.connect(firstAccount).mint(CAR, {value: ethers.utils.parseEther('0.01')});
            await earnNFT.setAllowed([owner.address], true);

            await earnNFT.generate(1, 500);

            const nftInfo = await earnNFT.nftInfo(1);

            const blockNumBefore = await ethers.provider.getBlockNumber();
            const blockBefore = await ethers.provider.getBlock(blockNumBefore);
            const timestampBefore = blockBefore.timestamp;
            expect(nftInfo.lastUsage).to.be.equal(timestampBefore);
            expect(nftInfo.powerLeft).to.be.equal(400);
        });

        it("should be zero power left after Uncommon waste 900 + 900", async function () {
            const { earnNFT, firstAccount, owner } = await loadFixture(getContracts);
            await earnNFT.connect(firstAccount).mint(CAR, {value: ethers.utils.parseEther('0.01')});
            await earnNFT.connect(firstAccount).mint(CAR, {value: ethers.utils.parseEther('0.01')});
            await earnNFT.connect(firstAccount).merge(1, 2);
            await earnNFT.setAllowed([owner.address], true);

            await earnNFT.generate(3, 500);
            await earnNFT.generate(3, 500);
            await earnNFT.generate(3, 800);

            const nftInfo = await earnNFT.nftInfo(3);

            const blockNumBefore = await ethers.provider.getBlockNumber();
            const blockBefore = await ethers.provider.getBlock(blockNumBefore);
            const timestampBefore = blockBefore.timestamp;
            expect(nftInfo.lastUsage).to.be.equal(timestampBefore);
            expect(nftInfo.powerLeft).to.be.equal(0);
        });

        it("should be half of the power on Uncommon waste 900 + 900 after 12 hour", async function () {
            const { earnNFT, firstAccount, owner } = await loadFixture(getContracts);
            await earnNFT.connect(firstAccount).mint(CAR, {value: ethers.utils.parseEther('0.01')});
            await earnNFT.connect(firstAccount).mint(CAR, {value: ethers.utils.parseEther('0.01')});
            await earnNFT.connect(firstAccount).merge(1, 2);
            await earnNFT.setAllowed([owner.address], true);

            await earnNFT.generate(3, 500);
            await earnNFT.generate(3, 500);
            await earnNFT.generate(3, 800);

            const halfDay = 12 * 60 * 60;
            await network.provider.send("evm_increaseTime", [halfDay]);
            await network.provider.send("evm_mine");

            let power = await earnNFT.calculatePower(3);
            expect(power).to.be.equal(UNCOMMONPOWER * await earnNFT.powerMultiplier() / 2);
        });
    });

    describe("test claiming generated GTT", function () {
        it("should be 8 GTT power when uncommon wasted whole", async function () {
            const { earnNFT, firstAccount, owner, GTT } = await loadFixture(getContracts);
            await earnNFT.connect(firstAccount).mint(CAR, {value: ethers.utils.parseEther('0.01')});
            await earnNFT.connect(firstAccount).mint(CAR, {value: ethers.utils.parseEther('0.01')});
            await earnNFT.connect(firstAccount).merge(1, 2);
            await earnNFT.setAllowed([owner.address], true);

            await earnNFT.generate(3, 500);
            await earnNFT.generate(3, 500);
            await earnNFT.generate(3, 800);

            await GTT.setAllowedMint(earnNFT.address, true);
            await earnNFT.connect(firstAccount).claim(3);

            expect(await GTT.balanceOf(firstAccount.address)).to.be.equal("8000000000000000000");
        });

        it("should fail while calling non owner", async function () {
            const { earnNFT, firstAccount } = await loadFixture(getContracts);
            await earnNFT.connect(firstAccount).mint(CAR, {value: ethers.utils.parseEther('0.01')});
            await expect(earnNFT.claim(1)).to.be.revertedWith("EarnNFT: sender is not the owner of the token");
        });

        it("should be 2 GTT power when uncommon wasted half", async function () {
            const { earnNFT, firstAccount, owner, GTT } = await loadFixture(getContracts);
            await earnNFT.connect(firstAccount).mint(CAR, {value: ethers.utils.parseEther('0.01')});
            await earnNFT.setAllowed([owner.address], true);

            await earnNFT.generate(1, 450);

            await GTT.setAllowedMint(earnNFT.address, true);
            await earnNFT.connect(firstAccount).claim(1);

            expect(await GTT.balanceOf(firstAccount.address)).to.be.equal("2000000000000000000");
        });

        it("should be 8 GTT power when uncommon wasted twice", async function () {
            const { earnNFT, firstAccount, owner, GTT } = await loadFixture(getContracts);
            await earnNFT.connect(firstAccount).mint(CAR, {value: ethers.utils.parseEther('0.01')});
            await earnNFT.setAllowed([owner.address], true);

            await earnNFT.generate(1, 900);

            await GTT.setAllowedMint(earnNFT.address, true);
            await earnNFT.connect(firstAccount).claim(1);

            expect(await GTT.balanceOf(firstAccount.address)).to.be.equal("4000000000000000000");

            const halfDay = 24 * 60 * 60;
            await network.provider.send("evm_increaseTime", [halfDay]);
            await network.provider.send("evm_mine");
            await earnNFT.generate(1, 900);
            await earnNFT.connect(firstAccount).claim(1);

            expect(await GTT.balanceOf(firstAccount.address)).to.be.equal("8000000000000000000")
        });

        it("should be 6 GTT power when uncommon wasted 1.5 times", async function () {
            const { earnNFT, firstAccount, owner, GTT } = await loadFixture(getContracts);
            await earnNFT.connect(firstAccount).mint(CAR, {value: ethers.utils.parseEther('0.01')});
            await earnNFT.setAllowed([owner.address], true);

            await earnNFT.generate(1, 900);

            await GTT.setAllowedMint(earnNFT.address, true);
            await earnNFT.connect(firstAccount).claim(1);

            expect(await GTT.balanceOf(firstAccount.address)).to.be.equal("4000000000000000000");

            const halfDay = 12 * 60 * 60;
            await network.provider.send("evm_increaseTime", [halfDay]);
            await network.provider.send("evm_mine");
            await earnNFT.generate(1, 450);
            await earnNFT.connect(firstAccount).claim(1);

            expect(await GTT.balanceOf(firstAccount.address)).to.be.equal("6000000000000000000")
        });

        it("should fail when duration exceeds it's current limit", async function () {
            const { earnNFT, firstAccount, owner, GTT } = await loadFixture(getContracts);
            await earnNFT.connect(firstAccount).mint(CAR, {value: ethers.utils.parseEther('0.01')});
            await earnNFT.setAllowed([owner.address], true);

            await earnNFT.generate(1, 900);

            await GTT.setAllowedMint(earnNFT.address, true);
            await earnNFT.connect(firstAccount).claim(1);

            expect(await GTT.balanceOf(firstAccount.address)).to.be.equal("4000000000000000000");

            const halfDay = 12 * 60 * 60;
            await network.provider.send("evm_increaseTime", [halfDay]);
            await network.provider.send("evm_mine");
            await expect(earnNFT.generate(1, 451)).to.be.revertedWith("EarnNFT: durationSeconds exceeds current power's limit");
        });

    });
});