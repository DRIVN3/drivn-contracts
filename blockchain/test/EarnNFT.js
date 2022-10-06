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
    GTT = await GTT.deploy("test", "testing", 5);

    const [owner, firstAccount, secondAccount] = await ethers.getSigners();

    let earnNFT = await ethers.getContractFactory("EarnNFT"); 
    let name = "test";
    let symbol = "testing";  
    let baseUri = "testing";
    earnNFT = await earnNFT.deploy(name, symbol, baseUri); 

    let earnNftManagement = await ethers.getContractFactory("EarnNFTManagement"); 
    earnNftManagement = await upgrades.deployProxy(earnNftManagement, [earnNFT.address, GTT.address]);
    await earnNftManagement.deployed();

    await earnNFT.setAllowed(earnNftManagement.address, true);

    return { earnNFT, owner, firstAccount, secondAccount, name, symbol, baseUri, GTT, earnNftManagement } 
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
                const { earnNftManagement } = await loadFixture(getContracts);
                expect(await earnNftManagement.powerMultiplier()).to.be.equal(900);
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
            
            await earnNFT.setAllowed(owner.address, true);
            expect(await earnNFT.isAllowed(owner.address)).to.be.equal(true);
        });
    });

    describe("test EarnNFTManagement", function () {

        describe("test EarnNFTManagement setting supplies", function () {
            it("Should fail while setting car with no owner", async function () {
                const { earnNftManagement, firstAccount } = await loadFixture(getContracts);
                await expect(earnNftManagement.connect(firstAccount).setMaxCarSupply(4))
                    .to.be.revertedWith("Ownable: caller is not the owner");
            });

            it("Should fail while setting scooter with no owner", async function () {
                const { earnNftManagement, firstAccount } = await loadFixture(getContracts);
                await expect(earnNftManagement.connect(firstAccount).setMaxScooterSupply(3))
                    .to.be.revertedWith("Ownable: caller is not the owner");
            });

            it("Should fail while setting bicycle with no owner", async function () {
                const { earnNftManagement, firstAccount } = await loadFixture(getContracts);
                await expect(earnNftManagement.connect(firstAccount).setMaxBicycleSupply(2))
                    .to.be.revertedWith("Ownable: caller is not the owner");
            });

            it("Should be setted correctly car supply", async function () {
                const { earnNftManagement } = await loadFixture(getContracts);
                await earnNftManagement.setMaxCarSupply(2);
                expect(await earnNftManagement.maxCarSupply()).to.be.equal(2);
            });

            it("Should be setted correctly scooter supply", async function () {
                const { earnNftManagement } = await loadFixture(getContracts);
                await earnNftManagement.setMaxScooterSupply(3);
                expect(await earnNftManagement.maxScooterSupply()).to.be.equal(3);
            });

            it("Should be setted correctly bicycle supply", async function () {
                const { earnNftManagement } = await loadFixture(getContracts);
                await earnNftManagement.setMaxBicycleSupply(4);
                expect(await earnNftManagement.maxBicycleSupply()).to.be.equal(4);
            });

        });

        describe("test EarnNFTManagement minting", function () {
            it("Should fail while minting not allowed", async function () {
                const { earnNFT, owner } = await loadFixture(getContracts);
                await expect(earnNFT.mint(owner.address))
                    .to.be.revertedWith("EarnNFT: address is not allowed to call this function");
            });

            it("Should fail when not enough balance", async function () {
                const { earnNftManagement, firstAccount } = await loadFixture(getContracts);
                await expect(earnNftManagement.connect(firstAccount).mint(CAR)).to.be.revertedWith("EarnNFTManagement: not enough money");
            });

            it("Should mint correctly", async function () {
                const { earnNFT, earnNftManagement, firstAccount, baseUri } = await loadFixture(getContracts);
                await earnNftManagement.connect(firstAccount).mint(CAR, {value: ethers.utils.parseEther('0.01')});
                
                expect(await earnNFT.ownerOf(1)).to.be.equal(firstAccount.address);
                expect(await earnNFT.tokenURI(1)).to.be.equal(baseUri+'1');
            });

            it("Should get correct information after minting car", async function () {
                const { earnNftManagement, firstAccount } = await loadFixture(getContracts);
                await earnNftManagement.connect(firstAccount).mint(CAR, {value: ethers.utils.parseEther('0.01')});
                
                let multiplier = await earnNftManagement.powerMultiplier();
                let nftInfo = await earnNftManagement.nftInfo(1);
                expect(nftInfo.nftType).to.be.equal(COMMON);
                expect(nftInfo.eType).to.be.equal(CAR);
                expect(nftInfo.lastUsage).to.be.equal(0);
                expect(nftInfo.powerLeft).to.be.equal(COMMONPOWER * multiplier);
                expect(nftInfo.maxPower).to.be.equal(COMMONPOWER * multiplier);
            });

            it("Should get correct information after minting bycicle", async function () {
                const { earnNftManagement, firstAccount } = await loadFixture(getContracts);
                await earnNftManagement.connect(firstAccount).mint(BICYCLE, {value: ethers.utils.parseEther('0.01')});
                
                let multiplier = await earnNftManagement.powerMultiplier();
                let nftInfo = await earnNftManagement.nftInfo(1);
                expect(nftInfo.nftType).to.be.equal(COMMON);
                expect(nftInfo.eType).to.be.equal(BICYCLE);
                expect(nftInfo.lastUsage).to.be.equal(0);
                expect(nftInfo.powerLeft).to.be.equal(COMMONPOWER * multiplier);
                expect(nftInfo.maxPower).to.be.equal(COMMONPOWER * multiplier);
            });

            it("Should get correct information after minting scooter", async function () {
                const { earnNftManagement, firstAccount } = await loadFixture(getContracts);
                await earnNftManagement.connect(firstAccount).mint(SCOOTER, {value: ethers.utils.parseEther('0.01')});
                
                let multiplier = await earnNftManagement.powerMultiplier();
                let nftInfo = await earnNftManagement.nftInfo(1);
                expect(nftInfo.nftType).to.be.equal(COMMON);
                expect(nftInfo.eType).to.be.equal(SCOOTER);
                expect(nftInfo.lastUsage).to.be.equal(0);
                expect(nftInfo.powerLeft).to.be.equal(COMMONPOWER * multiplier);
                expect(nftInfo.maxPower).to.be.equal(COMMONPOWER * multiplier);
            });

            it("should fail after minting 1001 bicycle", async function () {
                const { earnNftManagement, firstAccount } = await loadFixture(getContracts);
                await earnNftManagement.setMaxBicycleSupply(3);

                for (let k = 0; k < 3; ++ k)
                    await earnNftManagement.connect(firstAccount).mint(BICYCLE, {value: ethers.utils.parseEther('0.01')});

                await expect(earnNftManagement.connect(firstAccount).mint(BICYCLE, {value: ethers.utils.parseEther('0.01')}))
                    .to.be.revertedWith("EarnNFTManagement: can't mint, max bicycle supply reached");
            });

            it("should fail after minting 3 scooter", async function () {
                const { earnNftManagement, firstAccount } = await loadFixture(getContracts);
                await earnNftManagement.setMaxScooterSupply(3);

                for (let k = 0; k < 3; ++ k)
                    await earnNftManagement.connect(firstAccount).mint(SCOOTER, {value: ethers.utils.parseEther('0.01')});

                await expect(earnNftManagement.connect(firstAccount).mint(SCOOTER, {value: ethers.utils.parseEther('0.01')}))
                    .to.be.revertedWith("EarnNFTManagement: can't mint, max scooter supply reached");
            });
            
        });

        describe("test EarnNFTManagement merging", function () {
            it("Should fail when merge is called with no owner of the tokens", async function () {
                const { earnNftManagement, firstAccount, secondAccount } = await loadFixture(getContracts);
                await earnNftManagement.connect(firstAccount).mint(CAR, {value: ethers.utils.parseEther('0.01')});
                await earnNftManagement.connect(firstAccount).mint(CAR, {value: ethers.utils.parseEther('0.01')});
                await earnNftManagement.connect(secondAccount).mint(CAR, {value: ethers.utils.parseEther('0.01')});

                await expect(earnNftManagement.connect(secondAccount).merge(1, 2))
                    .to.be.revertedWith("EarnNFTManagement: sender is not the owner of the tokens");
                await expect(earnNftManagement.connect(secondAccount).merge(3, 2))
                    .to.be.revertedWith("EarnNFTManagement: sender is not the owner of the tokens");
            });

            it("Should fail while merging two different vehicle token", async function () {
                const { earnNftManagement, firstAccount } = await loadFixture(getContracts);
                await earnNftManagement.connect(firstAccount).mint(CAR, {value: ethers.utils.parseEther('0.01')});
                await earnNftManagement.connect(firstAccount).mint(BICYCLE, {value: ethers.utils.parseEther('0.01')});

                await expect(earnNftManagement.connect(firstAccount).merge(1, 2))
                    .to.be.revertedWith("EarnNFTManagement: EType of nft does not match");
            });

            it("Should merge two common token", async function () {
                const { earnNFT, earnNftManagement, firstAccount } = await loadFixture(getContracts);
                await earnNftManagement.connect(firstAccount).mint(CAR, {value: ethers.utils.parseEther('0.01')});
                await earnNftManagement.connect(firstAccount).mint(CAR, {value: ethers.utils.parseEther('0.01')});

                await earnNftManagement.connect(firstAccount).merge(1, 2);
                
                // the tokens get burned
                await expect(earnNFT.ownerOf(1)).to.be.revertedWith("ERC721: invalid token ID");
                await expect(earnNFT.ownerOf(2)).to.be.revertedWith("ERC721: invalid token ID");

                // the merge happens correctly
                expect(await earnNFT.ownerOf(3)).to.be.equal(firstAccount.address);
                
                let multiplier = await earnNftManagement.powerMultiplier();

                let nftInfo = await earnNftManagement.nftInfo(3);
                expect(nftInfo.nftType).to.be.equal(UNCOMMON);
                expect(nftInfo.lastUsage).to.be.equal(0);
                expect(nftInfo.powerLeft).to.be.equal(UNCOMMONPOWER * multiplier);
                expect(nftInfo.maxPower).to.be.equal(UNCOMMONPOWER * multiplier);
            });

            it("Should get the RARE CAR nft token", async function () {
                const { earnNFT, earnNftManagement, firstAccount, secondAccount } = await loadFixture(getContracts);
                await earnNftManagement.connect(firstAccount).mint(CAR, {value: ethers.utils.parseEther('0.01')});
                await earnNftManagement.connect(firstAccount).mint(CAR, {value: ethers.utils.parseEther('0.01')});
                await earnNftManagement.connect(firstAccount).mint(CAR, {value: ethers.utils.parseEther('0.01')});

                await earnNftManagement.connect(firstAccount).merge(1, 2);
                await earnNftManagement.connect(firstAccount).merge(3, 4);

                // the tokens get burned
                await expect(earnNFT.ownerOf(1)).to.be.revertedWith("ERC721: invalid token ID");
                await expect(earnNFT.ownerOf(2)).to.be.revertedWith("ERC721: invalid token ID");
                await expect(earnNFT.ownerOf(3)).to.be.revertedWith("ERC721: invalid token ID");
                await expect(earnNFT.ownerOf(4)).to.be.revertedWith("ERC721: invalid token ID");

                // the merge happens correctly
                expect(await earnNFT.ownerOf(5)).to.be.equal(firstAccount.address);

                let multiplier = await earnNftManagement.powerMultiplier();
                let nftInfo = await earnNftManagement.nftInfo(5);
                expect(nftInfo.nftType).to.be.equal(RARE);
                expect(nftInfo.eType).to.be.equal(CAR);
                expect(nftInfo.lastUsage).to.be.equal(0);
                expect(nftInfo.powerLeft).to.be.equal(RAREPOWER * multiplier);
                expect(nftInfo.maxPower).to.be.equal(RAREPOWER * multiplier);
            });

            it("Should get the EPIC Bicycle nft token", async function () {
                const { earnNFT, earnNftManagement, firstAccount } = await loadFixture(getContracts);
                await earnNftManagement.connect(firstAccount).mint(BICYCLE, {value: ethers.utils.parseEther('0.01')});
                await earnNftManagement.connect(firstAccount).mint(BICYCLE, {value: ethers.utils.parseEther('0.01')});
                await earnNftManagement.connect(firstAccount).mint(BICYCLE, {value: ethers.utils.parseEther('0.01')});
                await earnNftManagement.connect(firstAccount).merge(1, 2);
                await earnNftManagement.connect(firstAccount).merge(3, 4);

                await earnNftManagement.connect(firstAccount).mint(BICYCLE, {value: ethers.utils.parseEther('0.01')});
                await earnNftManagement.connect(firstAccount).merge(5, 6);

                // the tokens get burned
                await expect(earnNFT.ownerOf(1)).to.be.revertedWith("ERC721: invalid token ID");
                await expect(earnNFT.ownerOf(2)).to.be.revertedWith("ERC721: invalid token ID");
                await expect(earnNFT.ownerOf(3)).to.be.revertedWith("ERC721: invalid token ID");
                await expect(earnNFT.ownerOf(4)).to.be.revertedWith("ERC721: invalid token ID");
                await expect(earnNFT.ownerOf(5)).to.be.revertedWith("ERC721: invalid token ID");
                await expect(earnNFT.ownerOf(6)).to.be.revertedWith("ERC721: invalid token ID");

                // the merge happens correctly
                expect(await earnNFT.ownerOf(7)).to.be.equal(firstAccount.address);

                let multiplier = await earnNftManagement.powerMultiplier();
                let nftInfo = await earnNftManagement.nftInfo(7);
                expect(nftInfo.nftType).to.be.equal(EPIC);
                expect(nftInfo.eType).to.be.equal(BICYCLE);
                expect(nftInfo.lastUsage).to.be.equal(0);
                expect(nftInfo.powerLeft).to.be.equal(EPICPOWER * multiplier);
                expect(nftInfo.maxPower).to.be.equal(EPICPOWER * multiplier);
            });

            it("Should fail while merging Rare and UNCOMMON SCOOTER", async function () {
                const { earnNftManagement, firstAccount, secondAccount } = await loadFixture(getContracts);
                await earnNftManagement.connect(firstAccount).mint(SCOOTER, {value: ethers.utils.parseEther('0.01')});
                await earnNftManagement.connect(firstAccount).mint(SCOOTER, {value: ethers.utils.parseEther('0.01')});
                await earnNftManagement.connect(firstAccount).mint(SCOOTER, {value: ethers.utils.parseEther('0.01')});

                await earnNftManagement.connect(firstAccount).merge(1, 2);
                // RARE in 5 id
                await earnNftManagement.connect(firstAccount).merge(3, 4);

                // UNCOMMON 8 ID
                await earnNftManagement.connect(firstAccount).mint(SCOOTER, {value: ethers.utils.parseEther('0.01')});
                await earnNftManagement.connect(firstAccount).mint(SCOOTER, {value: ethers.utils.parseEther('0.01')});
                await earnNftManagement.connect(firstAccount).merge(6, 7);

                await expect(earnNftManagement.connect(firstAccount).merge(5, 8))
                    .to.be.revertedWith("EarnNFTManagement: Power is too high");
            });

        });

        describe("test calculate power", function () {
            it("calculatePower when it's full should return max power", async function () {
                const { earnNftManagement, firstAccount } = await loadFixture(getContracts);
                await earnNftManagement.connect(firstAccount).mint(CAR, {value: ethers.utils.parseEther('0.01')});
                let power = await earnNftManagement.calculatePower(1);
                expect(power).to.be.equal(COMMONPOWER * await earnNftManagement.powerMultiplier());
            });
        });

        describe("test generate nft", function () {
            it("should fail while calling non allowed address", async function () {
                const { earnNftManagement, firstAccount } = await loadFixture(getContracts);
                await earnNftManagement.connect(firstAccount).mint(CAR, {value: ethers.utils.parseEther('0.01')});
                await expect(earnNftManagement.generate(1, 100, false)).
                    to.be.revertedWith("EarnNFTManagement: address is not allowed to call this function");
            });

            it("should generate whole when duration is not fit in power limit", async function () {
                const { earnNftManagement, firstAccount, owner } = await loadFixture(getContracts);
                await earnNftManagement.connect(firstAccount).mint(CAR, {value: ethers.utils.parseEther('0.01')});
                await earnNftManagement.setAllowed(owner.address, true);

                await earnNftManagement.generate(1, 901, false);

                const nftInfo = await earnNftManagement.nftInfo(1);
                expect(nftInfo.powerLeft).to.be.equal(0);
            });

            it("should change power correctly", async function () {
                const { earnNftManagement, firstAccount, owner } = await loadFixture(getContracts);
                await earnNftManagement.connect(firstAccount).mint(CAR, {value: ethers.utils.parseEther('0.01')});
                await earnNftManagement.setAllowed(owner.address, true);

                await earnNftManagement.generate(1, 500, false);

                const nftInfo = await earnNftManagement.nftInfo(1);

                const blockNumBefore = await ethers.provider.getBlockNumber();
                const blockBefore = await ethers.provider.getBlock(blockNumBefore);
                const timestampBefore = blockBefore.timestamp;
                expect(nftInfo.lastUsage).to.be.equal(timestampBefore);
                expect(nftInfo.powerLeft).to.be.equal(400);
            });

            it("should be zero power left after Uncommon waste 900 + 900", async function () {
                const { earnNftManagement, firstAccount, owner } = await loadFixture(getContracts);
                await earnNftManagement.connect(firstAccount).mint(CAR, {value: ethers.utils.parseEther('0.01')});
                await earnNftManagement.connect(firstAccount).mint(CAR, {value: ethers.utils.parseEther('0.01')});
                await earnNftManagement.connect(firstAccount).merge(1, 2);
                await earnNftManagement.setAllowed(owner.address, true);

                await earnNftManagement.generate(3, 500, false);
                await earnNftManagement.generate(3, 500, false);
                await earnNftManagement.generate(3, 800, false);

                const nftInfo = await earnNftManagement.nftInfo(3);

                const blockNumBefore = await ethers.provider.getBlockNumber();
                const blockBefore = await ethers.provider.getBlock(blockNumBefore);
                const timestampBefore = blockBefore.timestamp;
                expect(nftInfo.lastUsage).to.be.equal(timestampBefore);
                expect(nftInfo.powerLeft).to.be.equal(0);
            });

            it("should be half of the power on Uncommon waste 900 + 900 after 12 hour", async function () {
                const { earnNftManagement, firstAccount, owner } = await loadFixture(getContracts);
                await earnNftManagement.connect(firstAccount).mint(CAR, {value: ethers.utils.parseEther('0.01')});
                await earnNftManagement.connect(firstAccount).mint(CAR, {value: ethers.utils.parseEther('0.01')});
                await earnNftManagement.connect(firstAccount).merge(1, 2);
                await earnNftManagement.setAllowed(owner.address, true);

                await earnNftManagement.generate(3, 500, false);
                await earnNftManagement.generate(3, 500, false);
                await earnNftManagement.generate(3, 800, false);

                const halfDay = 12 * 60 * 60;
                await network.provider.send("evm_increaseTime", [halfDay]);
                await network.provider.send("evm_mine");

                let power = await earnNftManagement.calculatePower(3);
                expect(power).to.be.equal(UNCOMMONPOWER * await earnNftManagement.powerMultiplier() / 2);
            });
        });

        describe("test claiming amount", function () {

            it("should be 4 GTT power when common wasted 1 times", async function () {
                const { earnNftManagement, firstAccount, owner, GTT } = await loadFixture(getContracts);
                await earnNftManagement.connect(firstAccount).mint(CAR, {value: ethers.utils.parseEther('0.01')});
                await earnNftManagement.setAllowed(owner.address, true);

                await earnNftManagement.generate(1, 900, false);

                await GTT.setAllowedMint(earnNftManagement.address, true);

                expect(await earnNftManagement.connect(firstAccount).getClaimAmount(1)).to.be.equal("4000000000000000000");
            });

        });

        describe("test claiming generated GTT", function () {
            it("should be 8 GTT power when uncommon wasted whole", async function () {
                const { earnNftManagement, firstAccount, owner, GTT } = await loadFixture(getContracts);
                await earnNftManagement.connect(firstAccount).mint(CAR, {value: ethers.utils.parseEther('0.01')});
                await earnNftManagement.connect(firstAccount).mint(CAR, {value: ethers.utils.parseEther('0.01')});
                await earnNftManagement.connect(firstAccount).merge(1, 2);
                await earnNftManagement.setAllowed(owner.address, true);

                await earnNftManagement.generate(3, 500, false);
                await earnNftManagement.generate(3, 500, false);
                await earnNftManagement.generate(3, 800, false);

                await GTT.setAllowedMint(earnNftManagement.address, true);
                await earnNftManagement.connect(firstAccount).claimGeneratedCoins(3);

                expect(await GTT.balanceOf(firstAccount.address)).to.be.equal("8000000000000000000");
            });

            it("should fail while calling non owner", async function () {
                const { earnNftManagement, firstAccount } = await loadFixture(getContracts);
                await earnNftManagement.connect(firstAccount).mint(CAR, {value: ethers.utils.parseEther('0.01')});
                await expect(earnNftManagement.claimGeneratedCoins(1))
                    .to.be.revertedWith("EarnNFTManagement: sender is not the owner of the token");
            });

            it("should be 2 GTT power when uncommon wasted half", async function () {
                const { earnNftManagement, firstAccount, owner, GTT } = await loadFixture(getContracts);
                await earnNftManagement.connect(firstAccount).mint(CAR, {value: ethers.utils.parseEther('0.01')});
                await earnNftManagement.setAllowed(owner.address, true);

                await earnNftManagement.generate(1, 450, false);

                await GTT.setAllowedMint(earnNftManagement.address, true);
                await earnNftManagement.connect(firstAccount).claimGeneratedCoins(1);

                expect(await GTT.balanceOf(firstAccount.address)).to.be.equal("2000000000000000000");
            });

            it("should be 8 GTT power when uncommon wasted twice", async function () {
                const { earnNftManagement, firstAccount, owner, GTT } = await loadFixture(getContracts);
                await earnNftManagement.connect(firstAccount).mint(CAR, {value: ethers.utils.parseEther('0.01')});
                await earnNftManagement.setAllowed(owner.address, true);

                await earnNftManagement.generate(1, 900, false);

                await GTT.setAllowedMint(earnNftManagement.address, true);
                await earnNftManagement.connect(firstAccount).claimGeneratedCoins(1);

                expect(await GTT.balanceOf(firstAccount.address)).to.be.equal("4000000000000000000");

                const halfDay = 24 * 60 * 60;
                await network.provider.send("evm_increaseTime", [halfDay]);
                await network.provider.send("evm_mine");
                await earnNftManagement.generate(1, 900, false);
                await earnNftManagement.connect(firstAccount).claimGeneratedCoins(1);

                expect(await GTT.balanceOf(firstAccount.address)).to.be.equal("8000000000000000000")
            });

            it("should be 6 GTT power when uncommon wasted 1.5 times", async function () {
                const { earnNftManagement, firstAccount, owner, GTT } = await loadFixture(getContracts);
                await earnNftManagement.connect(firstAccount).mint(CAR, {value: ethers.utils.parseEther('0.01')});
                await earnNftManagement.setAllowed(owner.address, true);

                await earnNftManagement.generate(1, 900, false);

                await GTT.setAllowedMint(earnNftManagement.address, true);
                await earnNftManagement.connect(firstAccount).claimGeneratedCoins(1);

                expect(await GTT.balanceOf(firstAccount.address)).to.be.equal("4000000000000000000");

                const halfDay = 12 * 60 * 60;
                await network.provider.send("evm_increaseTime", [halfDay]);
                await network.provider.send("evm_mine");
                await earnNftManagement.generate(1, 450, false);
                await earnNftManagement.connect(firstAccount).claimGeneratedCoins(1);

                expect(await GTT.balanceOf(firstAccount.address)).to.be.equal("6000000000000000000")
            });

            it("should generate whole when duration exceeds it's current limit", async function () {
                const { earnNftManagement, firstAccount, owner, GTT } = await loadFixture(getContracts);
                await earnNftManagement.connect(firstAccount).mint(CAR, {value: ethers.utils.parseEther('0.01')});
                await earnNftManagement.setAllowed(owner.address, true);

                await earnNftManagement.generate(1, 900, false);

                await GTT.setAllowedMint(earnNftManagement.address, true);
                await earnNftManagement.connect(firstAccount).claimGeneratedCoins(1);

                expect(await GTT.balanceOf(firstAccount.address)).to.be.equal("4000000000000000000");

                const halfDay = 12 * 60 * 60;
                await network.provider.send("evm_increaseTime", [halfDay]);
                await network.provider.send("evm_mine");
                await earnNftManagement.generate(1, 451, false);

                const nftInfo = await earnNftManagement.nftInfo(1);
                expect(nftInfo.powerLeft).to.be.equal(0);

            });

            it("should generate and claim when pass true in claim parameter", async function () {
                const { earnNftManagement, firstAccount, owner, GTT } = await loadFixture(getContracts);
                await earnNftManagement.connect(firstAccount).mint(CAR, {value: ethers.utils.parseEther('0.01')});
                await earnNftManagement.setAllowed(owner.address, true);
                await GTT.setAllowedMint(earnNftManagement.address, true);
                await earnNftManagement.generate(1, 900, true);
                expect(await GTT.balanceOf(firstAccount.address)).to.be.equal("4000000000000000000");
            });

        });
    });
});
