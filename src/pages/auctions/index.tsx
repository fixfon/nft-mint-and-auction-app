import { NextPage } from 'next';
import Layout from '../../layouts/Layout';

import { useEffect, useState } from 'react';
import Head from 'next/head';
import Auctions from '../../components/auctions/Auctions';
import UserAuctions from '../../components/auctions/UserAuctions';
import { BiRadioCircle, BiRadioCircleMarked } from 'react-icons/bi';

const Auction: NextPage = () => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const [userFilter, setUserFilter] = useState<boolean>(false);

  return (
    <>
      <Head>
        <title>PatikaBears Auctions</title>
        <meta name="description" content="PatikaBears NFT Auctions" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Layout>
        <div className="mx-auto flex flex-col items-center justify-center">
          <h1 className="mb-8 text-3xl font-bold text-highlight">Auctions</h1>
          {mounted && userFilter ? (
            <>
              <button
                type="button"
                onClick={() => setUserFilter(false)}
                className="mr-4 flex items-center justify-center gap-2 self-end rounded-lg border-2 border-neutral bg-highlight px-3 py-1 text-lg text-neutral transition-transform hover:scale-105"
              >
                <BiRadioCircleMarked size={24} />
                See Your Actions
              </button>
              <UserAuctions />
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setUserFilter(true)}
                className="mr-4 flex items-center justify-center gap-2 self-end rounded-lg border-2 border-neutral px-3 py-1 text-lg text-neutral transition-transform hover:scale-105"
              >
                <BiRadioCircle size={24} />
                See Your Actions
              </button>
              <Auctions />
            </>
          )}
        </div>
      </Layout>
    </>
  );
};

export default Auction;
