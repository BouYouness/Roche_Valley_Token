require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config(); // Load .env variables

const { SECRET_KEY, BNB_URL } = process.env;

module.exports = {
  solidity: "0.8.28",
  networks: {
    bscTestnet: {
      url: BNB_URL,
      accounts: [SECRET_KEY],
      chainId: 97,
    },
  },
};

