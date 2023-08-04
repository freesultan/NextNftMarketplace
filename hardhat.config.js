require("@nomicfoundation/hardhat-toolbox");

const projectId = "e51a62f357964528bf92cfda0536daef";
const fs = require("fs");
const privateKey = fs.readFileSync(".secret").toString().trim() || "";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  networks: {
    hardhat: {
      chainId: 1337,
    },
    sepolia: {
      url: `https://sepolia.infura.io/v3/${projectId}`,
      accounts: [privateKey],
    },
    mainnet: {
      url: `https://sepolia.infura.io/v3/${projectId}`,
      accounts: [privateKey],
    },
  },
  solidity: "0.8.18",
};
