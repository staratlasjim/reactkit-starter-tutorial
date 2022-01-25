import { Model } from '../Model';
import { singleton } from 'tsyringe';
import { SolanaModel, TokenAccountInfo } from '../Solana/SolanaModel';
import { action, makeObservable, observable, runInAction } from 'mobx';
import { DI_KEYS } from '../../core/Constants';
import { Program, web3 } from '@project-serum/anchor';
import { DependencyService } from '../../services/injection/DependencyContext';
import { isEmpty } from 'lodash';
import { WalletModel } from '../WalletModel/WalletModel';
import { MintLayout, Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { Keypair, PublicKey, SystemProgram } from '@solana/web3.js';

export interface ICandyMachineModel {
  getCandyMachineState(): Promise<void>;
  logData(): void;
}

@singleton()
export class CandyMachineModel extends Model implements ICandyMachineModel {
  static readonly CandyMachineProgramAddress = new web3.PublicKey(
    'cndy3Z4yapfJBmL3ShUp5exZKqR3z33thTzeNMm2gRZ'
  );
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
    this.getCandyMachineState().then(() => {
      runInAction(() => (this.isInitialized = true));
    });
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

    const candyMachineAddress = this.candyMachine.id;
    const remainingAccounts: any[] = [];
    const signers = [nftMintAddress];

    const instructions = [
      this.createMintAccountInstruction(nftMintAddress.publicKey),
      this.createInitMintInstructionForUsersPublicKey(nftMintAddress),
      this.solanaModel.createAssociatedTokenAccountInstruction(
        usersTokenAccountAddress,
        walletPubKey,
        walletPubKey,
        nftMintAddress.publicKey
      ),
      this.solanaModel.createMintToInstruction(
        nftMintAddress.publicKey,
        usersTokenAccountAddress,
        walletPubKey,
        [],
        1
      ),
    ];

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

    instructions.push();
  }

  private createInitMintInstructionForUsersPublicKey(nftMintAddress: Keypair) {
    return this.solanaModel.createInitMintInstructionForUsersPublicKey(
      nftMintAddress.publicKey,
      this.walletModel.pubKey,
      this.walletModel.pubKey,
      0
    );
  }

  private createMintAccountInstruction(nftMintAddress: PublicKey) {
    return this.solanaModel.createMintAccountInstruction(nftMintAddress, this.walletModel.pubKey);
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
