// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const { ethers, upgrades } = require('hardhat');

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  var protocol, linkToken, cardNFT;

  const [deployer] = await ethers.getSigners();
  console.log("Deploying from ", deployer.address);
  
  const LinkProtocol = await ethers.getContractFactory('LinkProtocol');
  protocol = await upgrades.deployProxy(LinkProtocol, { kind: 'uups' });
  await protocol.deployed();    
  console.log("Protocol deployed at:", protocol.address);
  
  const Link = await ethers.getContractFactory('Link');
  linkToken = await Link.deploy();
  await linkToken.deployed();
  console.log("LINK deployed at:", linkToken.address);

  const Card = await ethers.getContractFactory('Card');
  cardNFT = await Card.deploy("0x6168499c0cFfCaCD319c818142124B7A15E857ab");  // Rinkeby VRF Coordinator
  await cardNFT.deployed();    
  console.log("CARD deployed at:", cardNFT.address);

  await linkToken.setProtocolAddress(protocol.address);
  await cardNFT.setProtocolAddress(protocol.address);

  await protocol.setLinkToken(linkToken.address);
  await protocol.setCardNFT(cardNFT.address);

  console.log("Params are set successfully.");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
