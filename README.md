# Protocol for locking & yield generation of LINK ERC-20 Token

The project consists of three main contracts: Protocol, LINK ERC-20, CARD ERC-721

LINK is deposited to be locked over one year and to be vested linearly every month.

CARD is issued by depositing some LINK, and protocol generates new LINK daily based on random params until the owner banish the card and withdraw LINK from protocol.

# Setting up Environment

Make a copy of .env.example, and rename it to `.env`.
Create an alchemy account and api key for deploying contracts. This rpc url is also used to fork rinkeby network to launch a local node for test purposes.
Write your mnemonic to deploy contracts to live networks.
Create an etherscan api key for verifying contracts on Etherscan.
```shell
RINKEBY_RPC_URL=https://eth-rinkeby.alchemyapi.io/v2/<YOUR ALCHEMY KEY>
MNEMONIC=abc123abc123abc123abc123abc123abc123abc123abc123abc123abc123abc1
ETHERSCAN_API_KEY=ABC123ABC123ABC123ABC123ABC123ABC1
```

Install npm packages.
```shell
npm install
```

# Local Test

Run a local node. It forks Rinkeby Testnet by default.
```shell
npx hardhat node
```

Run test codes.
```shell
npm run test:local
```

# Deploy

Deploy contracts to Rinkeby network.
```shell
hardhat run --network rinkeby scripts/deploy.js
```

# Verify

To try out Etherscan verification, you first need to deploy a contract to an Ethereum network that's supported by Etherscan, such as Rinkeby.

copy the deployment address and paste it in to replace `DEPLOYED_CONTRACT_ADDRESS` in this command:

```shell
npx hardhat verify --network rinkeby DEPLOYED_CONTRACT_ADDRESS
```
