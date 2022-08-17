import React from 'react';
import { act, render } from '@testing-library/react';
import { WalletModel } from '../../../models/WalletModel/WalletModel';
import { DependencyService, useDependency } from '../../../services/injection/DependencyService';
import { MockWalletAdaptorService } from '../../../__mocks__/services/MockWalletAdaptor';
import { HomePageView } from './HomePageView';
import { MockCandyMachineModel } from '../../../__mocks__/models/candymachine/MockCandyMachineModel';
import { CandyMachineModel } from '../../../models/CandyMachine/CandyMachineModel';
import { DI_KEYS } from '../../../core/Constants';
import { CandyMachineCountDownTimerViewModel } from '../../../viewmodels/countdowntimer/CandyMachineCountDownTimerViewModel';
import { set } from 'lodash';

describe('HomePageView should work as expected', function () {
  beforeAll(() => {
    MockWalletAdaptorService.SetTestAdaptorService();
    MockCandyMachineModel.SetMockModel();

    DependencyService.registerValue(DI_KEYS.CANDY_MACHINE_ID, 'TEST111');
    DependencyService.registerValue(DI_KEYS.SOLANA_NETWORK, 'devnet');
    DependencyService.registerValue(DI_KEYS.SOLANA_RPC_HOST, 'https://api.devnet.solana.com');

    set(window, 'solana', {});
  });
  afterAll(() => {
    MockWalletAdaptorService.RestoreWalletAdaptorService();
    MockCandyMachineModel.RestoreOriginalModel();
  });

  beforeEach(() => {
    const walletModel = DependencyService.resolve<WalletModel>(WalletModel);
    walletModel.initialize();
    const candyMachineModel = DependencyService.resolve<CandyMachineModel>(CandyMachineModel);
    candyMachineModel.initialize();
  });
  afterEach(() => {
    const walletModel = DependencyService.resolve<WalletModel>(WalletModel);
    walletModel.end();
    const candyMachineModel = DependencyService.resolve<CandyMachineModel>(CandyMachineModel);
    candyMachineModel.end();
  });

  it('HomePageView should react to connect/disconnect by the Wallet', async () => {
    // wallet is NOT connected yet
    const walletAdaptor = MockWalletAdaptorService.GetMockWalletAdaptor();
    const { container, getByText } = render(<HomePageView />);
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

  it('should display the countdown timer', async () => {
    const timerVm = DependencyService.resolve(CandyMachineCountDownTimerViewModel);
    timerVm.labelString = 'Hello from candy machine test';
    const { container, getByText } = render(<HomePageView />);
    expect(container).toBeTruthy();

    expect(getByText(timerVm.labelString)).toBeInTheDocument();
  });
});
