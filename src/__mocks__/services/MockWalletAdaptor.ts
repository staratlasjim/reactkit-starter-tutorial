import {
  Adapter,
  MessageSignerWalletAdapter,
  SendTransactionOptions,
  WalletName,
  WalletReadyState,
} from '@solana/wallet-adapter-base';
import {
  Connection,
  PublicKey,
  SendOptions,
  Transaction,
  TransactionSignature,
} from '@solana/web3.js';
import { DependencyService } from '../../services/injection/DependencyService';
import {
  IWalletAdaptorService,
  WalletAdaptorService,
} from '../../services/WalletAdaptorService/WalletAdaptorService';
import EventEmitter from 'eventemitter3';
import { delayExec } from '../../utils/PromiseUtils';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base/lib/cjs';

interface MockWalletAdaptorEvents {
  connect(publicKey: PublicKey): unknown;
  disconnect(): unknown;
}

export const MockWalletAdaptorName = 'TestAdaptor' as WalletName;

export class MockWalletAdaptorService implements IWalletAdaptorService {
  protected static originalWalletAdaptorService: IWalletAdaptorService;
  static SetTestAdaptorService() {
    const walletAdaptorService =
      DependencyService.resolve<WalletAdaptorService>(WalletAdaptorService);
    this.originalWalletAdaptorService = walletAdaptorService;
    DependencyService.registerAsSingleton(WalletAdaptorService, MockWalletAdaptorService);
  }
  static RestoreWalletAdaptorService() {
    DependencyService.registerAsSingleton(WalletAdaptorService, WalletAdaptorService);
  }

  static GetMockWalletAdaptor(config: any = {}): MockWalletAdaptor {
    return (
      DependencyService.resolve<MockWalletAdaptor>(MockWalletAdaptorName) ??
      new MockWalletAdaptor(config)
    );
  }

  getAdaptors(network: WalletAdapterNetwork): Array<Adapter> {
    return [new MockWalletAdaptor() as unknown as Adapter];
  }
}

const testPublicKey = 'CBaVaN6aAbZtiAwawRbzjX6ZhZgGnNPFc9zQq1N768km';

export class MockWalletAdaptor
  extends EventEmitter<MockWalletAdaptorEvents>
  implements MessageSignerWalletAdapter
{
  name: WalletName = MockWalletAdaptorName;
  url = 'https://testbad.app';
  icon =
    'data:image/svg+xml;base64,PHN2ZyBmaWxsPSJub25lIiBoZWlnaHQ9IjM0IiB3aWR0aD0iMzQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGxpbmVhckdyYWRpZW50IGlkPSJhIiB4MT0iLjUiIHgyPSIuNSIgeTE9IjAiIHkyPSIxIj48c3RvcCBvZmZzZXQ9IjAiIHN0b3AtY29sb3I9IiM1MzRiYjEiLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiM1NTFiZjkiLz48L2xpbmVhckdyYWRpZW50PjxsaW5lYXJHcmFkaWVudCBpZD0iYiIgeDE9Ii41IiB4Mj0iLjUiIHkxPSIwIiB5Mj0iMSI+PHN0b3Agb2Zmc2V0PSIwIiBzdG9wLWNvbG9yPSIjZmZmIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjZmZmIiBzdG9wLW9wYWNpdHk9Ii44MiIvPjwvbGluZWFyR3JhZGllbnQ+PGNpcmNsZSBjeD0iMTciIGN5PSIxNyIgZmlsbD0idXJsKCNhKSIgcj0iMTciLz48cGF0aCBkPSJtMjkuMTcwMiAxNy4yMDcxaC0yLjk5NjljMC02LjEwNzQtNC45NjgzLTExLjA1ODE3LTExLjA5NzUtMTEuMDU4MTctNi4wNTMyNSAwLTEwLjk3NDYzIDQuODI5NTctMTEuMDk1MDggMTAuODMyMzctLjEyNDYxIDYuMjA1IDUuNzE3NTIgMTEuNTkzMiAxMS45NDUzOCAxMS41OTMyaC43ODM0YzUuNDkwNiAwIDEyLjg0OTctNC4yODI5IDEzLjk5OTUtOS41MDEzLjIxMjMtLjk2MTktLjU1MDItMS44NjYxLTEuNTM4OC0xLjg2NjF6bS0xOC41NDc5LjI3MjFjMCAuODE2Ny0uNjcwMzggMS40ODQ3LTEuNDkwMDEgMS40ODQ3LS44MTk2NCAwLTEuNDg5OTgtLjY2ODMtMS40ODk5OC0xLjQ4NDd2LTIuNDAxOWMwLS44MTY3LjY3MDM0LTEuNDg0NyAxLjQ4OTk4LTEuNDg0Ny44MTk2MyAwIDEuNDkwMDEuNjY4IDEuNDkwMDEgMS40ODQ3em01LjE3MzggMGMwIC44MTY3LS42NzAzIDEuNDg0Ny0xLjQ4OTkgMS40ODQ3LS44MTk3IDAtMS40OS0uNjY4My0xLjQ5LTEuNDg0N3YtMi40MDE5YzAtLjgxNjcuNjcwNi0xLjQ4NDcgMS40OS0xLjQ4NDcuODE5NiAwIDEuNDg5OS42NjggMS40ODk5IDEuNDg0N3oiIGZpbGw9InVybCgjYikiLz48L3N2Zz4K';

  private _connecting: boolean;
  private _connected: boolean;
  private _publicKey: PublicKey | null;
  private _readyState: WalletReadyState =
    typeof window === 'undefined' || typeof document === 'undefined'
      ? WalletReadyState.Unsupported
      : WalletReadyState.NotDetected;

  constructor(config: any = {}) {
    super();
    this._connecting = config['connecting'] ?? false;
    this._connected = config['connected'] ?? false;
    this._publicKey = config['publicKey'] ?? this._connected ? new PublicKey(testPublicKey) : null;
    if (this._connected && this._publicKey) this.emit('connect', this._publicKey);
    DependencyService.registerValue(MockWalletAdaptorName, this);
  }

  get publicKey(): PublicKey | null {
    return this._publicKey;
  }

  get connecting(): boolean {
    return this._connecting;
  }

  get connected(): boolean {
    return this._connected;
  }

  get readyState(): WalletReadyState {
    return this._readyState;
  }

  sendTransaction(
    transaction: Transaction,
    connection: Connection,
    options?: SendTransactionOptions
  ): Promise<TransactionSignature> {
    return Promise.reject('Method not implemented');
  }

  signMessage(message: Uint8Array): Promise<Uint8Array> {
    throw new Error('Method not implemented.');
  }
  signTransaction(transaction: Transaction): Promise<Transaction> {
    throw new Error('Method not implemented.');
  }
  signAllTransactions(transaction: Transaction[]): Promise<Transaction[]> {
    throw new Error('Method not implemented.');
  }
  connect(): Promise<void> {
    this._connecting = true;
    return delayExec<void>(() => {
      this._connecting = false;
      this._connected = true;
      this._publicKey = new PublicKey(testPublicKey);
      this.emit('connect', this._publicKey);
    }, 200);
  }
  disconnect(): Promise<void> {
    return delayExec<void>(() => {
      this._connected = false;
      this._publicKey = null;
      this.emit('disconnect');
    }, 200);
  }
}
