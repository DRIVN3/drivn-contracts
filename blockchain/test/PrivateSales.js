
const {
    time,
    loadFixture,
    constants,
  } = require("@nomicfoundation/hardhat-network-helpers");
  const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
  const { expect } = require("chai");
let bigInt = require("big-integer");
const exp = require("constants");

const startTime = 360 * 24 * 60 * 60;
const vestingDuration = 360 * 24 * 60 * 60;
const coinPrice = 0.01;
const DECIMAL = BigInt("1000000000000000000")

async function deployPrivateSales() {
    const [owner, firstAccount, secondAccount] = await ethers.getSigners();

    // deploy DRVN
    let DRVN = await ethers.getContractFactory("DRVNCoin");
    let name = "test";
    let symbol = "testing";
    DRVN = await DRVN.deploy(name, symbol);

    let privateSales = await ethers.getContractFactory("PrivateSales");
    privateSales = await privateSales.deploy(DRVN.address);

    await DRVN.sendTokens("Private", privateSales.address, false);

    return { DRVN, name, symbol, owner, firstAccount, secondAccount, privateSales};
}

const startCoins = "375000000000000000000000000";

describe("Private Sales", function () {

    describe("test setting private sales", function () {
        it("Should be disabled private sale after contract creation", async function () {

            const {privateSales} = await loadFixture(deployPrivateSales);

            expect(await privateSales.privateSalesEnabled()).to.be.equal(false)
        });

        it("Should be proper coins after deployment and sending tokens via DRVN", async function () {

            const {privateSales, DRVN} = await loadFixture(deployPrivateSales);

            expect(await DRVN.balanceOf(privateSales.address)).to.be.equal(startCoins);
        });

        it("Should be able to enable private sale", async function () {

            const {privateSales} = await loadFixture(deployPrivateSales);

            await privateSales.setPrivateSalesEnabled(true);
            expect(await privateSales.privateSalesEnabled()).to.be.equal(true)
        });

        it("Should fail if private sale is enabled by not owner account", async function () {
            const {privateSales, firstAccount} = await loadFixture(deployPrivateSales);
            await expect(privateSales.connect(firstAccount).setPrivateSalesEnabled(true)).to.be.revertedWith("Ownable: caller is not the owner")
        });
    });

    describe("Test buy functionality", function () {
        it("Should fail when address not allowed to buy", async function () {

            const {privateSales} = await loadFixture(deployPrivateSales);

            await expect(privateSales.buy()).to.be.revertedWith("PrivateSales: address is not allowed to call this function")
        });

        it("Should fail when calling not turning on privateSalesEnabled", async function () {

            const { privateSales, owner } = await loadFixture(deployPrivateSales);
            await privateSales.setAllowed([owner.address], true);
            await expect(privateSales.buy()).to.be.revertedWith("PrivateSales: sale is not enabled")
        });

        it("Should fail for zero amount", async function () {

            const { privateSales, owner } = await loadFixture(deployPrivateSales);
            await privateSales.setPrivateSalesEnabled(true);
            await privateSales.setAllowed([owner.address], true);

            await expect(privateSales.buy()).to.be.revertedWith("PrivateSales: should not be zero amount")
        });

        it("Should create 1 vesting valet after successful buy 100 coins", async function () {
            const {privateSales, firstAccount, DRVN} = await loadFixture(deployPrivateSales);
            await privateSales.setPrivateSalesEnabled(true);
            await privateSales.setAllowed([firstAccount.address], true);

            await privateSales.connect(firstAccount).buy({value: ethers.utils.parseEther('1')})

            let contracts = await privateSales.getAccountVestingWallets(firstAccount.address);
            expect(contracts.length).to.be.equal(1)
            expect(await DRVN.balanceOf(contracts[0])).to.be.equal("100000000000000000000");
        });

        it("Should be released zero if release is not called", async function () {

            const {privateSales, firstAccount, DRVN} = await loadFixture(deployPrivateSales);
            await privateSales.setPrivateSalesEnabled(true);
            await privateSales.setAllowed([firstAccount.address], true);
            await privateSales.connect(firstAccount).buy({value: ethers.utils.parseEther('1')})

            let contracts = await privateSales.getAccountVestingWallets(firstAccount.address);

            const vestingWallet = await ethers.getContractFactory("VestingContract");
            const contract = await vestingWallet.attach(
                contracts[0]
            );

            // release amount should be 0
            const released = await contract.functions['released()']();
            expect(released[0]).to.be.equal(0);
        });

        it("Should be released half(50 tokens) when start date reaches", async function () {

            const {privateSales, firstAccount, DRVN} = await loadFixture(deployPrivateSales);
            await privateSales.setPrivateSalesEnabled(true);
            await privateSales.setAllowed([firstAccount.address], true);
            await privateSales.connect(firstAccount).buy({value: ethers.utils.parseEther('1')})

            let contracts = await privateSales.getAccountVestingWallets(firstAccount.address);

            const vestingWallet = await ethers.getContractFactory("VestingContract");
            const contract = await vestingWallet.attach(
                contracts[0]
            );

            // increase time and reach start date
            await network.provider.send("evm_increaseTime", [startTime + vestingDuration / 2])

            await contract.functions['release()']();

            let released = await contract.functions['released()']();
            released = released[0]

            let expectedTokensAmount = DECIMAL * BigInt(50);
            expect(await DRVN.balanceOf(firstAccount.address)).to.be.equal(expectedTokensAmount.toString());

        });

        it("Should be released 100 * 1/5 tokens after pass 360 + 360 * 1/5 time", async function () {

            const {privateSales, firstAccount, DRVN} = await loadFixture(deployPrivateSales);
            await privateSales.setPrivateSalesEnabled(true);
            await privateSales.setAllowed([firstAccount.address], true);
            await privateSales.connect(firstAccount).buy({value: ethers.utils.parseEther('1')})

            let contracts = await privateSales.getAccountVestingWallets(firstAccount.address);

            const vestingWallet = await ethers.getContractFactory("VestingContract");
            const contract = await vestingWallet.attach(
                contracts[0]
            );

            // increase time and reach start date
            await network.provider.send("evm_increaseTime", [startTime + vestingDuration / 5])

            await contract.functions['release()']();

            let released = await contract.functions['released()']();
            released = released[0]

            let expectedTokensAmount = DECIMAL * BigInt(20);
            expect(await DRVN.balanceOf(firstAccount.address)).to.be.equal(expectedTokensAmount.toString());

        });

        it("Should be released whole tokens after pass 360 + 360 days", async function () {

            const {privateSales, firstAccount, DRVN} = await loadFixture(deployPrivateSales);
            await privateSales.setPrivateSalesEnabled(true);
            await privateSales.setAllowed([firstAccount.address], true);
            await privateSales.connect(firstAccount).buy({value: ethers.utils.parseEther('1')})

            let contracts = await privateSales.getAccountVestingWallets(firstAccount.address);

            const vestingWallet = await ethers.getContractFactory("VestingContract");
            const contract = await vestingWallet.attach(
                contracts[0]
            );

            // increase time and reach start date
            await network.provider.send("evm_increaseTime", [startTime + vestingDuration])

            await contract.functions['release()']();

            let released = await contract.functions['released()']();
            released = released[0]

            let expectedTokensAmount = DECIMAL * BigInt(100);
            expect(await DRVN.balanceOf(firstAccount.address)).to.be.equal(expectedTokensAmount.toString());

        });

        it("Should be released zero tokens before pass < 360 days", async function () {

            const {privateSales, firstAccount, DRVN} = await loadFixture(deployPrivateSales);
            await privateSales.setPrivateSalesEnabled(true);
            await privateSales.setAllowed([firstAccount.address], true);
            await privateSales.connect(firstAccount).buy({value: ethers.utils.parseEther('1')})

            let contracts = await privateSales.getAccountVestingWallets(firstAccount.address);

            const vestingWallet = await ethers.getContractFactory("VestingContract");
            const contract = await vestingWallet.attach(
                contracts[0]
            );

            // increase time and reach start date
            await network.provider.send("evm_increaseTime", [startTime - 1])

            await contract.functions['release()']();

            let released = await contract.functions['released()']();
            released = released[0]

            expect(await DRVN.balanceOf(firstAccount.address)).to.be.equal(0);

        });

    });
});

describe("Test withdraw", function () {


    it("Should fail if withdraw is called by not owner account", async function () {

        const {privateSales, firstAccount} = await loadFixture(deployPrivateSales);
        await expect(privateSales.connect(firstAccount).withdraw()).to.be.revertedWith("Ownable: caller is not the owner")

    });

    it("Should withdraw all coin if is called by owner account", async function () {
        const {privateSales, firstAccount} = await loadFixture(deployPrivateSales);

        await privateSales.setPrivateSalesEnabled(true);
        await privateSales.setAllowed([firstAccount.address], true);

        await privateSales.connect(firstAccount).buy({value: ethers.utils.parseEther('1')})

        expect(await ethers.provider.getBalance(privateSales.address)).to.be.equal(ethers.utils.parseEther('1'))
        await privateSales.withdraw();
        expect(await ethers.provider.getBalance(privateSales.address)).to.be.equal(0)

    });
});

