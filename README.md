# Patika | Akbank Web 3 Practium Final Case

### [>>LIVE DEMO<<](https://patikabears-nft-mint-auction.vercel.app/)

![](demo.gif)

[Demo video on YouTube](https://www.youtube.com/watch?v=iBkUZXmAE48)

Note: This is only a demo. The contract is deployed on the Goerli test network. Therefore, you can mint and create auctions only on the testnet.

## Feature Tab

| Feature        | Description                                  |
| -------------- | -------------------------------------------- |
| Mint NFT       | Mint NFT with a unique name and description. |
| Create Auction | Create an auction for your NFT.              |
| Bid            | Bid on an auction.                           |
| Buy Now        | Buy the NFT with paying full amount.         |
| Refund         | Withdraw your bid.                           |
| End Auction    | End the auction.                             |
| Cancel Auction | Cancel your auction before it ends.          |
| Withdraw Funds | Withdraw your funds.                         |

## NFT Minting & Auction Platform

This project is a NFT minting and auction platform. the PatikaBears NFT collection is for Auctioning and it is mintable by everyone with 0.02ETH. After minting a NFT you can auction your NFTs, or you can bid or buy other auctions. It is a decentralized application that runs on the Ethereum blockchain. It is built with Solidity, NextJS. It is compiled and tested with Hardhat, Ethers, Waffle, and Hardhat toolkits.

### Roadmap & Progress

- [x] 1. Create example NFTs and upload them to IPFS
- [x] 2. Create a new ERC721 contract and test it.
- [x] 3. Create Auction contract and test it.
- [x] 4. Create folder structure for frontend.
- [x] 5. Create tests for the contracts.
- [x] 6. Deploy the contracts to the testnet.
- [x] 7. Interact with the contracts via frontend.
- [x] 8. Create UI for minting NFTs.
- [x] 9. Create UI for viewing NFTs.
- [x] 10. Create UI for auctioning and bidding NFTs.
- [x] 11. Create UI for viewing auctions and biddings.
- [x] 12. Fix bugs and fix wagmi query bugs.
- [x] 13. Re-create all the UI and refactor the code.
- [x] 14. Add refund, cancel, end auction features.

## User Guide

```bash
# Clone the repository
git clone https://github.com/fixfon/nft-mint-and-auction-app.git

# Go inside the directory
cd nft-mint-and-auction-app

# Install dependencies
npm install
```

### Put Environment Variables

Create a `.env` file in the root directory and copy environment variables from .env-example file.

```bash
ALCHEMY_GOERLI_ENDPOINT=
DEPLOYER_PRIVATE_KEY=
ALCHEMY_API_KEY=
ETHERSCAN_API_KEY=
```

### How to compile the contracts

You can compile the contracts with the following command:

```bash
npx hardhat compile
```

### How to run the tests

After compiling the contracts, you can run the tests with the following command:

```bash
npx hardhat test ./test/PatikaBears.ts
npx hardhat test ./test/Auction.ts
```

### How to deploy the contracts

```bash
npx hardhat run ./scripts/deploy.ts --network alchemy
```

### How to verify the contracts

```bash
npx hardhat verify --network alchemy DEPLOYED_NFT_CONTRACT_ADDRESS
npx hardhat verify --network alchemy DEPLOYED_AUCTION_CONTRACT_ADDRESS "DEPLOYED_NFT_CONTRACT_ADDRESS"
```

### How to run the project

```bash
npm run dev
```

### Used Technologies

- [Solidity](https://docs.soliditylang.org/en/v0.8.9/) - Smart Contract Programming Language
- [Hardhat](https://hardhat.org/) - Ethereum development environment
- [Ethers](https://docs.ethers.io/v5/) - Ethereum JavaScript API
- [Waffle](https://ethereum-waffle.readthedocs.io/en/latest/) - Ethereum smart contract testing framework
- [NextJS](https://nextjs.org/) - Frontend
- [TailwindCSS](https://tailwindcss.com/) - CSS Framework
- [IPFS](https://ipfs.io/) - File storage
- [Moralis](https://moralis.io/) - Backend as a Service for Interacting with Contracts
- [Alchemy](https://www.alchemy.com/) - Ethereum Node Provider
- RainbowKit - for Wallet access and logining
- [Etherscan](https://etherscan.io/) - for verifying the contracts

### Author & Contact

Created by **Fixfon** for [Patika.dev | Akbank Web 3 Practium](https://patika.dev/)

[Linkedin](https://www.linkedin.com/in/tmcinmt/)

[Github](https://github.com/fixfon)

[Twitter](https://twitter.com/fixfondev)

Discord: fixfon#1111
