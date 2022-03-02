// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Link is ERC20, Ownable {

  address protocolAddress;

  modifier onlyOwnerOrProtocol() {
    require(protocolAddress == msg.sender || owner() == msg.sender, 
      "Link: msg.sender is not neither owner nor protocol");
    _;
  }

  constructor() ERC20("Link", "LINK") {}

  function mint(address to, uint256 amount) public onlyOwnerOrProtocol {
      _mint(to, amount);
  }

  function setProtocolAddress(address _protocolAddress) external onlyOwner {
    protocolAddress = _protocolAddress;
  }
}