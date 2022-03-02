// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/mocks/VRFCoordinatorV2Mock.sol";

contract VRFCoordinatorV2Mock01 is VRFCoordinatorV2Mock {
    constructor() VRFCoordinatorV2Mock(0, 0) {}
}