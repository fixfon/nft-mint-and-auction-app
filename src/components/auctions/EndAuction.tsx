import { ethers } from 'ethers';
import moment from 'moment';
import { useEffect, useState } from 'react';
import {
  useAccount,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from 'wagmi';
import { AuctionContract } from '../../../contractAddress';
import { Item } from '../../types/Item';

interface EndAuctionProps {
  item: Item;
  currentTime: number;
}

const EndAuction = ({ item, currentTime }: EndAuctionProps) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const { isConnected } = useAccount();

  const { config: endAuctionConfig } = usePrepareContractWrite({
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
        name: 'endAuction',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
      },
    ],
    functionName: 'endAuction',
    enabled:
      mounted &&
      !!item &&
      !item.isEnded &&
      isConnected &&
      moment(item.endAt, 'X').toISOString() <
        moment(currentTime, 'X').toISOString(),
    args: [ethers.BigNumber.from(item.auctionId)],
  });

  const {
    data: endAuctionData,
    isLoading: isEndingAuction,
    isSuccess: isEndedAuction,
    write: endAuctionFunction,
    error: endAuctionError,
  } = useContractWrite({ ...endAuctionConfig });

  const {
    isSuccess: isTxSucess,
    isLoading: isTxLoading,
    error: txError,
  } = useWaitForTransaction({
    hash: endAuctionData?.hash,
    enabled: !!endAuctionData,
  });

  return (
    <>
      {mounted && !!item && (
        <div>
          <button
            type="button"
            disabled={
              isEndingAuction ||
              !isConnected ||
              isEndedAuction ||
              isTxLoading ||
              item.isEnded ||
              moment(item.endAt, 'X').toISOString() >
                moment(currentTime, 'X').toISOString()
            }
            className="rounded-xl border-2 bg-highlight py-2 px-4 text-lg font-semibold text-neutral transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:bg-opacity-40"
            onClick={() => endAuctionFunction?.()}
          >
            {isEndingAuction ? 'Ending Auction...' : 'End Auction'}
          </button>
          {isTxLoading && (
            <div className="text-lg font-semibold text-highlight">
              Waiting for transaction...
            </div>
          )}
          {isTxSucess && (
            <div className="text-lg font-semibold text-highlight">
              Auction Ended
            </div>
          )}
          {endAuctionError && (
            <div className="text-lg font-semibold text-red-500">
              Error while ending auction!
            </div>
          )}
          {txError && (
            <div className="text-lg font-semibold text-red-500">
              Transaction error while ending auction!
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default EndAuction;
