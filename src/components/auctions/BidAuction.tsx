import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import {
  useAccount,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from 'wagmi';
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
    enabled: !!item && !item.isEnded && mounted && isConnected,
    args: [ethers.BigNumber.from(item?.auctionId)],
    overrides: {
      value: ethers.utils.parseEther(bidAmount),
    },
  });

  const {
    data: placeBidData,
    isLoading: isPlacingBid,
    isSuccess: isPlacedBid,
    write: placeBidFunction,
    error: placeBidError,
  } = useContractWrite({ ...placeBidConfig });

  const {
    isSuccess: isTxSucess,
    isLoading: isTxLoading,
    error: txError,
  } = useWaitForTransaction({
    hash: placeBidData?.hash,
    enabled: !!placeBidData,
  });

  const handlePlaceBid = (e: any) => {
    e.preventDefault();
    if (e.target.bidAmount.value <= '0') return;
    setBidAmount(e.target.bidAmount.value);
  };

  useEffect(() => {
    if (bidAmount !== '0') {
      placeBidFunction?.();
    }
  }, [bidAmount]);

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
              disabled={isPlacingBid || !isConnected || isTxLoading}
              className="rounded-xl border-2 border-neutral bg-highlight px-4 py-1 font-semibold text-neutral transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:bg-opacity-40"
            >
              {isPlacingBid ? 'Placing Bid...' : 'Place Bid'}
            </button>
          </div>
          {isTxLoading && (
            <div className="text-xl font-semibold text-highlight">
              Waiting for transaction...
            </div>
          )}
          {isTxSucess && (
            <div className="text-xl font-semibold text-highlight">
              Placed bid successfully!
            </div>
          )}
          {placeBidError && (
            <div className="text-xl font-semibold text-red-600">
              Could not place bid!
            </div>
          )}
          {txError && (
            <div className="text-xl font-semibold text-red-600">
              Transaction Failed!
            </div>
          )}
        </form>
      )}
    </div>
  );
};

export default BidAuction;
