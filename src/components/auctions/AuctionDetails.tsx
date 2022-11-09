import { ethers } from 'ethers';
import moment from 'moment';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useAccount, useContractRead } from 'wagmi';
import { AuctionContract } from '../../../contractAddress';
import { Item } from '../../types/Item';
import BidAuction from './BidAuction';
import BuyNowAuction from './BuyNowAuction';
import CancelAuction from './CancelAuction';
import EndAuction from './EndAuction';
import RefundBid from './RefundBid';

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

  const [currentTime, setCurrentTime] = useState<number>(0);
  const { address } = useAccount();
  const router = useRouter();

  const {
    data: auctionData,
    isError,
    isLoading,
    isSuccess,
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
    watch: true,
    enabled: mounted && !!routeId,
    onSuccess: () => {
      if (auctionData) {
        const auctionItemData = {
          auctionId: auctionData.id.toString(),
          nftTokenId: Number(auctionData.nftTokenId.toString()),
          seller: auctionData.seller,
          startPrice: ethers.utils.formatEther(
            auctionData.startPrice.toString()
          ),
          highestBid: ethers.utils.formatEther(
            auctionData.highestBid.toString()
          ),
          buyNowPrice: ethers.utils.formatEther(
            auctionData.buyNowPrice.toString()
          ),
          endAt: Number(auctionData.endAt.toString()),
          isSold: auctionData.isSold,
          isCanceled: auctionData.isCanceled,
          isEnded: auctionData.isEnded,
        };
        setItem(auctionItemData);
      }
    },
  });

  useEffect(() => {
    let tout: NodeJS.Timeout;
    if (isError) {
      tout = setTimeout(() => {
        router.push('/auctions');
      }, 3000);
    }

    return () => {
      clearTimeout(tout);
    };
  }, [isError]);

  return (
    <div className="flex items-center justify-center">
      {mounted && (
        <>
          {isError && (
            <div>
              <h2 className="text-2xl font-semibold text-neutral">
                Auction does not exist. You are being redirected to auction list
                in 3 seconds...
              </h2>
            </div>
          )}
          {isLoading && (
            <div className="text-lg font-semibold text-neutral">Loading...</div>
          )}
          {isSuccess && !!item.nftTokenId && (
            <div className="mt-4 flex min-w-fit max-w-2xl flex-col items-center justify-center gap-8 rounded-lg border-4 border-highlight py-6 px-12 shadow-2xl md:px-20">
              <div className="flex flex-col items-center justify-center gap-8 md:flex-row">
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
                      Highest Bid: {item.highestBid} ETH
                    </h3>
                    <h3>Buy Now: {item.buyNowPrice} ETH</h3>
                    <h3 className="pb-4">Start Price: {item.startPrice} ETH</h3>
                    {!item.isEnded && (
                      <h3>
                        Ends{' '}
                        {moment
                          .duration(moment(item.endAt, 'X').diff(currentTime))
                          .humanize(true)}
                      </h3>
                    )}
                    <h3>Current Status: {item.isEnded ? 'Ended' : 'Active'}</h3>
                  </div>
                </div>
              </div>
              <div className="">
                {item.isEnded ? (
                  <div>
                    {item.isSold && (
                      <h3 className="text-2xl font-bold text-neutral">
                        This item is sold!
                      </h3>
                    )}
                    {item.isCanceled && (
                      <h3 className="text-2xl font-bold text-neutral">
                        This item is canceled!
                      </h3>
                    )}
                    {item.seller !== address && <RefundBid item={item} />}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-4">
                    <>
                      {item.seller === address ? (
                        <>
                          <EndAuction item={item} currentTime={currentTime} />
                          <CancelAuction
                            item={item}
                            currentTime={currentTime}
                          />
                        </>
                      ) : (
                        <>
                          <BidAuction item={item} />
                          <BuyNowAuction item={item} />
                        </>
                      )}
                    </>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AuctionDetails;
