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
      address: "0x5e033c9f5a6cdb852a6a0ee03f470f36cdcd6d4e",
      constructorArguments: ["0x713B1Ada985D7E06439f81F048d6C4ad2140a27d", "http://207.180.211.22:9999/generated-token-gtt/"],
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
