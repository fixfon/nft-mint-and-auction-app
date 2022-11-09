import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { useAccount, useContractWrite, usePrepareContractWrite } from 'wagmi';
import { AuctionContract } from '../../../contractAddress';
import { Item } from '../../types/Item';

interface BidAuctionProps {
  item: Item;
}

const BidAuction = ({ item }: BidAuctionProps) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const [bidAmount, setBidAmount] = useState<string>('0');
  const { isConnected } = useAccount();

  const { config: placeBidConfig } = usePrepareContractWrite({
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
        name: 'bid',
        outputs: [],
        stateMutability: 'payable',
        type: 'function',
      },
    ],
    functionName: 'bid',
    enabled:
      bidAmount > '0' && !!item && !item.isEnded && mounted && isConnected,
    args: [ethers.BigNumber.from(item?.auctionId)],
    overrides: {
      value: ethers.utils.parseEther(bidAmount),
    },
  });

  const {
    isLoading: isPlacingBid,
    isSuccess: isPlacedBid,
    write: placeBidFunction,
    error: placeBidError,
  } = useContractWrite({ ...placeBidConfig });

  const handlePlaceBid = (e: any) => {
    e.preventDefault();
    setBidAmount(e.target.bidAmount.value);
    placeBidFunction?.();
  };

  return (
    <div>
      {mounted && item && (
        <form
          onSubmit={handlePlaceBid}
          className="flex flex-col items-center justify-center text-neutral"
        >
          <label className="mb-2 py-2 text-2xl font-semibold">
            Enter Your Bid (ETH)
          </label>
          <div className="flex items-center justify-center gap-4">
            <input
              name="bidAmount"
              className="w-28 rounded-xl border-2 px-2 text-complementary"
              required
              step="0.001"
              min={(
                (Number(item.highestBid) == 0
                  ? Number(item.startPrice)
                  : Number(item.highestBid)) + 0.001
              ).toFixed(3)}
              max={(Number(item.buyNowPrice) - 0.001).toFixed(3)}
              type="number"
              disabled={isPlacingBid}
            />
            <button
              type="submit"
              onClick={() => placeBidFunction?.()}
              disabled={isPlacingBid || item.isEnded || !isConnected}
              className="rounded-xl border-2 border-neutral bg-highlight px-4 py-1 font-semibold text-neutral transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:bg-opacity-40"
            >
              {isPlacingBid ? 'Placing Bid...' : 'Place Bid'}
            </button>
          </div>
          {isPlacedBid && (
            <div className="text-xl font-semibold text-highlight">
              Bid Placed Successfully!
            </div>
          )}
          {placeBidError && (
            <div className="text-xl font-semibold text-red-600">
              Could not place bid!
            </div>
          )}
        </form>
      )}
    </div>
  );
};

export default BidAuction;
