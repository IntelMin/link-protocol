// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./Link.sol";
import "./Card.sol";

contract LinkProtocol is Ownable, ReentrancyGuard {

  Link public linkToken;
  Card public cardNFT;

  struct StakeInfo {
    uint256 stakedAmount;
    uint256 timestamp;
    uint256 claimedAmount;
  }

  mapping(address => StakeInfo) private stakes;
  mapping(address => bool) public blacklist;

  uint256 public lockingTime = 365 days;  // 1 year
  bool public emergencyFlag;

  uint256 public cardRatio = 100;

  event NewStake(
    address staker,
    uint256 amount,
    uint256 timestamp
  );

  event NewClaim(
    address staker,
    uint256 amount,
    uint256 timestamp
  );

  event UnlockCompleted(
    address staker,
    uint256 amount,
    uint256 timestamp
  );

  modifier notBlacklisted(address addr) {
    require(!blacklist[addr], "The address is blacklisted");
    _;
  }

  constructor() {}

  function setLinkToken(address _linkToken) external onlyOwner {
    require(_linkToken != address(0), "Invalid token address");
    linkToken = Link(_linkToken);
  }

  function setLockingTime(uint256 _lockingTime) external onlyOwner {
    require(_lockingTime != 0, "Invalid locking time");
    lockingTime = _lockingTime;
  }

  function setBlacklist(address[] memory addrs, bool set) external onlyOwner {
    for (uint256 i = 0; i < addrs.length; i++) {
      blacklist[addrs[i]] = set;
    }
  }

  function setEmergencyFlag(bool flag) external onlyOwner {
    emergencyFlag = flag;
  }

  function setCardNFT(address _cardNFT) external onlyOwner {
    require(_cardNFT != address(0), "Invalid token address");
    cardNFT = Card(_cardNFT);
  }


  function setCardRatio(uint256 _cardRatio) external onlyOwner {
    require(_cardRatio != 0, "Invalid card ratio");
    cardRatio = _cardRatio;
  }

  function stake(uint256 amount) external notBlacklisted(msg.sender) {
    require(amount != 0, "Invalid amount");
    require(stakes[msg.sender].stakedAmount == 0, "Already staked by this address");

    linkToken.transferFrom(msg.sender, address(this), amount);
    stakes[msg.sender].stakedAmount = amount;
    stakes[msg.sender].timestamp = block.timestamp;

    emit NewStake(msg.sender, amount, block.timestamp);
  }
  
  function claim(address staker) external notBlacklisted(staker) nonReentrant {
    require(stakes[msg.sender].stakedAmount > 0, "This address is not a staker");

    uint256 claimableAmount = claimable(staker);
    require(claimableAmount > 0, "Nothing to claim");

    stakes[msg.sender].claimedAmount += claimableAmount;
    linkToken.transfer(staker, claimableAmount);
    
    if (stakes[msg.sender].claimedAmount == stakes[msg.sender].stakedAmount) {
      emit UnlockCompleted(staker, stakes[msg.sender].stakedAmount, block.timestamp);
      delete stakes[msg.sender];
    }

    emit NewClaim(staker, claimableAmount, block.timestamp);
  }

  function claimable(address staker) public view returns(uint256) {
    return vestedAmount(staker) - stakes[staker].claimedAmount;
  }

  function vestedAmount(address staker) internal view returns(uint256) {

    if (stakes[staker].stakedAmount == 0)
      return 0;

    if (emergencyFlag)
      return stakes[staker].stakedAmount;

    uint256 ellapsed = block.timestamp - stakes[staker].timestamp;
    if (ellapsed >= lockingTime)
      return stakes[staker].stakedAmount;

    uint256 oneMonth = 30.5 days;
    uint256 ellapsedMonth = ellapsed / oneMonth;    // Ellapsed months
    ellapsed = ellapsedMonth * oneMonth;            // Wrap ellapsed time to multiple of single month

    uint256 vested = stakes[staker].stakedAmount * ellapsed / lockingTime;
    return vested;
  }

  function createCard(uint256 tokenAmount) public notBlacklisted(msg.sender) returns(uint256) {
    require(tokenAmount != 0, "Invalid amount");

    linkToken.transferFrom(msg.sender, address(this), tokenAmount);

    uint256 initialPower = tokenAmount / cardRatio;
    uint256 cardId = cardNFT.safeMint(msg.sender, initialPower);

    return cardId;
  }

  function banishCard(uint256 cardId) public notBlacklisted(msg.sender) nonReentrant {
    
    uint256 power = cardNFT.getPower(cardId);

    cardNFT.banish(cardId);
    
    uint256 tokenReturn = power * cardRatio;

    uint256 linkBalance = linkToken.balanceOf(address(this));
    if (tokenReturn > linkBalance) {
      linkToken.mint(address(this), tokenReturn - linkBalance);
    }

    linkToken.transfer(msg.sender, tokenReturn);
  }
}