import { ethers } from 'ethers';
import moment from 'moment';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useContractRead } from 'wagmi';
import { AuctionContract } from '../../../contractAddress';

type Item = {
  auctionId: string;
  nftTokenId: number;
  highestBid: number;
  buyNowPrice: number;
  endAt: number;
  isSold: boolean;
  isCanceled: boolean;
  isEnded: boolean;
};

interface AuctionDetailsProps {
  item: Item;
  setItem: (item: Item) => void;
  routeId: string | undefined;
}

const AuctionDetails = ({ item, setItem, routeId }: AuctionDetailsProps) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    setCurrentTime(Date.now());
  }, []);

  const [currentTime, setCurrentTime] = useState<number>();

  const {
    data: auctionData,
    isError,
    isLoading,
    isSuccess,
    error,
  } = useContractRead({
    address: AuctionContract,
    abi: [
      {
        inputs: [
          {
            internalType: 'uint256',
            name: '_auctionId',
            type: 'uint256',
          },
        ],
        name: 'getAuction',
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
            internalType: 'struct Auction.AuctionItem',
            name: '',
            type: 'tuple',
          },
        ],
        stateMutability: 'view',
        type: 'function',
      },
    ],
    args: [ethers.BigNumber.from(Number(routeId || -1))],
    functionName: 'getAuction',
    watch: false,
    enabled: mounted && !!routeId,
    onSuccess: () => {
      if (auctionData) {
        const auctionItemData = {
          auctionId: auctionData.id.toString(),
          nftTokenId: Number(auctionData.nftTokenId.toString()),
          highestBid: Number(auctionData.highestBid.toString()),
          buyNowPrice: Number(auctionData.buyNowPrice.toString()),
          endAt: Number(auctionData.endAt.toString()),
          isSold: auctionData.isSold,
          isCanceled: auctionData.isCanceled,
          isEnded: auctionData.isEnded,
        };
        setItem(auctionItemData);
      }
    },
  });

  return (
    <div className="flex items-center justify-center">
      {mounted && (
        <>
          {isError && <div>{error?.message}</div>}
          {isLoading && <div>Loading...</div>}
          {isSuccess && !!item.nftTokenId && (
            <div
              className="mt-4 flex min-w-fit max-w-2xl
             flex-col items-center justify-center gap-8 rounded-lg border-4 border-highlight py-6 px-12 shadow-2xl md:flex-row md:px-20"
            >
              <Image
                width={250}
                height={250}
                className="rounded-xl"
                src={`/images/${item.nftTokenId}.png`}
              />
              <div className="flex h-[250px] flex-col items-center">
                <div className="justify-self-start">
                  <h2 className="text-2xl font-bold text-neutral">
                    PatikaBears #{item.nftTokenId}
                  </h2>
                </div>
                <div className="my-auto text-lg font-semibold text-neutral">
                  <h3 className="py-2 text-2xl">
                    Highest Bid:{' '}
                    {ethers.utils.formatEther(item.highestBid.toString())} ETH
                  </h3>
                  <h3 className="pb-4">
                    Buy Now:{' '}
                    {ethers.utils.formatEther(item.buyNowPrice.toString())} ETH
                  </h3>
                  {!item.isEnded && (
                    <h3>
                      Ends:{' '}
                      {moment
                        .duration(moment(item.endAt, 'X').diff(currentTime))
                        .humanize(true)}
                    </h3>
                  )}
                  <h3>Current Status: {item.isEnded ? 'Ended' : 'Active'}</h3>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AuctionDetails;
