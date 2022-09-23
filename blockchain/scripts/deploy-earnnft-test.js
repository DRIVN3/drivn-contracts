require("dotenv").config();

const hre = require("hardhat");

function sleep(s) {
  return new Promise(resolve => setTimeout(resolve, s*1000));
}

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying contracts with the account:", deployer.address);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  let earnNFT = await ethers.getContractFactory("EarnNFT");
  earnNFT = await earnNFT.deploy("test EarnNFT", "EarnNFT", "http://207.180.211.22:9999/earn-nft/", process.env.GTTADDRESS);
  await earnNFT.deployed()
  

  console.log("contract address", earnNFT.address);


  await sleep(120);
  
  try{
    await hre.run("verify:verify", {
      address: earnNFT.address,
      constructorArguments: ["test EarnNFT", "EarnNFT", "http://207.180.211.22:9999/earn-nft/", process.env.GTTADDRESS],
    });
    console.log("Source Verified on EarnNFT");

  }
  catch (err) {
    console.log("error verify EarnNFT", err.message);
  }
  
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);  
  });
