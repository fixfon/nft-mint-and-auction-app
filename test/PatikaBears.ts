import { expect } from 'chai';
import { ethers } from 'hardhat';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';

describe('PatikaBears', function () {
  async function deployFixture() {
    // NFT contract is deployed once and used in every test to not repeat the same setup
    const [
      owner,
      otherAccount,
      otherAccount2,
      otherAccount3,
      otherAccount4,
      otherAccount5,
    ] = await ethers.getSigners();
    const PatikaBears = await ethers.getContractFactory('PatikaBears');
    const patikaBears = await PatikaBears.deploy();
    // We open the contract to the public minting
    await patikaBears.toggleIsPublicMintEnabled();

    return {
      patikaBears,
      owner,
      otherAccount,
      otherAccount2,
      otherAccount3,
      otherAccount4,
      otherAccount5,
    };
  }

  describe('Deployment', function () {
    it('Should set the right owner', async function () {
      const { patikaBears, owner } = await loadFixture(deployFixture);

      expect(await patikaBears.owner()).to.equal(owner.address);
    });

    it('Should set the right mint price', async function () {
      const { patikaBears } = await loadFixture(deployFixture);

      expect(await patikaBears.mintPrice()).to.equal(
        ethers.utils.parseEther('0.02')
      );
    });

    it('Should set the right max supply', async function () {
      const { patikaBears } = await loadFixture(deployFixture);

      expect(await patikaBears.maxSupply()).to.equal(20);
    });

    it('Should set the right token base URI', async function () {
      const { patikaBears } = await loadFixture(deployFixture);

      expect(await patikaBears.saleIsActive()).to.equal(true);
      expect(
        await patikaBears.publicSafeMint({
          value: ethers.utils.parseEther('0.02'),
        })
      ).to.emit(patikaBears, 'Transfer');
      expect(await patikaBears.tokenURI(1)).to.equal(
        'ipfs://QmcdPgTijqLUttbAQZzxe4ztQ9saoWCwQ5sEbzpqTG8sFh/1.json'
      );
    });
  });

  describe('Minting', function () {
    it('Should be mintable by everyone default', async function () {
      const { patikaBears } = await loadFixture(deployFixture);

      expect(await patikaBears.saleIsActive()).to.equal(true);
      expect(
        await patikaBears.publicSafeMint({
          value: ethers.utils.parseEther('0.02'),
        })
      ).to.emit(patikaBears, 'Transfer');
    });

    it('Should not be mintable by everyone if sale is not active', async function () {
      const { patikaBears } = await loadFixture(deployFixture);
      await patikaBears.toggleIsPublicMintEnabled();
      expect(await patikaBears.saleIsActive()).to.equal(false);
      await expect(
        patikaBears.publicSafeMint({ value: ethers.utils.parseEther('0.02') })
      ).to.be.revertedWith('Sale must be active to mint');
    });

    it('Should not be mintable by everyone if mint price is not paid', async function () {
      const { patikaBears } = await loadFixture(deployFixture);
      expect(await patikaBears.saleIsActive()).to.equal(true);
      await expect(
        patikaBears.publicSafeMint({ value: ethers.utils.parseEther('0.01') })
      ).to.be.revertedWith('Incorrect value');
    });

    it('Should not be mintable by everyone if max supply is reached', async function () {
      const {
        patikaBears,
        owner,
        otherAccount,
        otherAccount2,
        otherAccount3,
        otherAccount4,
        otherAccount5,
      } = await loadFixture(deployFixture);
      expect(await patikaBears.saleIsActive()).to.equal(true);
      const accArr = [
        otherAccount,
        otherAccount2,
        otherAccount3,
        otherAccount4,
      ];

      const promises = accArr.map(async (acc) => {
        for (let i = 0; i < 5; i++) {
          await patikaBears.connect(acc).publicSafeMint({
            value: ethers.utils.parseEther('0.02'),
          });
        }
      });

      await Promise.all(promises);

      // console.log(await patikaBears.balanceOf(otherAccount.address));
      // console.log(await patikaBears.balanceOf(otherAccount2.address));
      // console.log(await patikaBears.balanceOf(otherAccount3.address));
      // console.log(await patikaBears.balanceOf(otherAccount4.address));

      await expect(
        patikaBears.connect(otherAccount5).publicSafeMint({
          value: ethers.utils.parseEther('0.02'),
        })
      ).to.be.revertedWith('Sold out');
    });

    it('Every account should mint max 5 tokens', async function () {
      const { patikaBears } = await loadFixture(deployFixture);
      expect(await patikaBears.saleIsActive()).to.equal(true);
      for (let i = 0; i < 5; i++) {
        await patikaBears.publicSafeMint({
          value: ethers.utils.parseEther('0.02'),
        });
      }
      await expect(
        patikaBears.publicSafeMint({ value: ethers.utils.parseEther('0.02') })
      ).to.be.revertedWith('Exeeced max per wallet');
    });
  });

  describe('Withdrawals', function () {
    describe('Transfers', function () {
      it('Accounts should transfer tokens to each other', async function () {
        const { patikaBears, owner, otherAccount } = await loadFixture(
          deployFixture
        );
        expect(await patikaBears.saleIsActive()).to.equal(true);
        await patikaBears.publicSafeMint({
          value: ethers.utils.parseEther('0.02'),
        });
        await patikaBears['safeTransferFrom(address,address,uint256)'](
          owner.address,
          otherAccount.address,
          1
        );
        expect(await patikaBears.balanceOf(otherAccount.address)).to.equal(1);
      });
    });

    it('Owner should withdraw all balance', async function () {
      const { patikaBears } = await loadFixture(deployFixture);

      await patikaBears.withdraw();
      expect(await ethers.provider.getBalance(patikaBears.address)).to.equal(0);
    });
  });
});
