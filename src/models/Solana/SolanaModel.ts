import { Model } from '../Model';
import { Provider, web3 } from '@project-serum/anchor';
import { MintLayout, Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { DependencyService } from '../../services/injection/DependencyContext';
import { DI_KEYS } from '../../core/Constants';
import { Connection, PublicKey, Signer, TransactionInstruction } from '@solana/web3.js';
import { get } from 'lodash';
import { singleton } from 'tsyringe';

export type TokenAccountInfo = {
  mintAddress: PublicKey;
  quantity: number;
};

@singleton()
export class SolanaModel extends Model {
  protected _provider: Provider | null = null;
  protected _connection: Connection | null = null;

  static readonly TOKEN_METADATA_PROGRAM_ID = new web3.PublicKey(
    'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'
  );

  static readonly SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID = new web3.PublicKey(
    'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'
  );

  static readonly CIVIC = new web3.PublicKey('gatem74V238djXdzWnJf94Wo1DcnuGkfijbf3AuBhfs');

  protected onInitialize(): void {
    if (typeof window === 'undefined') return;

    this.setUpConnection();
    this.setUpProvider();
  }

  protected onEnd() {
    super.onEnd();
    this._provider = null;
    this._connection = null;
  }

  protected setUpConnection() {
    const rpcHost: string = DependencyService.resolve(DI_KEYS.SOLANA_RPC_HOST);
    if (!rpcHost) throw new Error('~~~ No RPC Host provided by ENV');

    this._connection = new Connection(rpcHost);
  }

  protected setUpProvider() {
    const conn = this.connection;
    const solana = get(window, 'solana');
    if (!solana) throw new Error('~~~ No Solana Object found on window');
    this._provider = new Provider(conn, solana, Provider.defaultOptions());
  }

  get connection(): Connection {
    if (!this._connection) this.setUpConnection();

    return this._connection as Connection;
  }

  get provider(): Provider {
    if (!this._provider) this.setUpProvider();

    return this._provider as Provider;
  }

  public async getAssociatedTokenAccountForToken(
    tokenMintAddress: PublicKey,
    buyersAddress: PublicKey
  ): Promise<TokenAccountInfo> {
    const tokenAcctData = await web3.PublicKey.findProgramAddress(
      [buyersAddress.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), tokenMintAddress.toBuffer()],
      SolanaModel.SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID
    );

    return { mintAddress: tokenAcctData[0], quantity: tokenAcctData[1] };
  }

  public async getAssociatedTokenAccountAddressForToken(
    tokenMintAddress: PublicKey,
    buyersAddress: PublicKey
  ): Promise<PublicKey> {
    const tokenAcctInfo = await this.getAssociatedTokenAccountForToken(
      tokenMintAddress,
      buyersAddress
    );
    return tokenAcctInfo.mintAddress;
  }

  public createInitMintInstructionForUsersPublicKey(
    tokenMintAddress: PublicKey,
    mintAuthorityAddress: PublicKey,
    freezeAuthorityAddress: PublicKey,
    decimals: number = 6
  ): TransactionInstruction {
    return Token.createInitMintInstruction(
      TOKEN_PROGRAM_ID,
      tokenMintAddress,
      decimals,
      mintAuthorityAddress,
      freezeAuthorityAddress
    );
  }

  public async createMintAccountInstruction(
    tokenMintAddress: PublicKey,
    walletPubKey: PublicKey
  ): Promise<TransactionInstruction> {
    const minLamports = await this.provider.connection.getMinimumBalanceForRentExemption(
      MintLayout.span
    );
    return web3.SystemProgram.createAccount({
      fromPubkey: walletPubKey,
      newAccountPubkey: tokenMintAddress,
      space: MintLayout.span,
      lamports: minLamports,
      programId: TOKEN_PROGRAM_ID,
    });
  }

  public createMintToInstruction(
    tokenMintAddress: PublicKey,
    tokenAccountAddress: PublicKey,
    walletPubKey: PublicKey,
    multiSigners: Array<Signer> = [],
    amountToMint: number = 1
  ): TransactionInstruction {
    return Token.createMintToInstruction(
      TOKEN_PROGRAM_ID,
      tokenMintAddress,
      tokenAccountAddress,
      walletPubKey,
      multiSigners,
      amountToMint
    );
  }

  public createAssociatedTokenAccountInstruction(
    associatedTokenAddress: PublicKey,
    payer: PublicKey,
    walletAddress: PublicKey,
    splTokenMintAddress: PublicKey
  ): TransactionInstruction {
    const keys = [
      { pubkey: payer, isSigner: true, isWritable: true },
      { pubkey: associatedTokenAddress, isSigner: false, isWritable: true },
      { pubkey: walletAddress, isSigner: false, isWritable: false },
      { pubkey: splTokenMintAddress, isSigner: false, isWritable: false },
      {
        pubkey: web3.SystemProgram.programId,
        isSigner: false,
        isWritable: false,
      },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      {
        pubkey: web3.SYSVAR_RENT_PUBKEY,
        isSigner: false,
        isWritable: false,
      },
    ];
    return new TransactionInstruction({
      keys,
      programId: SolanaModel.SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
      data: Buffer.from([]),
    });
  }
}
