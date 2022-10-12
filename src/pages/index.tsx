import { ConnectButton } from '@rainbow-me/rainbowkit';
import type { NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import {
  useAccount,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from 'wagmi';
import patikaBearsABI from '../../artifacts/contracts/PatikaBears.sol/PatikaBears.json';
import FlipCard, { BackCard, FrontCard } from '../components/FlipCard';
import { PatikaBearsContract } from '../../contractAddress';
import Layout from '../layouts/Layout';
import { ethers } from 'ethers';
import debounce from 'debounce';

const nftContractConfig = {
  addressOrName: PatikaBearsContract,
  contractInterface: patikaBearsABI.abi,
};

const Home: NextPage = () => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [totalMinted, setTotalMinted] = useState(0);
  const [queryTokenId, setQueryTokenId] = useState(1);
  const [tokenQueryCompleted, setTokenQueryCompleted] = useState(false);
  const [tokenList, setTokenList] = useState<number[]>([]);
  const { isConnected, address } = useAccount();

  const { config: contractWriteConfig } = usePrepareContractWrite({
    ...nftContractConfig,
    functionName: 'publicSafeMint',

    overrides: {
      value: ethers.utils.parseEther('0.02'),
    },
  });

  const {
    data: mintData,
    isLoading: isMintLoading,
    isSuccess: isMintStarted,
    write: mint,
    error: mintError,
  } = useContractWrite({ ...contractWriteConfig });

  const { data: totalSupplyData } = useContractRead({
    ...nftContractConfig,
    functionName: 'totalSupply',
    watch: true,
  });

  const { data: ownerOfToken, refetch: refetchOwnerOfToken } = useContractRead({
    ...nftContractConfig,
    functionName: 'ownerOf',
    watch: true,
    args: [queryTokenId],
    onSuccess: () => {
      console.log(tokenList);
      console.log(queryTokenId);
      console.log(Number(totalSupplyData?.toString()));
      if (queryTokenId < Number(totalSupplyData?.toString()) + 1) {
        checkOwner() &&
          checkNotAdded() &&
          setTokenList([...tokenList, queryTokenId]);

        setQueryTokenId((prev) => {
          if (prev < Number(totalSupplyData?.toString())) {
            return prev + 1;
          }
          setTokenQueryCompleted(true);
          return prev;
        });
      }
    },
  });

  const {
    data: txData,
    isSuccess: txSuccess,
    error: txError,
  } = useWaitForTransaction({
    hash: mintData?.hash,
  });

  useEffect(() => {
    if (totalSupplyData) {
      setTotalMinted(totalSupplyData.toNumber());
      if (isConnected) {
      }
    }
  }, [totalSupplyData]);

  const isMinted = txSuccess;

  const checkOwner = () => {
    if (ownerOfToken === address) {
      return true;
    } else {
      return false;
    }
  };

  const checkNotAdded = () => {
    if (tokenList.includes(queryTokenId)) {
      return false;
    } else {
      return true;
    }
  };

  return (
    <>
      <Head>
        <title>PatikaBears Mint NFT & Auction</title>
        <meta name="description" content="PatikaBears Mint NFT & Auction" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Layout>
        <div className="">
          <div className="flex flex-auto">
            <div className="mx-auto flex max-w-2xl flex-col items-center justify-center">
              <h1 className="text-center text-5xl font-bold text-slate-600">
                PatikaBears Minting!
              </h1>
              <p className="my-4 text-xl font-semibold text-slate-600">
                {totalMinted} / 20 minted so far!
              </p>
              <p className="font-semibold text-slate-600">Price: 0.02ETH</p>
              {mintError && (
                <p className="mt-6 text-[#FF6257]">
                  Mint Error: {mintError.message}
                </p>
              )}
              {txError && (
                <p className="mt-6 text-[#FF6257]">
                  TX Error: {txError.message}
                </p>
              )}

              {mounted && isConnected && !isMinted && (
                <button
                  disabled={!mint || isMintLoading || isMintStarted}
                  className="mt-6 w-1/4 max-w-[%25] rounded-2xl bg-[#0e76fd] py-2 px-8 font-bold text-white disabled:cursor-not-allowed disabled:bg-[#0248a3]"
                  data-mint-loading={isMintLoading}
                  data-mint-started={isMintStarted}
                  onClick={() => mint?.()}
                >
                  {isMintLoading && 'Waiting for approval'}
                  {isMintStarted && 'Minting...'}
                  {!isMintLoading && !isMintStarted && 'Mint'}
                </button>
              )}
              {mounted && !isConnected && (
                <ConnectButton label="Connect Wallet to Mint" />
              )}
              {isMinted && (
                <p className="mt-2 text-2xl font-bold text-green-600">
                  Succesfully Minted!
                </p>
              )}
            </div>
          </div>

          {isMinted && (
            <div className="my-4 flex items-center justify-center">
              <FlipCard>
                <FrontCard isCardFlipped={isMinted}>
                  <h1 className="mt-6">PatikaBears NFT</h1>
                  <ConnectButton />
                </FrontCard>
                <BackCard isCardFlipped={isMinted}>
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
                        href={`https://testnets.opensea.io/assets/goerli/${txData?.to}/1`}
                      >
                        Opensea
                      </a>
                    </p>
                  </div>
                </BackCard>
              </FlipCard>
            </div>
          )}
          <div>
            <h2 className="text-center text-2xl mt-12 mb-8 font-bold text-slate-600">
              Your NFT Bag
            </h2>
            <div className="flex items-center justify-center gap-8">
              {tokenList &&
                tokenQueryCompleted &&
                tokenList.map((tkn, index) => {
                  return (
                    <Image
                      key={index}
                      width={250}
                      height={250}
                      className="rounded-xl"
                      src={`https://ipfs.io/ipfs/QmbWQXeFYfp7ozLq9V7N5X72tEFvFXHVbzfntTnNaXWkU6/${tkn}.png`}
                    />
                  );
                })}
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default Home;
