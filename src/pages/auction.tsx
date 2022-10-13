import { NextPage } from 'next';
import Layout from '../layouts/Layout';

import {
  useAccount,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
} from 'wagmi';

import { PatikaBearsContract } from '../../contractAddress';
import patikaBearsABI from '../../artifacts/contracts/PatikaBears.sol/PatikaBears.json';
import { AuctionContract } from '../../contractAddress';
import auctionABI from '../../artifacts/contracts/Auction.sol/Auction.json';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { ethers } from 'ethers';
import moment from 'moment';

type AuctionDisplayData = {
  seller: string;
  nftTokenId: number;
  highestBid: number;
  startPrice: number;
  buyNowPrice: number;
  endAt: number;
  canceled: boolean;
};

const nftContractConfig = {
  addressOrName: PatikaBearsContract,
  contractInterface: patikaBearsABI.abi,
};

const auctionContractConfig = {
  addressOrName: AuctionContract,
  contractInterface: auctionABI.abi,
};

const Auction: NextPage = () => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    setCurrentTime(Date.now());
  }, []);

  const { isConnected, address } = useAccount();
  const [queryTokenId, setQueryTokenId] = useState(1);
  const [currentTime, setCurrentTime] = useState<number>();
  const [tokenQueryCompleted, setTokenQueryCompleted] = useState(false);
  const [auctionListQueryCompleted, setAuctionListQueryCompleted] =
    useState(false);
  const [tokenList, setTokenList] = useState<number[]>([]);
  const [selectedTokenId, setSelectedTokenId] = useState<number>(0);
  const [selectedAuctionId, setSelectedAuctionId] = useState(-1);
  const [formAuctionStartPrice, setFormAuctionStartPrice] = useState('0');
  const [formAuctionBuyNowPrice, setFormAuctionBuyNowPrice] = useState('0');
  const [currentAuctionId, setCurrentAuctionId] = useState(0);
  const [auctionList, setAuctionList] = useState<AuctionDisplayData[]>([]);
  const [userAuctionList, setUserAuctionList] = useState<AuctionDisplayData[]>(
    []
  );
  const [placeBidAmount, setPlaceBidAmount] = useState('0');

  const { data: totalSupplyData } = useContractRead({
    ...nftContractConfig,
    functionName: 'totalSupply',
    watch: true,
  });

  const { data: ownerOfToken } = useContractRead({
    ...nftContractConfig,
    functionName: 'ownerOf',
    watch: true,
    args: [queryTokenId],
    enabled: !tokenQueryCompleted,
    onSuccess: () => {
      if (queryTokenId < Number(totalSupplyData?.toString()) + 1) {
        checkOwner() &&
          checkNotAdded() &&
          setTokenList([...tokenList, queryTokenId]);

        setQueryTokenId((prev) => {
          if (prev < Number(totalSupplyData?.toString())) {
            return prev + 1;
          } else {
            setTokenQueryCompleted(true);
            return prev;
          }
        });
      }
    },
  });

  const { data: currentAuctionIdData } = useContractRead({
    ...auctionContractConfig,
    functionName: 'getCurrentAuctionId',
    watch: true,
    onSuccess: () => {
      if (currentAuctionIdData) {
        setCurrentAuctionId(Number(currentAuctionIdData.toString()));
      }
    },
  });

  const { data: auctionListData } = useContractRead({
    ...auctionContractConfig,
    functionName: 'getAuctionList',
    watch: true,
    enabled: currentAuctionId > 0 && !auctionListQueryCompleted,
    onSuccess: () => {
      if (auctionListData && auctionListData[0][0]) {
        const auctionListDataSize = auctionListData.length;
        const auctionListArr: AuctionDisplayData[] = [];
        for (let i = 0; i < auctionListDataSize; i++) {
          auctionListArr.push({
            seller: auctionListData[i][0].toString(),
            nftTokenId: Number(auctionListData[i][1].toString()),
            highestBid: Number(auctionListData[i][3].toString()),
            startPrice: Number(auctionListData[i][4].toString()),
            buyNowPrice: Number(auctionListData[i][5].toString()),
            endAt: Number(auctionListData[i][7].toString()),
            canceled: auctionListData[i][8].toString(),
          });
        }
        setAuctionList([...auctionListArr]);
        setAuctionListQueryCompleted(true);
      }
    },
  });

  const { config: approvalConfig } = usePrepareContractWrite({
    ...nftContractConfig,
    functionName: 'approve',
    args: [AuctionContract, selectedTokenId],
  });

  const {
    data: approveData,
    isLoading: isApproving,
    isSuccess: isApproved,
    write: approveFunction,
    error: aprroveError,
  } = useContractWrite({ ...approvalConfig });

  const { config: createAuctionConfig } = usePrepareContractWrite({
    ...auctionContractConfig,
    functionName: 'createAuction',
    enabled:
      isApproved && formAuctionBuyNowPrice > '0' && formAuctionStartPrice > '0',
    args: [
      selectedTokenId,
      ethers.utils.parseEther(formAuctionStartPrice),
      ethers.utils.parseEther(formAuctionBuyNowPrice),
    ],
  });

  const {
    data: createAuctionData,
    isLoading: isAuctionCreating,
    isSuccess: isAuctionCreated,
    write: createAuctionFunction,
    error: createAuctionError,
  } = useContractWrite({ ...createAuctionConfig });

  const { config: placeBidConfig } = usePrepareContractWrite({
    ...auctionContractConfig,
    functionName: 'bid',
    enabled: placeBidAmount > '0' && selectedAuctionId > -1,
    args: [selectedAuctionId],
    overrides: {
      value: ethers.utils.parseEther(placeBidAmount),
    },
  });

  const {
    data: placeBidData,
    isLoading: isPlacingBid,
    isSuccess: isPlacedBid,
    write: placeBidFunction,
    error: placeBidError,
  } = useContractWrite({ ...placeBidConfig });

  const { config: buyNowConfig } = usePrepareContractWrite({
    ...auctionContractConfig,
    functionName: 'buyNow',
    enabled: selectedAuctionId > -1,
    args: [selectedAuctionId],
    overrides: {
      value: ethers.utils.parseEther(
        auctionList[selectedAuctionId]?.buyNowPrice.toString() ?? '0'
      ),
    },
  });

  const {
    data: buyNowData,
    isLoading: isBuyNow,
    isSuccess: isBoghtNow,
    write: buyNowFunction,
    error: buyNowError,
  } = useContractWrite({ ...buyNowConfig });

  const { config: cancelAuctionConfig } = usePrepareContractWrite({
    ...auctionContractConfig,
    functionName: 'cancelAuction',
    enabled: selectedAuctionId > -1,
    args: [selectedAuctionId],
  });

  const {
    data: cancelAuctionData,
    isLoading: isCancelingAuction,
    isSuccess: isCanceledAuction,
    write: cancelAuctionFunction,
    error: cancelAuctionError,
  } = useContractWrite({ ...cancelAuctionConfig });

  const { config: endAuctionConfig } = usePrepareContractWrite({
    ...auctionContractConfig,
    functionName: 'endAuction',
    enabled: selectedAuctionId > -1,
    args: [selectedAuctionId],
  });

  const {
    data: endAuctionData,
    isLoading: isEndingAuction,
    isSuccess: isEndedAuction,
    write: endAuctionFunction,
    error: endAuctionError,
  } = useContractWrite({ ...endAuctionConfig });

  useEffect(() => {
    if (!address) setTokenList([]);
    else {
      setTokenQueryCompleted(false);
      setQueryTokenId(1);
      setTokenList([]);
      getUserAuctionList();
    }
  }, [address]);

  useEffect(() => {
    if (auctionList.length > 0) {
      getUserAuctionList();
    }
  }, [auctionList]);

  useEffect(() => {
    isApproved && createAuctionFunction?.();
  }, [isApproved]);

  useEffect(() => {
    isAuctionCreated && setAuctionListQueryCompleted(false);
    isAuctionCreated && setTokenQueryCompleted(false);
  }, [isAuctionCreated]);

  useEffect(() => {
    if (isCanceledAuction || isEndedAuction) {
      setAuctionListQueryCompleted(false);
      setTokenQueryCompleted(false);
      setSelectedAuctionId(-1);
    }
  }, [isCanceledAuction, isEndedAuction]);

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

  const getUserAuctionList = () => {
    const userAuctionList = auctionList.filter(
      (auction) => auction.seller === address
    );
    return setUserAuctionList([...userAuctionList]);
  };

  const handleNFTSelect = (tkn: number) => {
    setSelectedTokenId(tkn);
  };

  const handleCreateAuction = (e: any) => {
    e.preventDefault();
    setFormAuctionStartPrice(e.target.elements.startPrice.value);
    setFormAuctionBuyNowPrice(e.target.elements.buyNowPrice.value);

    if (
      e.target.elements.startPrice.value < e.target.elements.buyNowPrice.value
    ) {
      approveFunction?.();
    }
  };

  const handleSelectAuction = (index: number) => {
    setSelectedAuctionId(index);
  };

  const handleEndAuction = () => {
    if (
      selectedAuctionId > -1 &&
      new Date(currentTime) <
        new Date(auctionList[selectedAuctionId]?.endAt * 1000)
    ) {
      cancelAuctionFunction?.();
    } else if (selectedAuctionId > -1) {
      endAuctionFunction?.();
    }
  };

  return (
    <>
      <Head>
        <title>PatikaBears Auction</title>
        <meta name="description" content="PatikaBears Auction NFT" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Layout>
        <div className="flex gap-10">
          <div className="create-auction | nfts min-w-[500px]">
            <div className="nfts mr-8">
              {selectedTokenId > 0 ? (
                <>
                  <h1 className="text-2xl font-semibold text-slate-600">
                    Create Auction
                  </h1>
                  <div className="my-6 flex items-center justify-center gap-4">
                    <button
                      type="button"
                      className="rounded-3xl bg-[#d0d500] px-4 py-10 font-semibold text-slate-600 transition-all hover:scale-105 hover:text-white"
                      onClick={() => setSelectedTokenId(0)}
                    >
                      Go Back
                    </button>
                    <Image
                      width={150}
                      height={150}
                      className="rounded-xl"
                      src={`https://ipfs.io/ipfs/QmbWQXeFYfp7ozLq9V7N5X72tEFvFXHVbzfntTnNaXWkU6/${selectedTokenId}.png`}
                    />
                    <form
                      className="flex flex-col items-center justify-center text-slate-600"
                      onSubmit={handleCreateAuction}
                    >
                      <label className="py-2 font-semibold">
                        Enter Starting Price (ETH)
                      </label>
                      <input
                        className="rounded-xl border-2 border-slate-600 px-2"
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
                        className="rounded-xl border-2 border-slate-600 px-2"
                        name="buyNowPrice"
                        required
                        step="0.001"
                        min="0.001"
                        type="number"
                      />
                      <button
                        disabled={!isConnected}
                        className="mt-4 rounded-3xl bg-[#d0d500] p-2 font-semibold text-slate-600 transition-all hover:scale-105 hover:text-white disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100 disabled:hover:text-slate-600"
                        type="submit"
                      >
                        Create Auction
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <>
                  <h1 className="text-2xl font-semibold text-slate-600">
                    Your NFTs
                  </h1>
                  <div className="nftList my-4 grid grid-cols-2 gap-4">
                    {tokenQueryCompleted &&
                      tokenList &&
                      tokenList.map((tkn, index) => {
                        return (
                          <div
                            onClick={() => handleNFTSelect(tkn)}
                            key={index}
                            data-tokenid={tkn}
                            className="flex h-full w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-black p-3"
                          >
                            <Image
                              width={150}
                              height={150}
                              className="rounded-xl"
                              src={`https://ipfs.io/ipfs/QmbWQXeFYfp7ozLq9V7N5X72tEFvFXHVbzfntTnNaXWkU6/${tkn}.png`}
                            />
                            <button
                              type="button"
                              className="mt-3 rounded-3xl bg-[#d0d500] p-2 font-semibold text-slate-600 transition-all hover:scale-105 hover:text-white"
                            >
                              Click to Create Auction
                            </button>
                          </div>
                        );
                      })}
                  </div>
                </>
              )}
            </div>
            <div className="your-auctions mr-8">
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
            </div>
          </div>
          <div className="active-auctions">
            <div className="selected-auction">
              {selectedAuctionId > -1 &&
                auctionList &&
                auctionList[selectedAuctionId] && (
                  <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-black p-4">
                    <Image
                      width={250}
                      height={250}
                      className="rounded-xl"
                      src={`https://ipfs.io/ipfs/QmbWQXeFYfp7ozLq9V7N5X72tEFvFXHVbzfntTnNaXWkU6/${auctionList[selectedAuctionId]?.nftTokenId}.png`}
                    />
                    <div className="flex flex-col items-center justify-center gap-4 font-semibold text-slate-600">
                      <div className="mb-4 text-center">
                        <h2 className="text-2xl ">Seller</h2>
                        <p className="text-xl">
                          {auctionList[selectedAuctionId]?.seller}
                        </p>
                      </div>
                      <div className="mb-4 text-center">
                        <h2 className="text-2xl ">Start Price</h2>
                        <p className="text-xl">
                          {ethers.utils.formatEther(
                            auctionList[
                              selectedAuctionId
                            ]?.startPrice.toString()
                          )}{' '}
                          ETH
                        </p>
                      </div>
                      <div className="mb-4 text-center">
                        <h2 className="text-2xl ">Buy Now Price</h2>
                        <p className="text-xl">
                          {ethers.utils.formatEther(
                            auctionList[
                              selectedAuctionId
                            ]?.buyNowPrice.toString()
                          )}{' '}
                          ETH
                        </p>
                      </div>
                      <div className="mb-4 text-center">
                        <h2 className="text-2xl ">Highest Bid</h2>
                        <p className="text-xl">
                          {ethers.utils.formatEther(
                            auctionList[
                              selectedAuctionId
                            ]?.highestBid.toString()
                          )}{' '}
                          ETH
                        </p>
                      </div>
                      <div className="mb-4 text-center">
                        <h2 className="text-2xl ">Auction End</h2>
                        <p className="text-xl">
                          {moment
                            .duration(
                              moment(
                                auctionList[selectedAuctionId]?.endAt,
                                'X'
                              ).diff(currentTime)
                            )
                            .humanize(true)}
                        </p>
                      </div>
                      {auctionList[selectedAuctionId]?.canceled === 'true' && (
                        <div className="mb-4 text-center">
                          <h2 className="text-2xl">Auction has canceled!</h2>
                        </div>
                      )}
                      {new Date(currentTime) >
                        new Date(
                          auctionList[selectedAuctionId]?.endAt * 1000
                        ) && (
                        <div className="mb-4 text-center">
                          <h2 className="text-2xl">Auction has ended!</h2>
                        </div>
                      )}
                      <div>
                        {auctionList[selectedAuctionId]?.seller === address &&
                          !auctionList[selectedAuctionId]?.canceled && (
                            <button
                              onClick={handleEndAuction}
                              className="rounded-3xl bg-[#d0d500] p-2 font-semibold text-slate-600 transition-all hover:scale-105 hover:text-white"
                            >
                              End / Cancel Auction
                            </button>
                          )}
                        {auctionList[selectedAuctionId]?.seller !== address &&
                          new Date(currentTime) <
                            new Date(
                              auctionList[selectedAuctionId]?.endAt * 1000
                            ) && (
                            <div>
                              <div>
                                {isPlacedBid && (
                                  <p className="text-lg font-semibold text-green-700">
                                    You have placed a bid!
                                  </p>
                                )}
                                {isBoghtNow && (
                                  <p className="text-lg font-semibold text-green-600">
                                    You have bought the NFT!
                                  </p>
                                )}
                              </div>
                              {auctionList[selectedAuctionId]?.canceled ===
                                'false' && (
                                <div className="flex flex-row gap-8">
                                  <div className="flex flex-col items-center justify-center gap-4">
                                    <input
                                      className="w-1/2 rounded-xl border-2 border-slate-600 px-2"
                                      name="placeBid"
                                      step="0.001"
                                      min={ethers.utils.formatEther(
                                        auctionList[
                                          selectedAuctionId
                                        ]?.highestBid.toString()
                                      )}
                                      onChange={(e) =>
                                        setPlaceBidAmount(e.target.value)
                                      }
                                      type="number"
                                    />
                                    <button
                                      onClick={() => placeBidFunction?.()}
                                      className="rounded-3xl bg-[#d0d500] p-2 font-semibold text-slate-600 transition-all hover:scale-105 hover:text-white"
                                    >
                                      Place Bid
                                    </button>
                                  </div>
                                  <button
                                    onClick={() => buyNowFunction?.()}
                                    className="rounded-3xl bg-[#d0d500] p-2 font-semibold text-slate-600 transition-all hover:scale-105 hover:text-white"
                                  >
                                    Buy Now!
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                )}
            </div>
            <div className="auction-list mt-8">
              <h1 className="text-2xl font-semibold text-slate-600">
                Active Auctions
              </h1>
              <div className="grid grid-cols-3">
                {auctionList.length > 0 &&
                  auctionList.map((auction, index) => {
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
                        <p className="text-lg text-slate-600">
                          Highest Bid{' '}
                          {ethers.utils.formatEther(
                            auction.highestBid.toString()
                          )}{' '}
                          ETH
                        </p>
                        <p className="text-lg text-slate-600">
                          Buy Now{' '}
                          {ethers.utils.formatEther(
                            auction.buyNowPrice.toString()
                          )}{' '}
                          ETH
                        </p>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default Auction;
