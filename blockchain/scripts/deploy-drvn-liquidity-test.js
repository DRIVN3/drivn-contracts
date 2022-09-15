require("dotenv").config();

const hre = require("hardhat");

function sleep(s) {
  return new Promise(resolve => setTimeout(resolve, s*1000));
}

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying contracts with the account:", deployer.address);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  let DRVNLiquidity = await ethers.getContractFactory("DRVNLiquidity");
  DRVNLiquidity = await DRVNLiquidity.deploy(process.env.DRVNCOINADDRESS);
  await DRVNLiquidity.deployed()
  

  console.log("contract address", DRVNLiquidity.address);


  await sleep(120);
  
  try{
    await hre.run("verify:verify", {
      address: DRVNLiquidity.address,
      constructorArguments: [process.env.DRVNCOINADDRESS],
    });
    console.log("Source Verified on DRVNLiquidity");

  }
  catch (err) {
    console.log("error verify DRVNLiquidity", err.message);
  }
  
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);  
  });
