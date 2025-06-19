const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with:", deployer.address);

  // Cold wallet address (replace with your actual cold wallet for test)
  const coldWallet = deployer.address;

  //Deploy RocheValleyToken
  const Token = await ethers.getContractFactory("RocheValleyToken");
  const token = await Token.deploy(coldWallet);
  await token.waitForDeployment();
  console.log("RocheValleyToken deployed to:", await token.getAddress());

  //Presale Configs
  const phasePrices = [
    ethers.utils.parseUnits("0.0001", "ether"),
    ethers.utils.parseUnits("0.0002", "ether"),
    ethers.utils.parseUnits("0.0003", "ether"),
    ethers.utils.parseUnits("0.0004", "ether"),
    ethers.utils.parseUnits("0.0005", "ether"),
  ];

  const softCaps = [
    ethers.utils.parseUnits("10", "ether"),
    ethers.utils.parseUnits("20", "ether"),
    ethers.utils.parseUnits("30", "ether"),
    ethers.utils.parseUnits("40", "ether"),
    ethers.utils.parseUnits("50", "ether"),
  ];

  //Deploy RocheValleyPresale
  const Presale = await ethers.getContractFactory("RocheValleyPresale");
  const presale = await Presale.deploy(coldWallet,await token.getAddress(), phasePrices, softCaps);
  await presale.waitForDeployment();
  console.log("RocheValleyPresale deployed to:",await presale.getAddress());

  // Transfer Tokens from cold wallet to presale contract (just a simplpe interaction with deployed contracts)
  const tokens = ethers.utils.parseUnits("50000000", 18); // 50M RV
  const tx = await token.transfer(presale.address, tokens);
  await tx.wait();
  console.log("Transferred 50M RV tokens to presale contract");

  console.log("✅ Deployment finished");
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
