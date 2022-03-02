const { ethers, upgrades } = require('hardhat');
const chai = require('chai');

const { expect } = chai;
const { BigNumber } = ethers;
//use custom BigNumber
chai.use(require('chai-bn')(BigNumber));
chai.use(require("chai-as-promised"));
chai.should();

const erc20_abi = require('erc-20-abi');

// Wallets
var owner, signer1, signer2, signer3;

// Contracts
var protocol, linkToken, cardNFT;

// Useful big numbers
const ethExp = BigNumber.from("10").pow(18);
const thousand = BigNumber.from("1000").mul(ethExp);
const ten = BigNumber.from("10").mul(ethExp);
const zero = BigNumber.from("0");

describe('Stake', async function () {

  it('deploys protocol', async function () {

    [owner, signer1, signer2, signer3] = await ethers.getSigners();

    const LinkProtocol = await ethers.getContractFactory('LinkProtocol');

    // protocol = await upgrades.deployProxy(LinkProtocol, { kind: 'uups' });
    protocol = await LinkProtocol.deploy();
    await protocol.deployed();    

    // console.log("Protocol deployed at:", protocol.address);
  });

  it('deploys LINK ERC-20 token', async function () {

    const Link = await ethers.getContractFactory('Link');

    linkToken = await Link.deploy();
    await linkToken.deployed();    

    // console.log("LINK deployed at:", linkToken.address);
  });

  it('deploys CARD ERC-721 NFT', async function () {

    const Card = await ethers.getContractFactory('Card');

    cardNFT = await Card.deploy();
    await cardNFT.deployed();    

    // console.log("CARD deployed at:", cardNFT.address);
  });

  it('set params to contracts', async function () {
    await linkToken.setProtocolAddress(protocol.address);
    await cardNFT.setProtocolAddress(protocol.address);

    await protocol.setLinkToken(linkToken.address);
    await protocol.setCardNFT(cardNFT.address);
  })
  
  it('could mint LINK', async function () {
    await linkToken.mint(signer1.address, thousand);
    await linkToken.mint(signer2.address, thousand);
    await linkToken.mint(signer3.address, thousand);
  })

  it('has correct LINK balances', async function () {    
    expect(await linkToken.balanceOf(signer1.address)).bignumber.equals(thousand);
    expect(await linkToken.balanceOf(signer2.address)).bignumber.equals(thousand);
    expect(await linkToken.balanceOf(signer3.address)).bignumber.equals(thousand);
  })

  it('could stake LINK', async function() {
    await linkToken.connect(signer1).approve(protocol.address, thousand);
    await protocol.connect(signer1).stake(thousand);
    expect(await linkToken.balanceOf(signer1.address)).bignumber.equals(zero);
  })

  it('could add blacklist', async function() {
    await protocol.setBlacklist([signer2.address], true);
  })
  
  it('blacklisted address can not use the protocol', async function() {
    await linkToken.connect(signer2).approve(protocol.address, thousand);
    await expect(
      protocol.connect(signer2).stake(thousand)
    ).to.be.revertedWith("The address is blacklisted");
  })

  const _250 = BigNumber.from("250").mul(ethExp); // Unlocked amount 3 months later. Pre-promised value for test purposes
  it('could claim unlocked tokens', async function() {
    await protocol.connect(signer1).claim(signer1.address);
    expect(await linkToken.balanceOf(signer1.address)).bignumber.equals(_250);
  })

  it('others can claim instead of staker', async function() {
    await linkToken.connect(signer3).approve(protocol.address, thousand);
    await protocol.connect(signer3).stake(thousand);
    expect(await linkToken.balanceOf(signer3.address)).bignumber.equals(zero);

    // Signer1 calls claim instead of Signer3
    await protocol.connect(signer1).claim(signer3.address);
    expect(await linkToken.balanceOf(signer3.address)).bignumber.equals(_250);
  })

  it('could claim all when emergency', async function() {
    await protocol.connect(owner).setEmergencyFlag(true);
    await protocol.connect(signer1).claim(signer1.address);
    expect(await linkToken.balanceOf(signer1.address)).bignumber.equals(thousand);
  })

})


describe('Card', async function () {

  it('could create a card by paying tokens', async function() {
    await linkToken.connect(signer1).approve(protocol.address, thousand);
    await expect(protocol.connect(signer1).createCard(thousand))
      .to.emit(protocol, 'CardCrated').withArgs(signer1.address, zero, ten);
    expect(await linkToken.balanceOf(signer1.address)).bignumber.equals(zero);
  })

  it('card could bring random values from Chainlink VRF', async function() {
    const info = await cardNFT.cardInfo(zero);
    console.log(info.valueSet);
    console.log(info.dailyGrow);
    expect(info.valueSet).to.be.equals(true);
    expect(info.dailyGrow).to.be.bignumber.greaterThan(zero);
  })

})