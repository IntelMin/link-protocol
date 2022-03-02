// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./chainlink/VRFv2SubscriptionManager.sol";

contract Card is ERC721, ERC721Burnable, VRFv2SubscriptionManager {
    using Counters for Counters.Counter;

    enum Colors { White, Black, Red }
    enum Symbols { Star, Sword, Chicken, Flower }

    struct CardInfo {
        uint256 initialPower;
        uint256 mintedAt;
        Colors color;
        Symbols symbol;
        uint8 tierNumber;
        uint256 dailyGrow;
        bool valueSet;
    }

    mapping(uint256 => CardInfo) private _infos;
    mapping(uint256 => uint256) private _randomRequests;

    Counters.Counter private _tokenIdCounter;

    constructor() ERC721("Card", "CARD") {}

    function safeMint(address to, uint256 _initialPower) public onlyOwner returns(uint256) {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);

        _infos[tokenId].initialPower = _initialPower;
        _infos[tokenId].mintedAt = block.timestamp;
        
        uint256 requestId = requestRandomWords(3);
        _randomRequests[requestId] = tokenId;

        return tokenId;
    }

    function fulfillRandomWords(
      uint256 requestId,
      uint256[] memory randomWords
    ) internal override {
        uint256 tokenId = _randomRequests[requestId];
        _infos[tokenId].color = Colors(randomWords[0] % 3);
        _infos[tokenId].symbol = Symbols(randomWords[1] % 4);
        _infos[tokenId].tierNumber = uint8(randomWords[2] % 6);
        uint8 dailyPercent = (uint8(_infos[tokenId].color) + 1) + _infos[tokenId].tierNumber;

        Symbols __symbol = _infos[tokenId].symbol;
        if (__symbol == Symbols.Sword)
            dailyPercent += 2;
        else if (__symbol == Symbols.Chicken)
            dailyPercent += 4;
        else if (__symbol == Symbols.Flower)
            dailyPercent += 7;

        _infos[tokenId].dailyGrow = _infos[tokenId].initialPower * uint256(dailyPercent) / 100;

        _infos[tokenId].valueSet = true;
        delete _randomRequests[requestId];
    }

    function cardInfo(uint256 tokenId) public view returns(CardInfo memory) {
        require(_exists(tokenId), "info query for nonexistent token");
        return _infos[tokenId];
    }

    function getPower(uint256 tokenId) public view returns(uint256) {
        uint256 dayElapsed = (block.timestamp - _infos[tokenId].mintedAt) / 1 days;
        return _infos[tokenId].initialPower + _infos[tokenId].dailyGrow * dayElapsed;
    }

    function banish(uint256 tokenId) public onlyOwner {
        require(_isApprovedOrOwner(_msgSender(), tokenId), "caller is not owner nor approved");
        _burn(tokenId);

        delete _infos[tokenId];
    }
}