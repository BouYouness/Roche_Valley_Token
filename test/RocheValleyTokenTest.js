const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("RocheValleyToken", function () {
  let Token, token, owner, addr1;
  const MAX_SUPPLY = ethers.parseEther("1000000000"); // 1B RV

  beforeEach(async function () {
    [owner, addr1, coldWallet] = await ethers.getSigners();
    Token = await ethers.getContractFactory("RocheValleyToken");
    token = await Token.deploy(coldWallet.address);
    await token.waitForDeployment();
  });

  it("Should deploy with max supply minted to cold wallet", async function () {
    expect(await token.totalSupply()).to.equal(MAX_SUPPLY);
    expect(await token.balanceOf(coldWallet.address)).to.equal(MAX_SUPPLY);
  });

  it("Should not allow minting beyond max supply", async function () {
    const mintAmount = ethers.parseEther("10");
    await expect(token.connect(owner).mint(owner.address, mintAmount)).to.be.revertedWith("Exceeds max supply");
  });

  it("Should allow token transfers when not paused", async function () {
    const transferAmount = ethers.parseEther("50");
    await token.connect(coldWallet).transfer(addr1.address, transferAmount);
    expect(await token.balanceOf(addr1.address)).to.equal(transferAmount);
  });

  it("Should block transfers when paused", async function () {
    await token.connect(owner).pause();
    await expect(
      token.connect(coldWallet).transfer(addr1.address, ethers.parseEther("1"))
    ).to.be.reverted;
  });

  it("Should burn tokens correctly", async function () {
    const burnAmount = ethers.parseEther("10");
    await token.connect(coldWallet).transfer(addr1.address, burnAmount);
    console.log(await token.balanceOf(addr1.address));
    await token.connect(addr1).burn(burnAmount);
    expect(await token.balanceOf(addr1.address)).to.equal(0);
    expect(await token.totalSupply()).to.equal(MAX_SUPPLY - burnAmount);
  });

  it("Should allow ownership transfer", async function () {
    await token.transferOwnership(addr1.address);
    expect(await token.owner()).to.equal(addr1.address);
  });

  it("Should allow renouncing ownership", async function () {
    await token.renounceOwnershipPostPresale();
    expect(await token.owner()).to.equal(ethers.ZeroAddress);
  });

});
