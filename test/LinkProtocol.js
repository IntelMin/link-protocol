const { ethers, upgrades } = require('hardhat');
const chai = require('chai');

const { expect } = chai;
const { BigNumber } = ethers;
//use custom BigNumber
chai.use(require('chai-bn')(BigNumber));
chai.use(require("chai-as-promised"));
chai.should();

describe('LinkProtocol', async function () {

  var deployer, signer1, signer2, signer3;
  var protocol, linkToken, cardNFT;
  const ethExp = BigNumber.from("10").pow(18);

  it('deploys protocol', async function () {

    [deployer, signer1, signer2, signer3] = await ethers.getSigners();
    console.log("Deplopying from", deployer.address);

    const LinkProtocol = await ethers.getContractFactory('LinkProtocol');

    // protocol = await upgrades.deployProxy(LinkProtocol, { kind: 'uups' });
    protocol = await LinkProtocol.deploy();
    await protocol.deployed();    

    console.log("Protocol deployed at:", protocol.address);
  });

  it('deploys LINK ERC-20 token', async function () {

    const Link = await ethers.getContractFactory('Link');

    // protocol = await upgrades.deployProxy(LinkProtocol, { kind: 'uups' });
    linkToken = await Link.deploy();
    await linkToken.deployed();    

    console.log("LINK deployed at:", linkToken.address);
  });

  it('deploys CARD ERC-721 NFT', async function () {

    const Card = await ethers.getContractFactory('Card');

    // protocol = await upgrades.deployProxy(LinkProtocol, { kind: 'uups' });
    cardNFT = await Card.deploy();
    await cardNFT.deployed();    

    console.log("CARD deployed at:", cardNFT.address);
  });

  it('set params to contracts', async function () {
    await linkToken.setProtocolAddress(protocol.address);
    await cardNFT.setProtocolAddress(protocol.address);

    await protocol.setLinkToken(linkToken.address);
    await protocol.setCardNFT(cardNFT.address);
  })
  
  const thousand = BigNumber.from("1000").mul(ethExp);
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

})