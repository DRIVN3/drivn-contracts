require("dotenv").config();

const hre = require("hardhat");

function sleep(s) {
  return new Promise(resolve => setTimeout(resolve, s*1000));
}

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying contracts with the account:", deployer.address);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  let privateSales = await ethers.getContractFactory("PrivateSales");
  privateSales = await privateSales.deploy(process.env.DRVNCOINADDRESS);
  await privateSales.deployed()
  

  console.log("contract address", privateSales.address);


  await sleep(60);
  
  try{
    await hre.run("verify:verify", {
      address: privateSales.address,
      constructorArguments: [process.env.DRVNCOINADDRESS],
    });
    console.log("Source Verified on privateSales");

  }
  catch (err) {
    console.log("error verify privateSales", err.message);
  }
  
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);  
  });
