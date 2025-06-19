const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("RocheValleyPresale", function () {
  let Token, Presale, token, presale;
  let owner, user, coldWallet;

  const MAX_SUPPLY = ethers.parseEther("1000000000");
  const TOKENS_PER_PHASE = ethers.parseEther("10000000");
  const TOTAL_TOKENS_FOR_SALE = ethers.parseEther("50000000");

  let phasePrices = [
    ethers.parseEther("0.0001"),
    ethers.parseEther("0.0002"),
    ethers.parseEther("0.0003"),
    ethers.parseEther("0.0004"),
    ethers.parseEther("0.0005"),
  ];
  let softCaps = [
    ethers.parseEther("100"),
    ethers.parseEther("200"),
    ethers.parseEther("300"),
    ethers.parseEther("400"),
    ethers.parseEther("500"),
  ];

  beforeEach(async function () {
    [owner, user, coldWallet] = await ethers.getSigners();

    Token = await ethers.getContractFactory("RocheValleyToken");
    token = await Token.deploy(coldWallet.address);
    await token.waitForDeployment();
    //np console.log(await token.getAddress());

    Presale = await ethers.getContractFactory("RocheValleyPresale");
    presale = await Presale.deploy(
      coldWallet.address,
      await token.getAddress(),
      phasePrices,
      softCaps
    );
    await presale.waitForDeployment();
     
    // Transfer 50 million tokens from cold wallet to presale contract
    await token.connect(coldWallet).transfer(presale.getAddress(), TOTAL_TOKENS_FOR_SALE);
  });

  it("should allow user to buy tokens and transfer them", async function () {
    const bnbToSend = ethers.parseEther("1");
    await presale.connect(user).buyTokens({ value: bnbToSend });

    const userBalance = await token.balanceOf(user.address);
    expect(userBalance).to.be.gt(0);
  });
 
  it("should prevent buying when paused", async function () {
    await presale.connect(owner).pause();
    await expect(
      presale.connect(user).buyTokens({ value: ethers.parseEther("1") })
    ).to.be.reverted;
  });

  
    it("should track BNB raised and tokens sold correctly", async function () {
    const bnbToSend = ethers.parseEther("2");
    await presale.connect(user).buyTokens({ value: bnbToSend });

    const tokensSold = await presale.tokensSold();
    const userBalance = await token.balanceOf(user.address);
    expect(tokensSold).to.equal(userBalance);
  });
  
  it("should allow manual phase advancement", async function () {
    await presale.connect(owner).advancePhaseManually();
    expect(await presale.currentPhaseIndex()).to.equal(1);
  });
  
  it("should allow cold wallet to be locked and prevent reset after lock", async function () {
    await presale.connect(owner).lockColdWallet();
    await expect(
      presale.connect(owner).setColdWallet(user.address)
    ).to.be.revertedWith("Cold wallet is locked");
  });

  
  it("should withdraw to cold wallet after lock", async function () {
    const bnbToSend = ethers.parseEther("1");
    await presale.connect(user).buyTokens({ value: bnbToSend });
    await presale.connect(owner).lockColdWallet();

    const beforeBal = await ethers.provider.getBalance(coldWallet.address);
    await presale.connect(owner).manualWithdrawToColdWallet();
    const afterBal = await ethers.provider.getBalance(coldWallet.address);
    expect(afterBal - beforeBal).to.be.gt(0);
  });
  
});
