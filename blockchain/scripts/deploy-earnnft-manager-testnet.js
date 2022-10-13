require("dotenv").config();

const hre = require("hardhat");

function sleep(s) {
  return new Promise(resolve => setTimeout(resolve, s*1000));
}

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying contracts with the account:", deployer.address);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  let earnNFTManagement = await ethers.getContractFactory("EarnNFTManagement");
  earnNFTManagement = await upgrades.deployProxy(earnNFTManagement, [process.env.EARN_NFT_ADDRESS, process.env.GTT_ADDRESS, "http://207.180.211.22:9999/generated-token-gtt/"]);
  await earnNFTManagement.deployed();


  console.log("contract address", earnNFTManagement.address);


  await sleep(60);
  
  let implAddress = await upgrades.erc1967.getImplementationAddress(earnNFTManagement.address);

  console.log("implementation address", implAddress);

  try {
      await hre.run("verify:verify", {
          address: implAddress,
          constructorArguments: [],
      });
      console.log("Source Verified on EarnNFTManagement");

  } catch (err) {
      console.log("error verify EarnNFTManagement", err.message);
  }

}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);  
  });
