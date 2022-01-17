import React from 'react';
import { render, act, fireEvent } from '@testing-library/react';
import { WalletModel } from '../../../models/WalletModel/WalletModel';
import { DependencyService } from '../../../services/injection/DependencyContext';
import { TestWalletAdaptorService } from '../../../__test__/TestWalletAdaptor';
import { WalletConnectView } from './WalletConnectView';

describe('WalletConnectView should work as expected', function () {
  beforeAll(() => {
    TestWalletAdaptorService.SetTestAdaptorList();
  });
  afterAll(() => {
    TestWalletAdaptorService.RestoreWalletAdaptorList();
  });

  beforeEach(() => {
    const walletModel = DependencyService.resolve<WalletModel>(WalletModel);
    walletModel.initialize();
  });
  afterEach(() => {
    const walletModel = DependencyService.resolve<WalletModel>(WalletModel);
    walletModel.end();
  });

  it('WalletViewModel should react to connect/disconnect by the Wallet', async () => {
    // wallet is NOT connected yet
    const walletAdaptor = TestWalletAdaptorService.GetTestWalletAdaptor();
    const { container, getByText } = render(<WalletConnectView />);
    expect(container).toBeTruthy();

    expect(getByText('Wallet connected: nope')).toBeInTheDocument();
    await act(async () => {
      await walletAdaptor.connect();
    });

    expect(
      getByText('Wallet connected: yep'),
      'wallet connected message should be there'
    ).toBeInTheDocument();
    expect(
      getByText(`Wallet Name: ${walletAdaptor.name}`),
      'wallet name should be in the component'
    ).toBeInTheDocument();
    expect(
      getByText(`Public Key: ${walletAdaptor.publicKey?.toBase58()}`),
      'wallet public should be in the component'
    ).toBeInTheDocument();

    await act(async () => {
      await walletAdaptor.disconnect();
    });

    expect(getByText('Wallet connected: nope')).toBeInTheDocument();
  });

  it('WalletConnectView should connect wallet by clicking button', async () => {
    const { container, getByText } = render(<WalletConnectView />);
    expect(container).toBeTruthy();
    // TODO: when we flush out our TestWallet Adaptor More, we'll figure this out.
    fireEvent.click(getByText('Select Wallet'));
  });
});
