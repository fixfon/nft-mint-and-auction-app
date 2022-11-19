import { ethers } from 'ethers';
import moment from 'moment';
import { useEffect, useState } from 'react';
import {
  useAccount,
  useContractWrite,
  usePrepareContractWrite,
  useQueryClient,
  useWaitForTransaction,
} from 'wagmi';
import { AuctionContract } from '../../../contractAddress';
import { Item } from '../../types/Item';

interface CancelAuctionProps {
  item: Item;
  currentTime: number;
}

const CancelAuction = ({ item, currentTime }: CancelAuctionProps) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const { isConnected } = useAccount();
  const queryClient = useQueryClient();

  const { config: cancelAuctionConfig } = usePrepareContractWrite({
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
        name: 'cancelAuction',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
      },
    ],
    functionName: 'cancelAuction',
    enabled:
      mounted &&
      !!item &&
      !item.isEnded &&
      isConnected &&
      moment(item.endAt, 'X').toISOString() >
        moment(currentTime, 'X').toISOString(),
    args: [ethers.BigNumber.from(item.auctionId)],
  });

  const {
    data: cancelAuctionData,
    isLoading: isCancelingAuction,
    isSuccess: isCanceledAuction,
    write: cancelAuctionFunction,
    error: cancelAuctionError,
  } = useContractWrite({ ...cancelAuctionConfig });

  const {
    isSuccess: isTxSucess,
    isLoading: isTxLoading,
    error: txError,
  } = useWaitForTransaction({
    hash: cancelAuctionData?.hash,
    enabled: !!cancelAuctionData,
  });

  useEffect(() => {
    if (isTxSucess) {
      queryClient.invalidateQueries();
    }
  }, [isTxSucess]);

  return (
    <>
      {mounted && !!item && (
        <div className="w-full">
          <div className="flex w-full items-center justify-center">
            <button
              type="button"
              disabled={
                isCancelingAuction ||
                !isConnected ||
                isCanceledAuction ||
                isTxLoading ||
                item.isEnded ||
                moment(item.endAt, 'X').toISOString() <
                  moment(currentTime, 'X').toISOString()
              }
              className="rounded-xl border-2 bg-highlight py-2 px-4 text-lg font-semibold text-neutral transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:bg-opacity-40"
              onClick={() => cancelAuctionFunction?.()}
            >
              {isCancelingAuction ? 'Canceling Auction...' : 'Cancel Auction'}
            </button>
          </div>
          {isTxLoading && (
            <div className="text-lg font-semibold text-highlight">
              Waiting for transaction...
            </div>
          )}
          {isTxSucess && (
            <div className="text-lg font-semibold text-highlight">
              Auction Canceled
            </div>
          )}
          {cancelAuctionError && (
            <div className="text-lg font-semibold text-red-500">
              Error while canceling auction!
            </div>
          )}
          {txError && (
            <div className="text-lg font-semibold text-red-500">
              Transaction error while canceling the auction!
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default CancelAuction;
