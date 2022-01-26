import { Model } from '../Model';
import { delay, inject, singleton } from 'tsyringe';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { Keypair, PublicKey, SystemProgram, TransactionInstruction } from '@solana/web3.js';
import { Program, web3 } from '@project-serum/anchor';
import { action, makeObservable, observable, runInAction } from 'mobx';

import { SolanaModel, TokenAccountInfo } from '../Solana/SolanaModel';
import { DI_KEYS } from '../../core/Constants';

import { DependencyService } from '../../services/injection/DependencyContext';
import { isEmpty } from 'lodash';
import { WalletModel } from '../WalletModel/WalletModel';

export interface ICandyMachineModel {
  getCandyMachineState(): Promise<void>;
  logData(): void;
}

@singleton()
export class CandyMachineModel extends Model implements ICandyMachineModel {
  static readonly CandyMachineProgramAddress = new web3.PublicKey(
    'cndy3Z4yapfJBmL3ShUp5exZKqR3z33thTzeNMm2gRZ'
  );
  static readonly CIVIC = new web3.PublicKey('gatem74V238djXdzWnJf94Wo1DcnuGkfijbf3AuBhfs');
  isInitialized = false;
  candyMachineId: string;
  itemsAvailable = 0;
  itemsRedeemed = 0;
  itemsRemaining = 0;
  goLiveData = 0;
  preSale = 0;
  goLiveDateTime = '';

  protected _candyMachineInfo: unknown;

  constructor(protected solanaModel: SolanaModel, protected walletModel: WalletModel) {
    super();
    this.candyMachineId = DependencyService.resolve(DI_KEYS.CANDY_MACHINE_ID);
    makeObservable(this, {
      isInitialized: observable,
      itemsAvailable: observable,
      itemsRedeemed: observable,
      itemsRemaining: observable,
      goLiveData: observable,
      preSale: observable,
      goLiveDateTime: observable,
      getCandyMachineState: action.bound,
    });
  }

  protected onInitialize(): void {
    this.isInitialized = false;
    this.walletModel.initialize();
    this.solanaModel.initialize();
    this.getCandyMachineState().then(() => {
      runInAction(() => (this.isInitialized = true));
    });
  }

  protected onEnd() {
    super.onEnd();
    this.walletModel.end();
    this.solanaModel.end();
  }

  get candyMachine(): any {
    return this._candyMachineInfo;
  }

  public async getCandyMachineCreatorTokenAccount(candyMachine: any): Promise<TokenAccountInfo> {
    const candyMachineId = new PublicKey(candyMachine);
    const data = await PublicKey.findProgramAddress(
      [Buffer.from('candy_machine'), candyMachineId.toBuffer()],
      CandyMachineModel.CandyMachineProgramAddress
    );
    return { mintAddress: data[0], quantity: data[1] };
  }

  //TODO: look at moving to SolanaModel
  public async getMetaDataAddress(nftMintAddress: PublicKey): Promise<PublicKey> {
    const data: [PublicKey, number] = await PublicKey.findProgramAddress(
      [
        Buffer.from('metadata'),
        SolanaModel.TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        nftMintAddress.toBuffer(),
      ],
      SolanaModel.TOKEN_METADATA_PROGRAM_ID
    );

    return data[0];
  }

  //TODO: look at moving to SolanaModel
  public async getMasterEditionAddress(nftMintAddress: PublicKey): Promise<PublicKey> {
    const data: [PublicKey, number] = await PublicKey.findProgramAddress(
      [
        Buffer.from('metadata'),
        SolanaModel.TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        nftMintAddress.toBuffer(),
        Buffer.from('edition'),
      ],
      SolanaModel.TOKEN_METADATA_PROGRAM_ID
    );

    return data[0];
  }

  public async getCandyMachineState() {
    if (typeof window === 'undefined') return;

    const candyMachineProgramId = CandyMachineModel.CandyMachineProgramAddress;

    if (!this.candyMachineId || isEmpty(this.candyMachineId))
      throw new Error('Error: No candy machine id');
    const provider = this.solanaModel.provider;

    const idl = await Program.fetchIdl(candyMachineProgramId, provider);
    if (!idl) throw new Error(`Unable to fetch idl for ${candyMachineProgramId}`);

    const program = new Program(idl, candyMachineProgramId, provider);
    const candyMachine = await program.account.candyMachine.fetch(this.candyMachineId);

    if (!candyMachine)
      throw new Error(`Unable to fetch candyMachineInfo for ${this.candyMachineId}`);

    this._candyMachineInfo = candyMachine;
    this.itemsAvailable = candyMachine.data.itemsAvailable.toNumber();
    this.itemsRedeemed = candyMachine.itemsRedeemed.toNumber();
    this.itemsRemaining = this.itemsAvailable - this.itemsRedeemed;
    this.goLiveData = candyMachine.data.goLiveDate.toNumber();
    this.preSale =
      candyMachine.data.whitelistMintSettings &&
      candyMachine.data.whitelistMintSettings.presale &&
      (!candyMachine.data.goLiveDate ||
        candyMachine.data.goLiveDate.toNumber() > new Date().getTime() / 1000);

    // We will be using this later in our UI so let's generate this now
    this.goLiveDateTime = `${new Date(this.goLiveData * 1000).toUTCString()}`;

    this.logData();
  }

