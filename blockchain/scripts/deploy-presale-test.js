require("dotenv").config();

const hre = require("hardhat");

function sleep(s) {
  return new Promise(resolve => setTimeout(resolve, s*1000));
}

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying contracts with the account:", deployer.address);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  let PreSales = await ethers.getContractFactory("PreSales");
  PreSales = await PreSales.deploy(process.env.DRVN_COIN_ADDRESS);
  await PreSales.deployed()
  

  console.log("contract address", PreSales.address);


  await sleep(60);
  
  try{
    await hre.run("verify:verify", {
      address: PreSales.address,
      constructorArguments: [process.env.DRVN_COIN_ADDRESS],
    });
    console.log("Source Verified on PreSales");

  }
  catch (err) {
    console.log("error verify PreSales", err.message);
  }
  
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);  
  });
