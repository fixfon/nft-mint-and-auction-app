import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { useAccount, useContractWrite, usePrepareContractWrite } from 'wagmi';
import { AuctionContract } from '../../../contractAddress';
import { Item } from '../../types/Item';

interface BuyNowAuctionProps {
  item: Item;
}

const BuyNowAuction = ({ item }: BuyNowAuctionProps) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const { isConnected } = useAccount();

  const { config: buyNowConfig } = usePrepareContractWrite({
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
        name: 'buyNow',
        outputs: [],
        stateMutability: 'payable',
        type: 'function',
      },
    ],
    functionName: 'buyNow',
    enabled: mounted && !!item && !item.isEnded && isConnected,
    args: [ethers.BigNumber.from(item.auctionId)],
    overrides: {
      value: ethers.utils.parseEther(item?.buyNowPrice),
    },
  });

  const {
    isLoading: isBuyNow,
    isSuccess: isBoghtNow,
    write: buyNowFunction,
    error: buyNowError,
  } = useContractWrite({ ...buyNowConfig });

  return (
    <>
      {mounted && item && (
        <div>
          <button
            disabled={
              isBuyNow || isBoghtNow || !item || item.isEnded || !isConnected
            }
            onClick={() => buyNowFunction?.()}
            type="button"
            className="rounded-xl border-2 bg-highlight py-2 px-4 text-lg font-semibold text-neutral transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:bg-opacity-40"
          >
            {isBuyNow ? 'Buying...' : `Buy Now (${item.buyNowPrice} ETH)`}
          </button>
          {isBoghtNow && (
            <div className="text-lg font-semibold text-green-500">
              You bought this item!
            </div>
          )}
          {buyNowError && (
            <div className="text-lg font-semibold text-red-500">
              Error while buying this item!
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default BuyNowAuction;
