require("dotenv").config();

const hre = require("hardhat");

function sleep(s) {
  return new Promise(resolve => setTimeout(resolve, s*1000));
}

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying contracts with the account:", deployer.address);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  // let APIConsumer = await ethers.getContractFactory("APIConsumer");
  
  // APIConsumer = await APIConsumer.deploy();
  // await APIConsumer.deployed()
  

  // console.log("contract address", APIConsumer.address);


  // await sleep(120);
  
  try{
    await hre.run("verify:verify", {
      address: "0xf470efb80e998d25a3cbb80a8961151db82be866",
      constructorArguments: ["0xdEb17d4A256929DA42A9E1756734754B29439dBd", "http://207.180.211.22:9999/generated-token-gtt/"],
    });
    console.log("Source Verified on APIConsumer");

  }
  catch (err) {
    console.log("error verify APIConsumer", err.message);
  }
  
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);  
  });
