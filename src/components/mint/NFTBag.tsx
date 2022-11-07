import { PatikaBearsContract } from '../../../contractAddress';
import patikaBearsABI from '../../../artifacts/contracts/PatikaBears.sol/PatikaBears.json';
import { useEffect, useState } from 'react';
import { useAccount, useContractRead } from 'wagmi';
import Image from 'next/image';

const nftContractConfig = {
  address: PatikaBearsContract,
  abi: patikaBearsABI.abi,
};

interface NFTBagProps {
  createAuction?: boolean;
  setSelectedTokenId?: (tokenId: number) => void;
}

const NFTBag = ({ createAuction = false, setSelectedTokenId }: NFTBagProps) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [tokenList, setTokenList] = useState<number[]>([]);

  const { isConnected, address } = useAccount();

  const { data: tokenListRaw, isLoading: isTokenListLoading } = useContractRead(
    {
      ...nftContractConfig,
      functionName: 'tokensOfOwner',
      watch: true,
      enabled: isConnected,
      args: [address],
    }
  );

  useEffect(() => {
    setTokenList(tokenListRaw?.toString().split(',').map(Number) || []);
  }, [tokenListRaw]);

  return (
    <div className="flex items-center justify-center">
      {mounted && isConnected && !isTokenListLoading && tokenList && (
        <div className="grid grid-cols-1 place-items-center gap-8 md:grid-cols-3">
          {tokenList.map((tokenId) => (
            <div
              className={createAuction ? 'w-48 cursor-pointer border-2 rounded-lg border-white p-1' : 'w-48'}
              key={tokenId}
              onClick={() => setSelectedTokenId && setSelectedTokenId(tokenId)}
            >
              <h2 className='text-center text-neutral text-xl font-semibold bg-highlight rounded mb-1'>PatikaBears #{tokenId}</h2>
              <Image src={`/images/${tokenId}.png`} width={192} height={192} />
              {createAuction && (
                <button
                  type="button"
                  className="w-full rounded-lg py-2 bg-highlight text-center font-semibold text-neutral transition-transform hover:scale-105"
                >
                  Create Auction
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NFTBag;
