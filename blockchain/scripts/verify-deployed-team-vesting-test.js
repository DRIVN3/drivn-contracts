require("dotenv").config();

const hre = require("hardhat");

function sleep(s) {
  return new Promise(resolve => setTimeout(resolve, s*1000));
}

async function main() {
  const [deployer] = await ethers.getSigners();
  
    console.log("Deploying contracts with the account:", deployer.address);

    console.log("Account balance:", (await deployer.getBalance()).toString());

    const vestingWallet = await ethers.getContractFactory("VestingContract");
    const contract = await vestingWallet.attach(
        "0x2b76A3ED01Af443695Bf1965F1eF21D0Ef11f585"
    );
    
    let beneficiary = await contract.beneficiary();
    let startTimestamp = await contract.start();
    let duration = await contract.duration();
    let token = process.env.DRVNCOINADDRESS;

    try{
    await hre.run("verify:verify", {
        address: "0x2b76A3ED01Af443695Bf1965F1eF21D0Ef11f585",
        constructorArguments: [beneficiary, startTimestamp, duration, token],
    });
    console.log("Source Verified on team vesting");

    }
    catch (err) {
    console.log("error verify team vesting", err.message);
    }

    }
    main()
    .then(() => process.exit(0))
    .catch((error) => {
    console.error(error);
    process.exit(1);  
    });
