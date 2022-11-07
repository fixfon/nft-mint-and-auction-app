// src/pages/_app.tsx
import '../styles/globals.css';
import '@rainbow-me/rainbowkit/styles.css';
import type { AppType } from 'next/app';
import {
  RainbowKitProvider,
  getDefaultWallets,
  connectorsForWallets,
} from '@rainbow-me/rainbowkit';
import { chain, createClient, configureChains, WagmiConfig } from 'wagmi';
import { alchemyProvider } from 'wagmi/providers/alchemy';
// import { publicProvider } from 'wagmi/providers/public';

const { chains, provider, webSocketProvider } = configureChains(
  [chain.goerli],
  [alchemyProvider({ apiKey: 'IN-7aXF9TXjAKKIpctq5GQBtvXxJs2_v' })]
);

const appInfo = {
  appName: 'PatikaBears NFT Minting & Auctioning',
};

const { wallets } = getDefaultWallets({
  appName: 'PatikaBears NFT Minting & Auctioning',
  chains,
});

const connectors = connectorsForWallets([...wallets]);

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
  webSocketProvider,
});

const MyApp: AppType<{}> = ({ Component, pageProps: { ...pageProps } }) => {
  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider appInfo={appInfo} chains={chains}>
        <Component {...pageProps} />
      </RainbowKitProvider>
    </WagmiConfig>
  );
};

export default MyApp;