  public async mintToken() {
    const nftMintAddress = web3.Keypair.generate();
    const walletPubKey = this.walletModel.pubKey;

    const usersTokenAccountAddress =
      await this.solanaModel.getAssociatedTokenAccountAddressForToken(
        nftMintAddress.publicKey,
        walletPubKey
      );

    const candyMachineTokenMint = this.candyMachine.tokenMint;
    const userPayingAccountAddress = candyMachineTokenMint
      ? await this.solanaModel.getAssociatedTokenAccountAddressForToken(
          candyMachineTokenMint,
          walletPubKey
        )
      : walletPubKey;

    const signers = [nftMintAddress];

    const { instructions, cleanupInstructions } = await this.getMintTokenInstructions(
      nftMintAddress,
      walletPubKey,
      usersTokenAccountAddress,
      userPayingAccountAddress,
      signers
    );

    try {
      const data = await this.solanaModel.sendTransactions(
        [instructions, cleanupInstructions],
        [signers, []]
      );
      return data.txs.map((t) => t.txid);
    } catch (e) {
      console.error('Error sending candy machine transaction', e);
      throw e;
    }
  }

  protected async getMintTokenInstructions(
    nftMintAddress: Keypair,
    walletPubKey: PublicKey,
    usersTokenAccountAddress: PublicKey,
    userPayingAccountAddress: PublicKey,
    signers: Array<Keypair>
  ): Promise<{
    instructions: Array<TransactionInstruction>;
    cleanupInstructions: Array<TransactionInstruction>;
  }> {
    const candyMachineAddress = this.candyMachine.id;

    const remainingAccounts: any[] = [];
    const cleanupInstructions: Array<TransactionInstruction> = [];

    const createMintAcctInstructions = await this.createMintAccountInstruction(
      nftMintAddress.publicKey
    );
    const createInitMintInstructions =
      this.createInitMintInstructionForUsersPublicKey(nftMintAddress);
    const createAssocTokenAcctInstr = this.solanaModel.createAssociatedTokenAccountInstruction(
      usersTokenAccountAddress,
      walletPubKey,
      walletPubKey,
      nftMintAddress.publicKey
    );
    const createMintToInstr = this.solanaModel.createMintToInstruction(
      nftMintAddress.publicKey,
      usersTokenAccountAddress,
      walletPubKey,
      [],
      1
    );

    const instructions = [
      createMintAcctInstructions,
      createInitMintInstructions,
      createAssocTokenAcctInstr,
      createMintToInstr,
    ];

    if (this.candyMachine.state.gatekeeper) {
      console.log('~~~ Has gatekeeper');
      await this.handleMintWithGateKeeper(remainingAccounts);
    }

    if (this.candyMachine.state.whitelistMintSettings) {
      console.log('~~~ Has white list mint settings');
      await this.handleMintWithWhiteListSettings(
        remainingAccounts,
        instructions,
        signers,
        cleanupInstructions
      );
    }

    if (this.candyMachine.state.tokenMint) {
      this.createTokenMintInstructions(
        signers,
        remainingAccounts,
        userPayingAccountAddress,
        instructions,
        cleanupInstructions
      );
    }

    const metaDataAddress = await this.getMetaDataAddress(nftMintAddress.publicKey);
    const masterEditionAddress = await this.getMasterEditionAddress(nftMintAddress.publicKey);

    const { mintAddress: candyMachineCreatorAdr, quantity: creatorBump } =
      await this.getCandyMachineCreatorTokenAccount(candyMachineAddress);

    const mintNftInstructions = await this.candyMachine.program.instruction.mintNft(creatorBump, {
      accounts: {
        candyMachine: candyMachineAddress,
        candyMachineCreator: candyMachineCreatorAdr,
        payer: walletPubKey,
        wallet: this.candyMachine.state.treasury,
        mint: nftMintAddress.publicKey,
        metadata: metaDataAddress,
        masterEdition: masterEditionAddress,
        mintAuthority: walletPubKey,
        updateAuthority: walletPubKey,
        tokenMetadataProgram: SolanaModel.TOKEN_METADATA_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: web3.SYSVAR_RENT_PUBKEY,
        clock: web3.SYSVAR_CLOCK_PUBKEY,
        recentBlockhashes: web3.SYSVAR_RECENT_BLOCKHASHES_PUBKEY,
        instructionSysvarAccount: web3.SYSVAR_INSTRUCTIONS_PUBKEY,
      },
      remainingAccounts: remainingAccounts.length > 0 ? remainingAccounts : undefined,
    });

    instructions.push(mintNftInstructions);

    return { instructions, cleanupInstructions };
  }

