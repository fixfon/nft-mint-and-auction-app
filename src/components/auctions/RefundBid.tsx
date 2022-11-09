import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { useAccount, useContractWrite, usePrepareContractWrite } from 'wagmi';
import { AuctionContract } from '../../../contractAddress';
import { Item } from '../../types/Item';

interface RefundBidProps {
  item: Item;
}

const RefundBid = ({ item }: RefundBidProps) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const { isConnected } = useAccount();

  const { config: refundBidConfig } = usePrepareContractWrite({
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
        name: 'refundBid',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
      },
    ],
    functionName: 'refundBid',
    enabled: mounted && !!item && item.isEnded && isConnected,
    args: [ethers.BigNumber.from(item.auctionId)],
  });

  const {
    isLoading: isRefundingBid,
    isSuccess: isRefundedBid,
    write: refundBidFunction,
    error: refundBidError,
  } = useContractWrite({ ...refundBidConfig });

  return (
    <>
      {mounted && !!item && (
        <div>
          <button
            type="button"
            disabled={
              isRefundingBid || !isConnected || isRefundedBid || !item.isEnded
            }
            className="rounded-xl border-2 bg-highlight py-2 px-4 text-lg font-semibold text-neutral transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:bg-opacity-40"
            onClick={() => refundBidFunction?.()}
          >
            {isRefundingBid ? 'Refunding Your Bid...' : 'Refund Your Bid'}
          </button>
          {isRefundedBid && (
            <div className="text-lg font-semibold text-highlight">
              Your bid has been refunded!
            </div>
          )}
          {refundBidError && (
            <div className="text-lg font-semibold text-red-500">
              Error while refunding your bid!
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default RefundBid;
