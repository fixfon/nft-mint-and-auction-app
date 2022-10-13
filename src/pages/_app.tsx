// src/pages/_app.tsx
import '../styles/globals.css';
import type { AppType } from 'next/app';
import '@rainbow-me/rainbowkit/styles.css';

import {
  connectorsForWallets,
  getDefaultWallets,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { chain, configureChains, createClient, WagmiConfig } from 'wagmi';
import { alchemyProvider } from 'wagmi/providers/alchemy';

const MyApp: AppType<{}> = ({ Component, pageProps: { ...pageProps } }) => {
  const { chains, provider, webSocketProvider } = configureChains(
    [chain.goerli],
    [alchemyProvider({ apiKey: '_6gTeNHJyePn6cr9-GA2fWtiu7heKpP5' })]
  );

  const { wallets } = getDefaultWallets({
    appName: 'PatikaBears NFT Minting & Auctioning',
    chains,
  });

  const appInfo = {
    appName: 'PatikaBears NFT Minting & Auctioning',
  };
  const connectors = connectorsForWallets([...wallets]);

  const wagmiClient = createClient({
    autoConnect: true,
    connectors,
    provider,
    webSocketProvider,
  });
  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider appInfo={appInfo} chains={chains}>
        <Component {...pageProps} />
      </RainbowKitProvider>
    </WagmiConfig>
  );
};

export default MyApp;
