
const {
    time,
    loadFixture,
    constants,
  } = require("@nomicfoundation/hardhat-network-helpers");
  const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
  const { expect } = require("chai");
let bigInt = require("big-integer");
const exp = require("constants");

const unlockTime = 7 * 24 * 60 * 60;
const coinPrice = 0.01;
const DECIMAL = BigInt("1000000000000000000")

async function deployPreSales() {
    const [owner, firstAccount, secondAccount] = await ethers.getSigners();

    // deploy DRVN
    let DRVN = await ethers.getContractFactory("DRVNCoin");
    let name = "test";
    let symbol = "testing";
    DRVN = await DRVN.deploy(name, symbol, 35);

    let preSales = await ethers.getContractFactory("PreSales");
    preSales = await preSales.deploy(DRVN.address);

    await DRVN.sendTokens("PreSale", preSales.address, false);

    return { DRVN, name, symbol, owner, firstAccount, secondAccount, preSales};
}

const startCoins = "825000000000000000000000000";

describe("Public Sales", function () {

    describe("test setting public sales", function () {
        it("Should be disabled public sale after contract creation", async function () {

            const {preSales} = await loadFixture(deployPreSales);

            expect(await preSales.preSalesEnabled()).to.be.equal(false)
        });

        it("Should be proper coins after deployment and sending tokens via DRVN", async function () {

            const {preSales, DRVN} = await loadFixture(deployPreSales);

            expect(await DRVN.balanceOf(preSales.address)).to.be.equal(startCoins);
        });

        it("Should be able to enable public sale", async function () {

            const {preSales} = await loadFixture(deployPreSales);

            await preSales.setPreSalesEnabled(true);
            expect(await preSales.preSalesEnabled()).to.be.equal(true)
        });

        it("Should fail if public sale is enabled by not owner account", async function () {
            const {preSales, firstAccount} = await loadFixture(deployPreSales);
            await expect(preSales.connect(firstAccount).setPreSalesEnabled(true)).to.be.revertedWith("Ownable: caller is not the owner")
        });
    });

    describe("Test buy functionality", function () {
        it("Should fail when calling not turning on preSalesEnabled", async function () {

            const { preSales, owner } = await loadFixture(deployPreSales);
            
            await expect(preSales.buy()).to.be.revertedWith("PreSales: sale is not enabled")
        });

        it("Should fail for zero amount", async function () {

            const { preSales, owner } = await loadFixture(deployPreSales);
            await preSales.setPreSalesEnabled(true);

            await expect(preSales.buy()).to.be.revertedWith("PreSales: should not be zero amount")
        });

        it("Should create 1 lock contract after successful buy 100 coins", async function () {
            const {preSales, firstAccount, DRVN} = await loadFixture(deployPreSales);
            await preSales.setPreSalesEnabled(true);

            await preSales.connect(firstAccount).buy({value: ethers.utils.parseEther('1')})

            let contracts = await preSales.getAccountLockContracts(firstAccount.address);
            expect(contracts.length).to.be.equal(1)
            expect(await DRVN.balanceOf(contracts[0])).to.be.equal("100000000000000000000");
        });

        it("Should be released whole tokens after pass 7 days", async function () {

            const {preSales, firstAccount, DRVN} = await loadFixture(deployPreSales);
            await preSales.setPreSalesEnabled(true);
            await preSales.connect(firstAccount).buy({value: ethers.utils.parseEther('1')})

            let contracts = await preSales.getAccountLockContracts(firstAccount.address);

            const tokenTimelock = await ethers.getContractFactory("TokenTimelock");
            const contract = await tokenTimelock.attach(
                contracts[0]
            );

            // increase time and reach start date
            await network.provider.send("evm_increaseTime", [unlockTime])

            await contract.functions['release()']();

            let expectedTokensAmount = DECIMAL * BigInt(100);
            expect(await DRVN.balanceOf(firstAccount.address)).to.be.equal(expectedTokensAmount.toString());

        });

        it("Should fail while calling before 7 days", async function () {

            const {preSales, firstAccount, DRVN} = await loadFixture(deployPreSales);
            await preSales.setPreSalesEnabled(true);
            await preSales.connect(firstAccount).buy({value: ethers.utils.parseEther('1')})

            let contracts = await preSales.getAccountLockContracts(firstAccount.address);

            const tokenTimelock = await ethers.getContractFactory("TokenTimelock");
            const contract = await tokenTimelock.attach(
                contracts[0]
            );

            await expect(contract.functions['release()']()).to.be.
                revertedWith("TokenTimelock: current time is before release time");
        });
    });
});

describe("Test withdraw", function () {


    it("Should fail if withdraw is called by not owner account", async function () {

        const {preSales, firstAccount} = await loadFixture(deployPreSales);
        await expect(preSales.connect(firstAccount).withdraw()).to.be.revertedWith("Ownable: caller is not the owner")

    });

    it("Should withdraw all coin if is called by owner account", async function () {
        const {preSales, firstAccount} = await loadFixture(deployPreSales);

        await preSales.setPreSalesEnabled(true);

        await preSales.connect(firstAccount).buy({value: ethers.utils.parseEther('1')})

        expect(await ethers.provider.getBalance(preSales.address)).to.be.equal(ethers.utils.parseEther('1'))
        await preSales.withdraw();
        expect(await ethers.provider.getBalance(preSales.address)).to.be.equal(0)

    });
});

