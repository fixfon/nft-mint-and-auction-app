import { NextPage } from 'next';

import Layout from '../../layouts/Layout';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import AuctionDetails from '../../components/auctions/AuctionDetails';
import { AiFillCloseCircle } from 'react-icons/ai';

type Item = {
  auctionId: string;
  nftTokenId: number;
  highestBid: number;
  buyNowPrice: number;
  endAt: number;
  isSold: boolean;
  isCanceled: boolean;
  isEnded: boolean;
};

const AuctionItem: NextPage = () => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const [item, setItem] = useState<Item>({} as Item);
  const [routeId, setRouteId] = useState<string | undefined>();
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (id) {
      setRouteId(id as string);
    }
  }, [id]);

  const handleNavigateBack = () => {
    router.push('/auctions');
  };

  return (
    <>
      <Head>
        <title>PatikaBears Auction</title>
        <meta name="description" content="PatikaBears NFT Auctions" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout>
        <button
          type="button"
          onClick={handleNavigateBack}
          className="flex items-center justify-center gap-2 rounded-xl border-2 bg-highlight py-1 px-4 text-lg font-semibold text-neutral transition-transform hover:scale-105"
        >
          <AiFillCloseCircle size={24} />
          Go Back
        </button>
        {mounted && (
          <>
            <AuctionDetails item={item} setItem={setItem} routeId={routeId} />
          </>
        )}
      </Layout>
    </>
  );
};

export default AuctionItem;
