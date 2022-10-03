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
        "0x963Ee4DF3e519a8076f9ca6003Fb0c557c9db4Cb"
    );
    
    let beneficiary = await contract.beneficiary();
    let startTimestamp = await contract.start();
    let duration = await contract.duration();
    let token = process.env.DRVN_COIN_ADDRESS;

    try{
    await hre.run("verify:verify", {
        address: "0x963Ee4DF3e519a8076f9ca6003Fb0c557c9db4Cb",
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
