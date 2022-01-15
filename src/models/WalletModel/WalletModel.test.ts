import { DependencyService } from '../../services/injection/DependencyContext';
import { WalletModel } from './WalletModel';

describe('WalletModel should work as expected', function () {
  it('WalletModel should respond to changes in the Wallet Adaptor', async () => {
    const walletModel = DependencyService.resolve<WalletModel>(WalletModel);
    expect(walletModel, 'Wallet Model should exist').toBeTruthy();
    expect(walletModel.adaptors, 'wallet should have adaptors').toBeTruthy();
    expect(
      walletModel.adaptors.length,
      'wallet should have more than 0 adaptors'
    ).toBeGreaterThanOrEqual(1);
  });
});
