import { NextPage } from 'next';
import Head from 'next/head';
import { useState } from 'react';
import CreateAuction from '../components/create-auction/CreateAuction';
import NFTBag from '../components/mint/NFTBag';
import Layout from '../layouts/Layout';

const CreateAuctionPage: NextPage = () => {
  const [selectedTokenId, setSelectedTokenId] = useState(0);

  return (
    <>
      <Head>
        <title>PatikaBears Create Auction</title>
        <meta name="description" content="PatikaBears Create Auction" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Layout>
        <div className="create-auction | nfts relative min-w-[500px]">
          <div className="mr-8 flex flex-col items-center justify-center">
            <h1 className="mb-8 text-3xl font-bold text-highlight">
              Select NFT to Create Auction
            </h1>
            <NFTBag createAuction setSelectedTokenId={setSelectedTokenId} />
            {selectedTokenId > 0 && (
              <CreateAuction
                selectedTokenId={selectedTokenId}
                setSelectedTokenId={setSelectedTokenId}
              />
            )}
          </div>
          {/* <div className="your-auctions mr-8">
          <h1 className="text-2xl font-semibold text-slate-600">
            Your Auctions
          </h1>
          <div className="grid grid-cols-2 gap-4">
            {userAuctionList.length > 0 &&
              userAuctionList.map((auction, index) => {
                return (
                  <div
                    onClick={() => handleSelectAuction(index)}
                    key={index}
                    className="flex h-full w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-black p-3"
                  >
                    <Image
                      width={150}
                      height={150}
                      className="rounded-xl"
                      src={`https://ipfs.io/ipfs/QmbWQXeFYfp7ozLq9V7N5X72tEFvFXHVbzfntTnNaXWkU6/${auction.nftTokenId}.png`}
                    />
                  </div>
                );
              })}
          </div>
        </div> */}
        </div>
      </Layout>
    </>
  );
};

export default CreateAuctionPage;
