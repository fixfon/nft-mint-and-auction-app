# Patika | Akbank Web 3 Practium Final Case

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
npx hardhat verify --network alchemy DEPLOYED_AUCTION_CONTRACT_ADDRESS
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
- [Alchemy](https://www.alchemy.com/) - Ethereum Node Provider
- RainbowKit - for Wallet access and logining
- [Etherscan](https://etherscan.io/) - for verifying the contracts

### Author & Contact

Created by **Fixfon** for [Patika.dev | Akbank Web 3 Practium](https://patika.dev/)
[Linkedin](https://www.linkedin.com/in/tmcinmt/)
[Github](https://github.com/fixfon)
[Twitter](https://twitter.com/fixfondev)
