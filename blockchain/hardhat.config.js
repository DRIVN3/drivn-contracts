require("@nomicfoundation/hardhat-toolbox");
require('@openzeppelin/hardhat-upgrades');
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.15",
};

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
 module.exports = {
  solidity: "0.8.15",
  mocha: {
    timeout: 100000000
  },
  networks: {
    // rinkeby testnet 
    // rinkeby: {
    //   url: process.env.RINKEBY_URL,
    //   accounts: [process.env.ACCOUNT_PRIVATE_KEY]
    // },
    // polygon testnet mumbai
    // mumbai: {
    //   url: process.env.MUMBAI,
    //   accounts: [process.env.ACCOUNT_PRIVATE_KEY]
    // },
    // goerli testnet
    // goerli: {
    //   url: process.env.GOERLI_URL,
    //   accounts: [process.env.ACCOUNT_PRIVATE_KEY]
    // },
    // polygon mainnet
    // polygon: {
    //   url: process.env.POLYGON_URL,
    //   accounts: [process.env.ACCOUNT_PRIVATE_KEY]
    // },
    // bscTestChain testnet
  },
  gasReporter: {
    enabled: (process.env.REPORT_GAS) ? true : false,
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
  },
  etherscan: {
    apiKey: process.env.BSCSCAN_API_KEY
  },
  //plugins: ["solidity-coverage"],
};
