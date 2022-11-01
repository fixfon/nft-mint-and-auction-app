import { PatikaBearsContract } from '../../../contractAddress';
import patikaBearsABI from '../../../artifacts/contracts/PatikaBears.sol/PatikaBears.json';
import { useEffect, useState } from 'react';
import { useAccount, useContractRead } from 'wagmi';
import Image from 'next/image';

const nftContractConfig = {
  address: PatikaBearsContract,
  abi: patikaBearsABI.abi,
};

const NFTBag = () => {
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
            <div key={tokenId}>
              <Image src={`/images/${tokenId}.png`} width={200} height={200} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NFTBag;
