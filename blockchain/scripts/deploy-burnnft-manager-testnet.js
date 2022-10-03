require("dotenv").config();

const hre = require("hardhat");

function sleep(s) {
  return new Promise(resolve => setTimeout(resolve, s*1000));
}

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying contracts with the account:", deployer.address);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  let burnNFTManagement = await ethers.getContractFactory("BurnNFTManagement");
  burnNFTManagement = await upgrades.deployProxy(burnNFTManagement, [process.env.BURN_NFT_ADDRESS]);
  await burnNFTManagement.deployed();


  console.log("contract address", burnNFTManagement.address);


  await sleep(60);
  
  let implAddress = await upgrades.erc1967.getImplementationAddress(burnNFTManagement.address);

  console.log("implementation address", implAddress);

  try {
      await hre.run("verify:verify", {
          address: implAddress,
          constructorArguments: [],
      });
      console.log("Source Verified on BurnNFTManagement");

  } catch (err) {
      console.log("error verify BurnNFTManagement", err.message);
  }

}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);  
  });
