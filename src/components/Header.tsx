import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';

const Header = () => {
  return (
    <header className="bg-[#d0d500]">
      <div className="container mx-auto flex items-center justify-between p-4">
        <h1 className="text-2xl font-bold text-slate-600">
          PatikaBears NFT Mint & Auction
        </h1>
        <nav className="flex items-center gap-10">
          <ul className="flex gap-6 text-2xl font-semibold">
            <li className="mr-4">
              <Link href="/">
                <a className="text-slate-600 transition-all hover:text-white">
                  Mint
                </a>
              </Link>
            </li>
            <li className="mr-4">
              <Link href="/auction">
                <a className="text-slate-600 transition-all hover:text-white">
                  Auction
                </a>
              </Link>
            </li>
          </ul>
          <ConnectButton />
        </nav>
      </div>
    </header>
  );
};

export default Header;
