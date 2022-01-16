import { DependencyService } from '../../services/injection/DependencyContext';
import { WalletModel } from './WalletModel';
import { PublicKey } from '@solana/web3.js';
import { Adapter } from '@solana/wallet-adapter-base';
import { TestWalletAdaptor, TestAdaptorName } from '../../__test__/TestWalletAdaptor';

describe('WalletModel should work as expected', function () {
  beforeAll(() => {
    TestWalletAdaptor.SetTestAdaptorList();
  });
  afterAll(() => {
    TestWalletAdaptor.RestoreWalletAdaptorList();
  });

  beforeEach(() => {
    const walletModel = DependencyService.resolve<WalletModel>(WalletModel);
    walletModel.initialize();
  });
  afterEach(() => {
    const walletModel = DependencyService.resolve<WalletModel>(WalletModel);
    walletModel.end();
  });

  it('WalletModel should respond to changes in the Wallet Adaptor', async () => {
    const walletModel = DependencyService.resolve<WalletModel>(WalletModel);
    expect(walletModel, 'Wallet Model should exist').toBeTruthy();
    expect(walletModel.adaptors, 'wallet should have adaptors').toBeTruthy();
    expect(
      walletModel.adaptors.length,
      'wallet should have more than 0 adaptors'
    ).toBeGreaterThanOrEqual(1);
    expect(walletModel.adaptors[0].name, 'should have test adaptor').toEqual(TestAdaptorName);
  });
});
