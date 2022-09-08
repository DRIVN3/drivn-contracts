require("dotenv").config();

const hre = require("hardhat");

function sleep(s) {
  return new Promise(resolve => setTimeout(resolve, s*1000));
}

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying contracts with the account:", deployer.address);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  let burnNft = await ethers.getContractFactory("BurnNFT");
  burnNft = await burnNft.deploy("test BurnNft", "BurnNft", "giorgi.com/", process.env.GTTADDRESS, process.env.BURNNFTADDRESS);
  await burnNft.deployed()
  

  console.log("contract address", burnNft.address);


  await sleep(120);
  
  try{
    await hre.run("verify:verify", {
      address: burnNft.address,
      constructorArguments: ["test BurnNft", "BurnNft", "giorgi.com/", process.env.GTTADDRESS, process.env.BURNNFTADDRESS],
    });
    console.log("Source Verified on BurnNft");

  }
  catch (err) {
    console.log("error verify BurnNft", err.message);
  }
  
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);  
  });