  protected createTokenMintInstructions(
    signers: Array<Keypair>,
    remainingAccounts: any[],
    userPayingAccountAddress: PublicKey,
    instructions: TransactionInstruction[],
    cleanupInstructions: Array<TransactionInstruction>
  ) {
    const transferAuthorityKeyPair = Keypair.generate();
    signers.push(transferAuthorityKeyPair);
    remainingAccounts.push({
      pubkey: userPayingAccountAddress,
      isWritable: true,
      isSigner: false,
    });
    remainingAccounts.push({
      pubkey: transferAuthorityKeyPair.publicKey,
      isWritable: false,
      isSigner: true,
    });

    instructions.push(
      this.solanaModel.createApproveInstruction(
        userPayingAccountAddress,
        transferAuthorityKeyPair.publicKey,
        this.walletModel.pubKey,
        [],
        this.candyMachine.state.price.toNumber()
      )
    );
    cleanupInstructions.push(
      this.solanaModel.createRevokeInstruction(
        userPayingAccountAddress,
        this.walletModel.pubKey,
        []
      )
    );
  }

  protected async handleMintWithGateKeeper(remainingAccounts: any[]) {
    const gateWayPubKey = (
      await this.getGateWayNetworkTokenAddress(
        this.walletModel.pubKey,
        this.candyMachine.state.gatekeeper.gatekeeperNetwork
      )
    ).mintAddress;
    remainingAccounts.push({ pubkey: gateWayPubKey, isWritable: true, isSigner: false });

    if (this.candyMachine.state.gatekeeper.expireOnUse) {
      remainingAccounts.push({
        pubkey: CandyMachineModel.CIVIC,
        isWritable: false,
        isSigner: false,
      });
      const networkExpire = await this.getGateWayNetworkExpire(
        this.candyMachine.state.gatekeeper.gatekeeperNetwork
      );

      remainingAccounts.push({
        pubkey: networkExpire.mintAddress,
        isWritable: false,
        isSigner: false,
      });
    }
  }

  protected async handleMintWithWhiteListSettings(
    remainingAccounts: any[],
    instructions: Array<TransactionInstruction>,
    signers: Array<Keypair>,
    cleanupInstructions: Array<TransactionInstruction>
  ) {
    const mint = new web3.PublicKey(this.candyMachine.state.whitelistMintSettings.mint);

    const whiteListTokenAccountAdr =
      await this.solanaModel.getAssociatedTokenAccountAddressForToken(
        mint,
        this.walletModel.pubKey
      );
    remainingAccounts.push({
      pubkey: whiteListTokenAccountAdr,
      isWritable: true,
      isSigner: false,
    });

    if (this.candyMachine.state.whitelistMintSettings.mode.burnEveryTime) {
      const whitelistBurnAuthority = web3.Keypair.generate();

      remainingAccounts.push({
        pubkey: mint,
        isWritable: true,
        isSigner: false,
      });
      remainingAccounts.push({
        pubkey: whitelistBurnAuthority.publicKey,
        isWritable: false,
        isSigner: true,
      });
      signers.push(whitelistBurnAuthority);
      const exists = await this.candyMachine.program.provider.connection.getAccountInfo(
        whiteListTokenAccountAdr
      );
      if (exists) {
        instructions.push(
          this.solanaModel.createApproveInstruction(
            whiteListTokenAccountAdr,
            whitelistBurnAuthority.publicKey,
            this.walletModel.pubKey,
            [],
            1
          )
        );
        cleanupInstructions.push(
          this.solanaModel.createRevokeInstruction(
            whiteListTokenAccountAdr,
            this.walletModel.pubKey,
            []
          )
        );
      }
    }
  }

  protected createInitMintInstructionForUsersPublicKey(nftMintAddress: Keypair) {
    return this.solanaModel.createInitMintInstructionForUsersPublicKey(
      nftMintAddress.publicKey,
      this.walletModel.pubKey,
      this.walletModel.pubKey,
      0
    );
  }

  protected createMintAccountInstruction(nftMintAddress: PublicKey) {
    return this.solanaModel.createMintAccountInstruction(nftMintAddress, this.walletModel.pubKey);
  }

  protected async getGateWayNetworkTokenAddress(
    walletPubKey: PublicKey,
    gateKeeperNetwork: PublicKey
  ): Promise<TokenAccountInfo> {
    const data: [PublicKey, number] = await web3.PublicKey.findProgramAddress(
      [
        walletPubKey.toBuffer(),
        Buffer.from('gateway'),
        Buffer.from([0, 0, 0, 0, 0, 0, 0, 0]),
        gateKeeperNetwork.toBuffer(),
      ],
      CandyMachineModel.CIVIC
    );
    return { mintAddress: data[0], quantity: data[1] };
  }

  protected async getGateWayNetworkExpire(gatekeeperNetwork: PublicKey): Promise<TokenAccountInfo> {
    const data = await web3.PublicKey.findProgramAddress(
      [gatekeeperNetwork.toBuffer(), Buffer.from('expire')],
      CandyMachineModel.CIVIC
    );

    return { mintAddress: data[0], quantity: data[1] };
  }

  public logData() {
    console.log(
      this.itemsAvailable,
      this.itemsRedeemed,
      this.itemsRemaining,
      this.goLiveData,
      this.goLiveDateTime,
      this.preSale
    );
  }
}
