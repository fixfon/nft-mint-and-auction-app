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
    data: refundBidData,
    isLoading: isRefundingBid,
    isSuccess: isRefundedBid,
    write: refundBidFunction,
    error: refundBidError,
  } = useContractWrite({ ...refundBidConfig });

  const {
    isSuccess: isTxSucess,
    isLoading: isTxLoading,
    error: txError,
  } = useWaitForTransaction({
    hash: refundBidData?.hash,
    enabled: !!refundBidData,
  });

  return (
    <>
      {mounted && !!item && (
        <div className="w-full">
          <div className="flex w-full items-center justify-center">
            <button
              type="button"
              disabled={
                isRefundingBid ||
                !isConnected ||
                isRefundedBid ||
                isTxLoading ||
                !item.isEnded
              }
              className="rounded-xl border-2 bg-highlight py-2 px-4 text-lg font-semibold text-neutral transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:bg-opacity-40"
              onClick={() => refundBidFunction?.()}
            >
              {isRefundingBid ? 'Refunding Your Bid...' : 'Refund Your Bid'}
            </button>
          </div>
          {isTxLoading && (
            <div className="text-lg font-semibold text-highlight">
              Waiting for transaction...
            </div>
          )}
          {isTxSucess && (
            <div className="text-lg font-semibold text-highlight">
              Your bid has been refunded!
            </div>
          )}
          {refundBidError && (
            <div className="text-lg font-semibold text-red-500">
              Error while refunding your bid!
            </div>
          )}
          {txError && (
            <div className="text-lg font-semibold text-red-500">
              Transaction error while refunding your bid!
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default RefundBid;
