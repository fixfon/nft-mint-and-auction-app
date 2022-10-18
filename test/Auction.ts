import { expect } from 'chai';
import { ethers } from 'hardhat';
import { time, loadFixture } from '@nomicfoundation/hardhat-network-helpers';

describe('Auction', function () {
	async function deployFixture() {
		const [owner, otherAccount, otherAccount2] = await ethers.getSigners();

		const PatikaBears = await ethers.getContractFactory('PatikaBears');
		const patikaBears = await PatikaBears.deploy();
		const AuctionContract = await ethers.getContractFactory('Auction');
		const auction = await AuctionContract.deploy(patikaBears.address);

		await patikaBears.toggleIsPublicMintEnabled();

		// minting 2 tokens
		await patikaBears.publicSafeMint({
			value: ethers.utils.parseEther('0.02'),
		});
		await patikaBears.publicSafeMint({
			value: ethers.utils.parseEther('0.02'),
		});

		return {
			patikaBears,
			auction,
			owner,
			otherAccount,
			otherAccount2,
		};
	}

	describe('Deployment', function () {
		it('Should set the right owner', async function () {
			const { auction, owner } = await loadFixture(deployFixture);
			expect(await auction.owner()).to.equal(owner.address);
		});

		it('Should set the right token address', async function () {
			const { auction, patikaBears } = await loadFixture(deployFixture);
			expect(await auction.contractAddress()).to.equal(patikaBears.address);
		});
	});

	describe('Auction', function () {
		describe('Auction Creation', function () {
			it('Should create an auction', async function () {
				const { auction, patikaBears, owner } = await loadFixture(
					deployFixture
				);

				await patikaBears.approve(auction.address, 1);
				await auction.createAuction(
					1,
					ethers.utils.parseEther('0.1'),
					ethers.utils.parseEther('10')
				);
				const createdAuction = await auction.getAuction(0);
				expect(createdAuction.seller).to.equal(owner.address);
			});

			it('Should not create an auction if the token is not approved', async function () {
				const { auction } = await loadFixture(deployFixture);

				await expect(
					auction.createAuction(
						1,
						ethers.utils.parseEther('0.1'),
						ethers.utils.parseEther('10')
					)
				).to.be.revertedWith('ERC721: caller is not token owner nor approved');
			});

			it('Should increment the auction id', async function () {
				const { auction, patikaBears, owner } = await loadFixture(
					deployFixture
				);

				expect(await auction.getCurrentAuctionId()).to.equal(0);

				await patikaBears.approve(auction.address, 1);
				await auction.createAuction(
					1,
					ethers.utils.parseEther('0.1'),
					ethers.utils.parseEther('10')
				);
				expect(await auction.getCurrentAuctionId()).to.equal(1);
			});

			it('Should not create an auction if the token is already on auction', async function () {
				const { auction, patikaBears } = await loadFixture(deployFixture);

				await patikaBears.approve(auction.address, 1);
				await auction.createAuction(
					1,
					ethers.utils.parseEther('0.1'),
					ethers.utils.parseEther('10')
				);
				await expect(
					auction.createAuction(
						1,
						ethers.utils.parseEther('0.1'),
						ethers.utils.parseEther('10')
					)
				).to.be.revertedWith('ERC721: transfer from incorrect owner');
			});

			it('Should transfer the ownership of the token to this contract', async function () {
				const { auction, patikaBears } = await loadFixture(deployFixture);

				await patikaBears.approve(auction.address, 1);
				await auction.createAuction(
					1,
					ethers.utils.parseEther('0.1'),
					ethers.utils.parseEther('10')
				);

				expect(await patikaBears.ownerOf(1)).to.equal(auction.address);
			});
		});

		describe('Auction Bidding', function () {
			it('Should bid on an auction', async function () {
				const { auction, patikaBears, otherAccount } = await loadFixture(
					deployFixture
				);

				await patikaBears.approve(auction.address, 1);
				await auction.createAuction(
					1,
					ethers.utils.parseEther('0.1'),
					ethers.utils.parseEther('2')
				);

				await auction.connect(otherAccount).bid(0, {
					value: ethers.utils.parseEther('0.2'),
				});
				const createdAuction = await auction.getAuction(0);
				expect(createdAuction.highestBidder).to.equal(otherAccount.address);
				expect(createdAuction.highestBid).to.equal(
					ethers.utils.parseEther('0.2')
				);
			});

			it('Should not bid on an auction if the auction is not active', async function () {
				const auctionTime = 60 * 60 * 24 * 8;
				const { auction, patikaBears, otherAccount } = await loadFixture(
					deployFixture
				);

				await patikaBears.approve(auction.address, 1);
				await auction.createAuction(
					1,
					ethers.utils.parseEther('0.1'),
					ethers.utils.parseEther('2')
				);
				await time.increase(auctionTime);

				expect(
					auction.connect(otherAccount).bid(0, {
						value: ethers.utils.parseEther('0.2'),
					})
				).to.be.revertedWith('Auction has already ended.');
			});

			it('Should not bid on an auction if the bid amount is less than the minimum bid', async function () {
				const { auction, patikaBears, otherAccount } = await loadFixture(
					deployFixture
				);

				await patikaBears.approve(auction.address, 1);
				await auction.createAuction(
					1,
					ethers.utils.parseEther('0.1'),
					ethers.utils.parseEther('10')
				);
				await expect(
					auction.connect(otherAccount).bid(0, {
						value: ethers.utils.parseEther('0.01'),
					})
				).to.be.revertedWith('Bid amount must be greater than start price.');
			});

			it('Should not bid on an auction if the bid amount is less than the highest bid', async function () {
				const { auction, patikaBears, otherAccount, otherAccount2 } =
					await loadFixture(deployFixture);

				await patikaBears.approve(auction.address, 1);
				await auction.createAuction(
					1,
					ethers.utils.parseEther('0.1'),
					ethers.utils.parseEther('10')
				);
				await auction.connect(otherAccount).bid(0, {
					value: ethers.utils.parseEther('1'),
				});

				await expect(
					auction.connect(otherAccount2).bid(0, {
						value: ethers.utils.parseEther('0.5'),
					})
				).to.be.revertedWith('There is already a higher bid.');
			});

			it('Should not bid on an auction if the sender is the owner of the token', async function () {
				const { auction, patikaBears } = await loadFixture(deployFixture);

				await patikaBears.approve(auction.address, 1);
				await auction.createAuction(
					1,
					ethers.utils.parseEther('0.1'),
					ethers.utils.parseEther('10')
				);

				await expect(
					auction.bid(0, {
						value: ethers.utils.parseEther('1'),
					})
				).to.be.revertedWith('You cannot bid on your own auction.');
			});

			it('Should not accept the bid if the bid is buy now price', async function () {
				const { auction, patikaBears, otherAccount } = await loadFixture(
					deployFixture
				);

				await patikaBears.approve(auction.address, 1);
				await auction.createAuction(
					1,
					ethers.utils.parseEther('0.1'),
					ethers.utils.parseEther('2')
				);

				await expect(
					auction.connect(otherAccount).bid(0, {
						value: ethers.utils.parseEther('2'),
					})
				).to.be.revertedWith('Buy now price reached.');
			});

			it('Should buy now directly with the buy now price', async function () {
				const { auction, patikaBears, otherAccount } = await loadFixture(
					deployFixture
				);

				await patikaBears.approve(auction.address, 1);
				await auction.createAuction(
					1,
					ethers.utils.parseEther('0.1'),
					ethers.utils.parseEther('2')
				);

				await auction.connect(otherAccount).buyNow(0, {
					value: ethers.utils.parseEther('2'),
				});
				const createdAuction = await auction.getAuction(0);
				expect(createdAuction.highestBidder).to.equal(otherAccount.address);
				expect(await patikaBears.ownerOf(1)).to.equal(otherAccount.address);
			});
		});

		describe('End Auction', function () {
			it('Should end the auction and transfer the token to the highest bidder', async function () {
				const auctionTime = 60 * 60 * 24 * 8;
				const { auction, patikaBears, otherAccount } = await loadFixture(
					deployFixture
				);

				await patikaBears.approve(auction.address, 1);
				await auction.createAuction(
					1,
					ethers.utils.parseEther('0.1'),
					ethers.utils.parseEther('10')
				);
				await auction.connect(otherAccount).bid(0, {
					value: ethers.utils.parseEther('1'),
				});
				await time.increase(auctionTime);
				await auction.endAuction(0);

				const createdAuction = await auction.getAuction(0);
				expect(createdAuction.highestBidder).to.equal(otherAccount.address);
				expect(await patikaBears.ownerOf(1)).to.equal(otherAccount.address);
			});

			it('Should not end the auction if the auction time is not up', async function () {
				const auctionTime = 60 * 60 * 24 * 5;
				const { auction, patikaBears } = await loadFixture(deployFixture);

				await patikaBears.approve(auction.address, 1);
				await auction.createAuction(
					1,
					ethers.utils.parseEther('0.1'),
					ethers.utils.parseEther('10')
				);
				await time.increase(auctionTime);
				await expect(auction.endAuction(0)).to.be.revertedWith(
					'Auction has not ended yet. To cancel the auction, use cancelAuction function.'
				);
			});

			it('Should not end the auction if the sender is not the owner of the auction', async function () {
				const auctionTime = 60 * 60 * 24 * 8;
				const { auction, patikaBears, otherAccount } = await loadFixture(
					deployFixture
				);

				await patikaBears.approve(auction.address, 1);
				await auction.createAuction(
					1,
					ethers.utils.parseEther('0.1'),
					ethers.utils.parseEther('10')
				);
				await auction.connect(otherAccount).bid(0, {
					value: ethers.utils.parseEther('1'),
				});
				await time.increase(auctionTime);
				await expect(
					auction.connect(otherAccount).endAuction(0)
				).to.be.revertedWith('You are not the seller of this auction.');
			});

			it('Should refund the bids if the auction is not won', async function () {
				const auctionTime = 60 * 60 * 24 * 8;
				const { auction, patikaBears, otherAccount, otherAccount2 } =
					await loadFixture(deployFixture);

				await patikaBears.approve(auction.address, 1);
				await auction.createAuction(
					1,
					ethers.utils.parseEther('0.1'),
					ethers.utils.parseEther('10')
				);
				await auction.connect(otherAccount).bid(0, {
					value: ethers.utils.parseEther('1'),
				});
				await auction.connect(otherAccount2).bid(0, {
					value: ethers.utils.parseEther('2'),
				});
				await time.increase(auctionTime);
				await auction.endAuction(0);
				expect(await auction.bidList(0, otherAccount.address)).to.equal(
					ethers.utils.parseEther('1')
				);
				await auction.connect(otherAccount).refundBid(0);
				expect(await auction.bidList(0, otherAccount.address)).to.equal(0);
			});
		});

		describe('Cancel Auction', function () {
			it('Should cancel the auction and refund the token to the seller', async function () {
				const { auction, patikaBears } = await loadFixture(deployFixture);

				await patikaBears.approve(auction.address, 1);
				await auction.createAuction(
					1,
					ethers.utils.parseEther('0.1'),
					ethers.utils.parseEther('10')
				);
				await auction.cancelAuction(0);

				expect(await (await auction.getAuction(0)).isCanceled).to.equal(true);
				expect(await patikaBears.ownerOf(1)).to.equal(
					await (
						await auction.getAuction(0)
					).seller
				);
			});

			it('Should not cancel the auction if the sender is not the owner of the auction', async function () {
				const { auction, patikaBears, otherAccount } = await loadFixture(
					deployFixture
				);

				await patikaBears.approve(auction.address, 1);
				await auction.createAuction(
					1,
					ethers.utils.parseEther('0.1'),
					ethers.utils.parseEther('10')
				);
				await expect(
					auction.connect(otherAccount).cancelAuction(0)
				).to.be.revertedWith('You are not the seller of this auction.');
			});

			it('Bidder should refund the bid if the auction is canceled', async function () {
				const { auction, patikaBears, otherAccount } = await loadFixture(
					deployFixture
				);

				await patikaBears.approve(auction.address, 1);
				await auction.createAuction(
					1,
					ethers.utils.parseEther('0.1'),
					ethers.utils.parseEther('10')
				);
				await auction.connect(otherAccount).bid(0, {
					value: ethers.utils.parseEther('1'),
				});

				await auction.cancelAuction(0);
				expect(await auction.bidList(0, otherAccount.address)).to.equal(
					ethers.utils.parseEther('1')
				);
				await auction.connect(otherAccount).refundBid(0);
				expect(await auction.bidList(0, otherAccount.address)).to.equal(0);
			});
		});
	});
});
