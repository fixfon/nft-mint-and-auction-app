import { ethers } from 'ethers';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import {
  useAccount,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from 'wagmi';
import { AuctionContract, PatikaBearsContract } from '../../../contractAddress';
import { AiFillCloseCircle } from 'react-icons/ai';

interface CreateAuctionProps {
  selectedTokenId: number;
  setSelectedTokenId: (tokenId: number) => void;
}

const CreateAuction = ({
  selectedTokenId,
  setSelectedTokenId,
}: CreateAuctionProps) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [auctionForm, setAuctionForm] = useState({
    startPrice: 0.0,
    buyNowPrice: 0.0,
  });
  const { isConnected } = useAccount();

  const { config: approvalConfig } = usePrepareContractWrite({
    address: PatikaBearsContract,
    abi: [
      {
        inputs: [
          {
            internalType: 'address',
            name: 'to',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'tokenId',
            type: 'uint256',
          },
        ],
        name: 'approve',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
      },
    ],
    functionName: 'approve',
    args: [AuctionContract, ethers.BigNumber.from(selectedTokenId)],
  });

  const {
    data: approvalData,
    isLoading: isApproving,
    isSuccess: isApproved,
    write: approveFunction,
    error: aprroveError,
  } = useContractWrite({ ...approvalConfig });

  const {
    isSuccess: txApproveSuccess,
    isLoading: isTxApproveLoading,
    error: txApproveError,
  } = useWaitForTransaction({
    hash: approvalData?.hash,
    enabled: !!approvalData,
  });

  const { config: createAuctionConfig } = usePrepareContractWrite({
    address: AuctionContract,
    abi: [
      {
        inputs: [
          {
            internalType: 'uint256',
            name: '_nftTokenId',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: '_startPrice',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: '_buyNowPrice',
            type: 'uint256',
          },
        ],
        name: 'createAuction',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
      },
    ],
    functionName: 'createAuction',
    enabled:
      txApproveSuccess &&
      auctionForm.buyNowPrice > 0 &&
      auctionForm.startPrice > 0,
    args: [
      ethers.BigNumber.from(selectedTokenId),
      ethers.utils.parseEther(auctionForm.startPrice.toString()),
      ethers.utils.parseEther(auctionForm.buyNowPrice.toString()),
    ],
  });

  const {
    data: createAuctionData,
    isLoading: isAuctionCreating,
    isSuccess: isAuctionCreated,
    write: createAuctionFunction,
    error: createAuctionError,
  } = useContractWrite({ ...createAuctionConfig });

  const {
    isSuccess: txCreateSuccess,
    isLoading: isTxCreateLoading,
    error: txCreateError,
  } = useWaitForTransaction({
    hash: createAuctionData?.hash,
    enabled: !!createAuctionData,
  });

  const handleCreateAuction = (e: any) => {
    e.preventDefault();
    if (
      e.target.elements.startPrice.value < e.target.elements.buyNowPrice.value
    ) {
      approveFunction?.();
    }
    const form = {
      startPrice: parseFloat(e.target.startPrice.value),
      buyNowPrice: parseFloat(e.target.buyNowPrice.value),
    };
    setAuctionForm(form);
  };

  return (
    <>
      {mounted && isConnected && (
        <div className="absolute top-0 z-10 mt-8 flex h-full w-full flex-col items-center justify-center gap-4 overflow-auto rounded-lg border-2 border-highlight bg-highlight bg-opacity-40 p-4 shadow-2xl backdrop-blur-sm md:h-fit">
          <button
            type="button"
            className="flex items-center justify-center gap-2 self-start rounded-3xl border-2 border-neutral bg-primary px-4 py-4 font-semibold text-neutral transition-transform hover:scale-105"
            onClick={() => setSelectedTokenId(0)}
          >
            <AiFillCloseCircle size={30} /> Go Back
          </button>
          <Image
            width={300}
            height={300}
            className="select-none rounded-xl"
            src={`/images/${selectedTokenId}.png`}
          />
          {txCreateSuccess ? (
            <div>
              <h1 className="text-center text-2xl font-semibold text-green-600">
                Auction Created Successfully
              </h1>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center">
              <form
                className="flex flex-col items-center justify-center text-neutral"
                onSubmit={handleCreateAuction}
              >
                <label className="py-2 font-semibold">
                  Enter Starting Price (ETH)
                </label>
                <input
                  disabled={isApproving || isApproved || isAuctionCreating}
                  className="rounded-xl border-2 border-slate-600 px-2 text-complementary"
                  name="startPrice"
                  required
                  step="0.001"
                  min="0.001"
                  type="number"
                />
                <label className="py-2 pt-4 font-semibold">
                  Enter Buy Now Price (ETH)
                </label>
                <input
                  disabled={isApproving || isApproved || isAuctionCreating}
                  className="rounded-xl border-2 border-slate-600 px-2 text-complementary"
                  name="buyNowPrice"
                  required
                  step="0.001"
                  min="0.001"
                  type="number"
                />
                <button
                  disabled={
                    !isConnected ||
                    isApproving ||
                    isApproved ||
                    isTxApproveLoading ||
                    txApproveSuccess
                  }
                  className="mt-4 rounded-3xl border-2 border-neutral bg-primary py-2 px-4 font-semibold text-neutral transition-all hover:scale-105 disabled:cursor-not-allowed disabled:border-none disabled:opacity-70 disabled:hover:scale-100"
                  type="submit"
                >
                  Approve Token
                </button>
              </form>
              {txApproveSuccess && (
                <button
                  disabled={
                    !isConnected || isAuctionCreating || isTxCreateLoading
                  }
                  className="mt-4 rounded-3xl border-2 border-neutral bg-primary py-2 px-4 font-semibold text-neutral transition-all hover:scale-105 disabled:cursor-not-allowed disabled:border-none disabled:opacity-70 disabled:hover:scale-100"
                  type="button"
                  onClick={() => createAuctionFunction?.()}
                >
                  Create Auction
                </button>
              )}
            </div>
          )}
          {isApproving && (
            <p className="text-center text-xl font-semibold text-highlight">
              Approving Token...
            </p>
          )}
          {isTxApproveLoading && (
            <p className="text-center text-xl font-semibold text-highlight">
              Waiting for Approving Transaction...
            </p>
          )}
          {isAuctionCreating && (
            <p className="text-center text-xl font-semibold text-highlight">
              Creating Auction...
            </p>
          )}
          {isTxCreateLoading && (
            <p className="text-center text-xl font-semibold text-highlight">
              Waiting for Creating Auction Transaction...
            </p>
          )}
          {aprroveError && (
            <p className="text-lg font-semibold text-red-600">
              An error ocurred while transferring the ownership of the NFT!
            </p>
          )}
          {txApproveError && (
            <p className="text-lg font-semibold text-red-600">
              An error ocurred with the transaction in the chain while approving
              the token!
            </p>
          )}
          {createAuctionError && (
            <p className="text-lg font-semibold text-red-600">
              An error ocurred while creating the auction!
            </p>
          )}
          {txCreateError && (
            <p className="text-lg font-semibold text-red-600">
              An error ocurred with the transaction in the chain while creating
              the auction!
            </p>
          )}
        </div>
      )}
    </>
  );
};

export default CreateAuction;
