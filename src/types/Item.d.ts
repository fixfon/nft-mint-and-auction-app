export type Item = {
  auctionId: string;
  nftTokenId: number;
  highestBid: number;
  buyNowPrice: number;
  endAt: number;
  isSold: boolean;
  isCanceled: boolean;
  isEnded: boolean;
};
