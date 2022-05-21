import React from 'react';
import { act, render } from '@testing-library/react';
import { WalletModel } from '../../../models/WalletModel/WalletModel';
import { DependencyService, useDependency } from '../../../services/injection/DependencyService';
import { MockWalletAdaptorService } from '../../../__mocks__/services/MockWalletAdaptor';
import { MockCandyMachineModel } from '../../../__mocks__/models/candymachine/MockCandyMachineModel';
import { CandyMachineModel } from '../../../models/CandyMachine/CandyMachineModel';
import { DI_KEYS } from '../../../core/Constants';
import { CandyMachineInfoView } from './CandyMachineInfoView';
import { awaitReaction } from '../../../core/ObservableReactionContainer';

describe('HomePageView should work as expected', function () {
  beforeAll(() => {
    MockWalletAdaptorService.SetTestAdaptorService();
    MockCandyMachineModel.SetMockModel();

    DependencyService.registerValue(DI_KEYS.CANDY_MACHINE_ID, 'TEST111');
    DependencyService.registerValue(DI_KEYS.SOLANA_NETWORK, 'devnet');
    DependencyService.registerValue(DI_KEYS.SOLANA_RPC_HOST, 'https://api.devnet.solana.com');
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
    const walletAdaptor = MockWalletAdaptorService.GetMockWalletAdaptor();
    await act(async () => {
      await walletAdaptor.connect();
    });

    const candyMachine = DependencyService.resolve<CandyMachineModel>(CandyMachineModel);
    const { container, getByText } = render(<CandyMachineInfoView />);
    expect(container).toBeTruthy();

    //
    expect(
      getByText(`Waiting for CM to initialize`),
      'should be waiting for the CM to initialize'
    ).toBeInTheDocument();

    await act(async () => {
      await await awaitReaction(
        () => candyMachine.isInitialized,
        () => true
      );
    });

    // should be initialized now!
    expect(
      getByText(`Candy Machine ID: ${candyMachine.candyMachineId}`),
      'candy machine id should exist'
    ).toBeInTheDocument();
    expect(
      getByText(`Items Available: ${candyMachine.itemsAvailable}`),
      'itemsAvailable should be in the component'
    ).toBeInTheDocument();
    expect(
      getByText(`Items Remaining: ${candyMachine.itemsRemaining}`),
      'itemsRemaining should be in the component'
    ).toBeInTheDocument();

    expect(
      getByText(`Items Redeemed: ${candyMachine.itemsRedeemed}`),
      'itemsRedeemed should be in the component'
    ).toBeInTheDocument();

    expect(
      getByText(`Go Live Date: ${candyMachine.goLiveDateTime}`),
      'goLiveDateTime should be in the component'
    ).toBeInTheDocument();
    await act(async () => {
      await walletAdaptor.disconnect();
    });

    expect(
      getByText('Connect wallet with button above !!!!'),
      'text informing user to connect wallet should be there'
    ).toBeInTheDocument();
  });
});
