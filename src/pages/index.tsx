import type { NextPage } from 'next';
import Head from 'next/head';
import Layout from '../layouts/Layout';
import Mint from '../components/mint/Mint';
import NFTBag from '../components/mint/NFTBag';

const Home: NextPage = () => {
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
            <NFTBag />
          </div>
        </div>
      </Layout>
    </>
  );
};

export default Home;
