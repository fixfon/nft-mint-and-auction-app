import { ethers } from 'hardhat';
import { PatikaBearsContract } from '../contractAddress';

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log('Deploying contracts with the account:', deployer.address);

  console.log('Account balance:', (await deployer.getBalance()).toString());

  const Auction = await ethers.getContractFactory('Auction');
  const auction = await Auction.deploy(PatikaBearsContract);

  console.log('Auction address:', auction.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
