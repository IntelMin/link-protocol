require("dotenv").config();

require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-waffle");
require("solidity-coverage");
require('@nomiclabs/hardhat-ethers');
require('@openzeppelin/hardhat-upgrades');

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
  solidity: "0.8.7",
  networks: {
    rinkeby: {
      url: process.env.RINKEBY_RPC_URL || "",
      accounts: {
        mnemonic: process.env.MNEMONIC
      },
      chainId: 4
    },
    local: {
      url: "http://127.0.0.1:8545",
      // accounts: {
      //   mnemonic: process.env.MNEMONIC
      // }
    },
    hardhat: {
      forking: {
        url: process.env.RINKEBY_RPC_URL || "",
      },
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};
