require("dotenv").config();

const hre = require("hardhat");

function sleep(s) {
  return new Promise(resolve => setTimeout(resolve, s*1000));
}

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying contracts with the account:", deployer.address);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  let gtt = await ethers.getContractFactory("GTT");
  gtt = await gtt.deploy("test GTT", "GTT");
  await gtt.deployed()
  

  console.log("contract address", gtt.address);


  await sleep(120);
  
  const burnWallet = await gtt.burnWallet();

  try{
    await hre.run("verify:verify", {
      address: gtt.address,
      constructorArguments: ["test GTT", "GTT"],
    });
    console.log("Source Verified on gtt");

  }
  catch (err) {
    console.log("error verify gtt", err.message);
  }
  
  try{
    await hre.run("verify:verify", {
      address: burnWallet,
      constructorArguments: [gtt.address, deployer.address],
    });
    console.log("Source Verified on burnWallet");

  }
  catch (err) {
    console.log("error verify burnWallet", err.message);
  }

}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);  
  });
