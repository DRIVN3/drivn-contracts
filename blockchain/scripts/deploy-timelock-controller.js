require("dotenv").config();

const hre = require("hardhat");

function sleep(s) {
  return new Promise(resolve => setTimeout(resolve, s*1000));
}

async function main() {
  const [deployer] = await ethers.getSigners();
  
    console.log("Deploying contracts with the account:", deployer.address);

    console.log("Account balance:", (await deployer.getBalance()).toString());

    let timeLockController = await ethers.getContractFactory("TimelockController");
    timeLockController = await timeLockController.deploy(0, [deployer.address], [deployer.address]);
    await timeLockController.deployed()
  

    console.log("contract address", timeLockController.address);


    await sleep(120);

    try{
    await hre.run("verify:verify", {
        address: timeLockController.address,
        constructorArguments: [0, [deployer.address], [deployer.address]],
    });
    console.log("Source Verified on timeLockController");

    }
    catch (err) {
    console.log("error verify timeLockController", err.message);
    }

    }
    main()
    .then(() => process.exit(0))
    .catch((error) => {
    console.error(error);
    process.exit(1);  
    });
