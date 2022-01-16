import { getViewModelForTest } from '../../__test__/TestViewModelUtils';
import { WalletViewModel } from './WalletViewModel';
import { TestWalletAdaptorService } from '../../__test__/TestWalletAdaptor';
import { DependencyService } from '../../services/injection/DependencyContext';
import { WalletModel } from '../../models/WalletModel/WalletModel';
import { awaitReaction } from '../../core/ObservableReactionContainer';

describe('WalletViewModel should work as expected', function () {
  let walletVM: WalletViewModel;
  let unmount: Function;

  beforeAll(() => {
    TestWalletAdaptorService.SetTestAdaptorList();
  });
  afterAll(() => {
    TestWalletAdaptorService.RestoreWalletAdaptorList();
  });

  beforeEach(() => {
    const walletModel = DependencyService.resolve<WalletModel>(WalletModel);
    walletModel.initialize();
    const { vm, unmount: ufunc } = getViewModelForTest<WalletViewModel>(WalletViewModel);
    walletVM = vm;
    unmount = ufunc;
  });
  afterEach(() => {
    const walletModel = DependencyService.resolve<WalletModel>(WalletModel);
    walletModel.end();
    unmount();
  });

  it('WalletViewModel should ', async () => {
    const walletAdaptor = TestWalletAdaptorService.GetTestWalletAdaptor();
    expect(walletVM.connected, 'WalletVM should not be connected').toBeFalsy();
    walletAdaptor.connect();
    const isConnected = await awaitReaction(
      () => walletVM.connected,
      (val) => val
    );
    expect(isConnected, 'we should have connected correctly').toBeTruthy();
    expect(walletVM.connected, 'WalletVM should reflect being connected').toBeTruthy();
    expect(walletAdaptor.connected, 'Wallet Adaptor should be connected').toBeTruthy();
    expect(walletAdaptor.connecting, 'Wallet Adaptor should not be connecting anymore').toBeFalsy();
    expect(walletVM.name, 'WalletVM should have the correct name').toEqual(walletAdaptor.name);

    expect(
      walletAdaptor.publicKey?.toBase58(),
      'Wallet Adaptor PubKey should be the same as the WalletVM'
    ).toEqual(walletVM.publicKey);

    walletAdaptor.disconnect();

    const isDisconnected = await awaitReaction(
      () => walletVM.connected,
      (val) => val
    );
    expect(isDisconnected, 'WalletVM should be disconnected').toBeFalsy();
    expect(walletVM.connected, 'WalletVM should reflect being disconnected').toBeFalsy();
    expect(walletAdaptor.connected, 'Wallet Adaptor should be disconnected').toBeFalsy();
    expect(walletVM.publicKey.length, 'WalletVM Public key should be empty').toEqual(0);
  });
});
