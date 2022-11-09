import { AuctionContract } from '../../../contractAddress';
import auctionABI from '../../../artifacts/contracts/Auction.sol/Auction.json';
import { useAccount, useContractRead } from 'wagmi';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { ethers } from 'ethers';
import moment from 'moment';
import { useRouter } from 'next/router';
import { Item } from '../../types/Item';

const auctionContractConfig = {
  address: AuctionContract,
  abi: auctionABI.abi,
};

const UserAuctions = () => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    setCurrentTime(Date.now());
  }, []);

  const [auctionList, setAuctionList] = useState<Item[]>([]);
  const [currentTime, setCurrentTime] = useState<number>();
  const { address, isConnected } = useAccount();
  const router = useRouter();

  const { data: currentAuctionIdData } = useContractRead({
    ...auctionContractConfig,
    functionName: 'getCurrentAuctionId',
    watch: true,
  });

  const { data: userAuctionListData, refetch: refetchUserAuctionList } =
    useContractRead({
      address: AuctionContract,
      abi: [
        {
          inputs: [
            {
              internalType: 'address',
              name: '_seller',
              type: 'address',
            },
          ],
          name: 'getAuctionsOfSeller',
          outputs: [
            {
              components: [
                {
                  internalType: 'uint256',
                  name: 'id',
                  type: 'uint256',
                },
                {
                  internalType: 'address payable',
                  name: 'seller',
                  type: 'address',
                },
                {
                  internalType: 'uint256',
                  name: 'nftTokenId',
                  type: 'uint256',
                },
                {
                  internalType: 'address',
                  name: 'highestBidder',
                  type: 'address',
                },
                {
                  internalType: 'uint256',
                  name: 'highestBid',
                  type: 'uint256',
                },
                {
                  internalType: 'uint256',
                  name: 'startPrice',
                  type: 'uint256',
                },
                {
                  internalType: 'uint256',
                  name: 'buyNowPrice',
                  type: 'uint256',
                },
                {
                  internalType: 'uint256',
                  name: 'startedAt',
                  type: 'uint256',
                },
                {
                  internalType: 'uint256',
                  name: 'endAt',
                  type: 'uint256',
                },
                {
                  internalType: 'bool',
                  name: 'isSold',
                  type: 'bool',
                },
                {
                  internalType: 'bool',
                  name: 'isEnded',
                  type: 'bool',
                },
                {
                  internalType: 'bool',
                  name: 'isCanceled',
                  type: 'bool',
                },
              ],
              internalType: 'struct Auction.AuctionItem[]',
              name: '',
              type: 'tuple[]',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
      ],
      args: [address!],
      functionName: 'getAuctionsOfSeller',
      watch: true,
      enabled:
        !!currentAuctionIdData && currentAuctionIdData > 0 && isConnected,
      onSuccess: () => {
        if (userAuctionListData) {
          userAuctionListData.map((auctionItem) => {
            if (
              auctionList.find(
                (auction) => auction.auctionId === auctionItem.id.toString()
              )
            )
              return;
            const auctionItemData = {
              auctionId: auctionItem.id.toString(),
              nftTokenId: Number(auctionItem.nftTokenId.toString()),
              seller: auctionItem.seller,
              startPrice: ethers.utils.formatEther(
                auctionItem.startPrice.toString()
              ),
              highestBid: ethers.utils.formatEther(
                auctionItem.highestBid.toString()
              ),
              buyNowPrice: ethers.utils.formatEther(
                auctionItem.buyNowPrice.toString()
              ),
              endAt: Number(auctionItem.endAt.toString()),
              isSold: auctionItem.isSold,
              isCanceled: auctionItem.isCanceled,
              isEnded: auctionItem.isEnded,
            };
            setAuctionList((prev) => [...prev, auctionItemData]);
          });
        }
      },
    });

  useEffect(() => {
    if (isConnected && mounted && address) {
      refetchUserAuctionList();
    }
  }, [address]);

  const handleAuctionSelect = (id: string) => {
    router.push(`/auctions/${id}`);
  };

  return (
    <>
      {mounted && (
        <div className="flex flex-col items-center justify-center">
          <h1 className="mb-8 text-3xl font-bold text-highlight">
            Your Auctions
          </h1>
          <div className="mt-8 grid grid-cols-1 place-items-center gap-4 md:grid-cols-3">
            {auctionList.length > 0 &&
              auctionList.map((auction, index) => {
                return (
                  <div
                    onClick={() => handleAuctionSelect(auction.auctionId)}
                    key={index}
                    className="flex min-h-full min-w-[192px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-neutral bg-highlight p-3 backdrop-blur-lg transition-transform hover:scale-105"
                  >
                    <h2 className="mb-2 text-xl font-semibold text-white">
                      Patika Bears #{auction.nftTokenId}
                    </h2>
                    <Image
                      width={150}
                      height={150}
                      className="rounded-xl"
                      src={`/images/${auction.nftTokenId}.png`}
                    />
                    <p className="mt-2 text-lg text-neutral">
                      Highest Bid {auction.highestBid} ETH
                    </p>
                    <p className="text-lg text-neutral">
                      Buy Now {auction.buyNowPrice} ETH
                    </p>
                    {auction.isEnded ? (
                      <p className="mt-3 text-lg text-neutral">Ended</p>
                    ) : (
                      <>
                        <p className="mt-3 text-lg text-neutral">
                          Ends{' '}
                          {moment
                            .duration(
                              moment(auction.endAt, 'X').diff(currentTime)
                            )
                            .humanize(true)}
                        </p>
                        <button
                          className="mt-1 w-full rounded-lg bg-complementary py-1 text-lg font-bold text-neutral"
                          type="button"
                        >
                          DETAILS
                        </button>
                      </>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </>
  );
};

export default UserAuctions;
