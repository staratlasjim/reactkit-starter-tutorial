import '@abraham/reflection';
import { injectable, Lifecycle, scoped, singleton } from 'tsyringe';
import { Adapter } from '@solana/wallet-adapter-base';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  SolletExtensionWalletAdapter,
  SolletWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base/lib/cjs';

@singleton()
export class WalletAdaptorService {
  constructor() {}
  getAdaptors(network: WalletAdapterNetwork): Array<Adapter> {
    return [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new SolletWalletAdapter({ network }),
      new SolletExtensionWalletAdapter({ network }),
    ];
  }
}
