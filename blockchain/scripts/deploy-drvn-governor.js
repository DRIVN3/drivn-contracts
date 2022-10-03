require("dotenv").config();

const hre = require("hardhat");

function sleep(s) {
  return new Promise(resolve => setTimeout(resolve, s*1000));
}

async function main() {
  const [deployer] = await ethers.getSigners();
  
    console.log("Deploying contracts with the account:", deployer.address);

    console.log("Account balance:", (await deployer.getBalance()).toString());

    let MyGovernor = await ethers.getContractFactory("MyGovernor");
    MyGovernor = await MyGovernor.deploy(process.env.DRVN_COIN_ADDRESS, process.env.TIME_LOCK_ADDRESS);
    await MyGovernor.deployed()
  

    console.log("contract address", MyGovernor.address);


    await sleep(60);

    try{
    await hre.run("verify:verify", {
        address: MyGovernor.address,
        constructorArguments: [process.env.DRVN_COIN_ADDRESS, process.env.TIME_LOCK_ADDRESS],
    });
    console.log("Source Verified on MyGovernor");

    }
    catch (err) {
    console.log("error verify MyGovernor", err.message);
    }

    }
    main()
    .then(() => process.exit(0))
    .catch((error) => {
    console.error(error);
    process.exit(1);  
    });
