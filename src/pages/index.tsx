import { ConnectButton } from '@rainbow-me/rainbowkit';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import {
  useAccount,
} from 'wagmi';
import patikaBearsABI from '../../artifacts/contracts/PatikaBears.sol/PatikaBears.json';
import FlipCard, { BackCard, FrontCard } from '../components/mint/FlipCard';
import { PatikaBearsContract } from '../../contractAddress';
import Layout from '../layouts/Layout';
import Mint from '../components/mint/Mint';

const nftContractConfig = {
  address: PatikaBearsContract,
  abi: patikaBearsABI.abi,
};

const Home: NextPage = () => {
  // const [mounted, setMounted] = useState(false);
  // useEffect(() => setMounted(true), []);

  const [totalMinted, setTotalMinted] = useState(0);
  const [queryTokenId, setQueryTokenId] = useState(1);
  const [tokenQueryCompleted, setTokenQueryCompleted] = useState(false);
  const [tokenList, setTokenList] = useState<number[]>([]);
  const { isConnected, address } = useAccount();

  // const { data: ownerOfToken } = useContractRead({
  //   ...nftContractConfig,
  //   functionName: 'ownerOf',
  //   watch: true,
  //   args: [queryTokenId],
  //   // enabled: !tokenQueryCompleted && !isMintLoading,
  //   onSuccess: () => {
  //     // console.log(tokenList);
  //     // console.log(queryTokenId);
  //     // console.log(Number(totalSupplyData?.toString()));
      
      
  //     // if (queryTokenId < Number(totalSupplyData?.toString()) + 1) {
  //     //   checkOwner() &&
  //     //     checkNotAdded() &&
  //     //     setTokenList([...tokenList, queryTokenId]);

  //     //   setQueryTokenId((prev) => {
  //     //     if (prev < Number(totalSupplyData?.toString())) {
  //     //       return prev + 1;
  //     //     } else {
  //     //       setTokenQueryCompleted(true);
  //     //       return prev;
  //     //     }
  //     //   });
  //     // }
  //   },
  // });



  useEffect(() => {
    console.log(address);
    if (!address) setTokenList([]);
    else {
      setTokenQueryCompleted(false);
      setQueryTokenId(1);
      setTokenList([]);
    }
  }, [address]);

  // const checkOwner = () => {
  //   if (ownerOfToken === address) {
  //     return true;
  //   } else {
  //     return false;
  //   }
  // };

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
        <meta name="description" content="PatikaBears Minting NFT" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Layout>
        <div className="">
          <Mint />
          <div>
            <h2 className="mt-12 mb-8 text-center text-2xl font-bold text-slate-600">
              Your NFT Bag
            </h2>
            {/* <div className="flex items-center justify-center gap-8">
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
            </div> */}
          </div>
        </div>
      </Layout>
    </>
  );
};

export default Home;
