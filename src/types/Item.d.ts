export type Item = {
  auctionId: string;
  nftTokenId: number;
  seller: string;
  startPrice: string;
  highestBid: string;
  buyNowPrice: string;
  endAt: number;
  isSold: boolean;
  isCanceled: boolean;
  isEnded: boolean;
};
