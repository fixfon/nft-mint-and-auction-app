import { utils } from 'ethers';
import { useEffect, useState } from 'react';
import {
  useAccount,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from 'wagmi';
import { PatikaBearsContract } from '../../../contractAddress';
import patikaBearsABI from '../../../artifacts/contracts/PatikaBears.sol/PatikaBears.json';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import FlipCard, { BackCard, FrontCard } from './FlipCard';
import Image from 'next/image';

const nftContractConfig = {
  address: PatikaBearsContract,
  abi: patikaBearsABI.abi,
};

const Mint = () => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const [totalMinted, setTotalMinted] = useState(0);
  const [mintData, setMintData] = useState<any>(undefined);
  const [txData, setTxData] = useState<any>(undefined);

  const { isConnected, address } = useAccount();

  const { data: totalSupplyData, isLoading: isSupplyLoading } = useContractRead(
    {
      ...nftContractConfig,
      functionName: 'totalSupply',
      watch: true,
    }
  );

  const { config: contractWriteConfig } = usePrepareContractWrite({
    address: PatikaBearsContract,
    abi: [
      {
        inputs: [],
        name: 'publicSafeMint',
        outputs: [],
        stateMutability: 'payable',
        type: 'function',
      },
    ],
    functionName: 'publicSafeMint',
    overrides: {
      value: utils.parseEther('0.02'),
    },
  });

  const {
    data: mintDataRaw,
    isLoading: isMintLoading,
    isSuccess: isMintStarted,
    write: mint,
    error: mintError,
  } = useContractWrite({
    ...contractWriteConfig,
  });

  const {
    data: txDataRaw,
    isSuccess: txSuccess,
    isLoading: isTxLoading,
    error: txError,
  } = useWaitForTransaction({
    hash: mintData?.hash,
    enabled: mintData,
  });

  useEffect(() => {
    if (totalSupplyData) {
      setTotalMinted(Number(totalSupplyData?.toString()));
    }
  }, [totalSupplyData]);

  useEffect(() => {
    if (mintDataRaw) {
      setMintData(mintDataRaw);
    }
  }, [mintDataRaw]);

  useEffect(() => {
    if (txDataRaw) {
      setTxData(txDataRaw);
    }
  }, [txDataRaw]);

  const loading = isSupplyLoading || isMintLoading || isTxLoading;

  return (
    <>
      {mounted && (
        <div className="flex flex-auto">
          <div className="mx-auto flex max-w-2xl flex-col items-center justify-center">
            <h1 className="text-center text-5xl font-bold text-highlight">
              PatikaBears Minting!
            </h1>
            <p className="my-4 text-xl font-semibold text-neutral">
              {loading ? totalMinted : '0'} / 20 minted so far!
            </p>
            <p className="font-semibold text-neutral">Price: 0.02ETH</p>
            {!loading && mintError && (
              <p className="mt-6 text-[#FF6257]">
                Mint Error: {mintError.message}
              </p>
            )}
            {!loading && txError && (
              <p className="mt-6 text-[#FF6257]">TX Error: {txError.message}</p>
            )}

            {isConnected && (
              <div className={!txSuccess ? 'h-[50px]' : ''}>
                <FlipCard>
                  <FrontCard>
                    <div className="flex w-full items-center justify-center">
                      <button
                        disabled={!mint || isMintLoading || isMintStarted}
                        className="mt-6 max-w-[%25] rounded-2xl bg-[#0e76fd] py-2 px-8 font-bold text-white disabled:cursor-not-allowed disabled:bg-[#0248a3]"
                        data-mint-loading={isMintLoading}
                        data-mint-started={isMintStarted}
                        onClick={() => mint?.()}
                      >
                        {isMintLoading && 'Waiting for approval'}
                        {isMintStarted && 'Minting...'}
                        {!isMintLoading && !isMintStarted && 'Mint'}
                      </button>
                    </div>
                  </FrontCard>
                  <BackCard isCardFlipped={txSuccess}>
                    <div className="flex flex-col items-center justify-center p-6">
                      <Image
                        src="/1.png"
                        width="80"
                        height="80"
                        alt="PatikaBears NFT"
                        className="rounded-xl blur-3xl"
                      />
                      <h2 className="mt-3 mb-2">NFT Minted!</h2>
                      <p className="mb-3">
                        Your NFT will show up in your wallet in the next few
                        minutes.
                      </p>
                      <p className="mb-2">
                        View on{' '}
                        <a
                          className="font-semibold hover:text-[#d0d500]"
                          href={`https://goerli.etherscan.io/tx/${mintData?.hash}`}
                        >
                          Etherscan
                        </a>
                      </p>
                      <p className="">
                        View on{' '}
                        <a
                          className="font-semibold hover:text-[#d0d500]"
                          href={`https://testnets.opensea.io/assets/goerli/${
                            txData?.to
                          }/${totalMinted + 1}`}
                        >
                          Opensea
                        </a>
                      </p>
                    </div>
                  </BackCard>
                </FlipCard>
              </div>
            )}
            {!isConnected && (
              <p className="py-4 text-xl font-medium text-highlight">
                Connect your wallet to mint a PatikaBear!
              </p>
            )}
            {txSuccess && (
              <p className="mt-2 text-2xl font-bold text-green-600">
                Succesfully Minted!
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Mint;
