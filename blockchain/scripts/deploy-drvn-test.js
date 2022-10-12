require("dotenv").config();

const hre = require("hardhat");

function sleep(s) {
  return new Promise(resolve => setTimeout(resolve, s*1000));
}

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying contracts with the account:", deployer.address);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  let DRVNCoin = await ethers.getContractFactory("DRVNCoin");
  DRVNCoin = await DRVNCoin.deploy("test DRVNCoin", "DRVNCoin", 50);
  await DRVNCoin.deployed()
  

  console.log("contract address", DRVNCoin.address);


  await sleep(120);
  
  try{
    await hre.run("verify:verify", {
      address: DRVNCoin.address,
      constructorArguments: ["test DRVNCoin", "DRVNCoin", 50],
    });
    console.log("Source Verified on DRVNCoin");

  }
  catch (err) {
    console.log("error verify DRVNCoin", err.message);
  }
  
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);  
  });
