import { delay, inject, injectable } from 'tsyringe';
import { SolanaModel, TokenAccountInfo } from './SolanaModel';
import { nanoid } from 'nanoid';
import { Keypair, PublicKey, Signer, TransactionInstruction } from '@solana/web3.js';
import { web3 } from '@project-serum/anchor';
import { MintLayout, Token, TOKEN_PROGRAM_ID, u64 } from '@solana/spl-token';

@injectable()
export class SolanaInstructionService {
  context: string;
  constructor(
    @inject(delay(() => SolanaModel)) public readonly solanaModel: Readonly<SolanaModel>
  ) {
    this.context = nanoid(10);
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
    const minLamports = await this.solanaModel.connection.getMinimumBalanceForRentExemption(
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

  public createApproveInstruction(
    tokenAccountAdr: PublicKey,
    delegate: PublicKey,
    owner: PublicKey,
    multiSigners: Array<Keypair>,
    amount: number | u64
  ): TransactionInstruction {
    return Token.createApproveInstruction(
      TOKEN_PROGRAM_ID,
      tokenAccountAdr,
      delegate,
      owner,
      multiSigners,
      amount
    );
  }

  public createRevokeInstruction(
    tokenAccountAdr: PublicKey,
    owner: PublicKey,
    multiSigners: Array<Keypair>
  ): TransactionInstruction {
    return Token.createRevokeInstruction(TOKEN_PROGRAM_ID, tokenAccountAdr, owner, multiSigners);
  }
}
