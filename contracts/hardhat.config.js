require("dotenv").config();
require("@nomicfoundation/hardhat-chai-matchers");
require("@nomiclabs/hardhat-etherscan");
require("hardhat-gas-reporter");
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version:"0.8.7",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    }
  },
  defaultNetwork:"holesky",
  networks:{
    hardhat: {
      chainId: 31337
    },
    Canxium:{
      chainId: 30203,
      url: "https://pr-rpc.canxium.net",
      accounts: [process.env.PRIVATE_KEY]
    },
    sepolia: {
      chainId: 11155111,
      url: "https://ethereum-sepolia-rpc.publicnode.com",
      accounts: [process.env.PRIVATE_KEY]
    },
    bnbtestnet:{
      chainId: 97,
      url: "https://data-seed-prebsc-1-s1.bnbchain.org:8545",
      accounts: [process.env.PRIVATE_KEY]
    },
    holesky: {
      chainId: 17000,
      url:"https://ethereum-holesky-rpc.publicnode.com",
      accounts: [process.env.PRIVATE_KEY]
    }
  },
  etherscan:{
    apiKey:"XBF9DP4SF4BNH3JNQM8MJW67ISSGU4UETJ"
  },
  verify:{
    apiUrl: "https://api.holesky.com/v1/verify",
    apiKey: "XBF9DP4SF4BNH3JNQM8MJW67ISSGU4UETJ"
  }
};
