import { singleton } from 'tsyringe';
import { Model } from '../Model';
import { SolanaModel } from '../Solana/SolanaModel';
import { PublicKey } from '@solana/web3.js';
import {
  CreateMasterEditionV3,
  Metadata,
  MetadataDataData,
} from '@metaplex-foundation/mpl-token-metadata';
import { Wallet, actions } from '@metaplex/js';

import { isString } from 'lodash';
import axios from 'axios';
import * as spl from 'easy-spl';
import { WalletModel } from '../WalletModel/WalletModel';
import { WalletI } from 'easy-spl';
import BN from 'bn.js';

export type SecondaryMetaDataType = {
  name: string;
  symbol: string;
  sellerFeeBasisPoints: number;
  description: string;
  image: string;
  properties?: {
    creators: [
      {
        address: string;
        share: number;
      }
    ];
    files: [
      {
        uri: string;
        type: string;
      }
    ];
  };
  collection?: {
    name: string;
    family: string;
  };
};

export interface MintNFTResponse {
  txId: string;
  mint: PublicKey;
  metadata: PublicKey;
  edition: PublicKey;
}

@singleton()
export class MetaPlexModel extends Model {
  constructor(protected solanaModel: SolanaModel, protected walletModel: WalletModel) {
    super();
  }

  protected onInitialize(): void {
    this.solanaModel.initialize();
    this.walletModel.initialize();
  }

  protected afterReactionsRemoved() {
    this.solanaModel.end();
    this.walletModel.end();
  }

  async getMetaData(publicKey: string | PublicKey): Promise<Metadata> {
    const mintPublicKey = isString(publicKey) ? new PublicKey(publicKey) : publicKey;
    const tokenMetaPubKey = await Metadata.getPDA(mintPublicKey);

    const tokenMetadata = await Metadata.load(this.solanaModel.connection, tokenMetaPubKey);
    console.log(`got token meta data for: ${mintPublicKey.toBase58()}`, tokenMetadata);
    return tokenMetadata;
  }

  async findAllNftDataByOwner(owner: string | PublicKey): Promise<Array<MetadataDataData>> {
    console.log('findAllNftDataByOwner - 1');
    const ownerKey = isString(owner) ? new PublicKey(owner) : owner;
    const data = await Metadata.findDataByOwner(this.solanaModel.connection, ownerKey);
    console.log('findAllNftDataByOwner - 2', data);
    return data.map((value) => value.data);
  }

  async loadSecondaryMetaData(metadataData: MetadataDataData): Promise<SecondaryMetaDataType> {
    const response = (await axios.get(metadataData.uri)).data;
    return response as SecondaryMetaDataType;
  }

  async mintNft(): Promise<MintNFTResponse> {
    return await actions.mintNFT({
      connection: this.solanaModel.connection,
      wallet: this.walletModel.selectedAdaptor as Wallet,
      uri: 'https://pmqsa4qd4d3k45t2cwzl7aq3unz5uha5e27ccu5e3jdc2fazqm.arweave.net/eyEgcgPg9q52ehWyv4Ibo3PaHB0mviFTpNpGLRQZ_g8/',
      maxSupply: 500,
    });
  }

  async transferToAnotherWallet(): Promise<string> {
    const mintKey = new PublicKey('DVuVN5FR4T3pxVycs7EmyTt78VScASHatNxn9KPp1psf');
    // const mintKey = new PublicKey('5gQS5p6zXor448jDR5TX2dwLET8vnEy2wJXPqgzUf5e4');
    const transferTo = new PublicKey('D3btVHevDhcKYJxG1KuAswaLUvrjUR3nn43vDBGzXU1Q');
    const user = spl.Wallet.fromWallet(
      this.solanaModel.connection,
      this.walletModel.selectedAdaptor as WalletI
    );

    // const mintA = await spl.Mint.create(
    //   this.solanaModel.connection,
    //   0,
    //   this.walletModel.pubKey,
    //   user
    // );
    // console.log(`~~~ ${mintA.key}`, mintA);

    const ata = await spl.associatedTokenAccount.getAssociatedTokenAddress(mintKey, user.publicKey);
    console.log(`~~~~ ATA: ${ata.toBase58()}`, ata);

    // const response = await actions.mintEditionFromMaster({
    //   connection: this.solanaModel.connection,
    //   masterEditionMint: mintKey,
    //   updateAuthority: user.publicKey,
    //   wallet: this.walletModel.selectedAdaptor as unknown as Wallet,
    // });
    //
    // console.log(`~~~ edition edition... ${response.edition.toBase58()}`, response);
    // console.log(`~~~ edition mint... ${response.mint.toBase58()}`, response);
    // console.log(`~~~ edition metadata... ${response.metadata.toBase58()}`, response);

    const mint = await spl.Mint.get(
      this.solanaModel.connection,
      new PublicKey('Gze68TY76Sb8iGH8jZG7J4YiL3x4U78SpPtC1qAeyHcs')
    );
    const info = await mint.getInfo();
    const balance = await mint.getBalance(user.publicKey);
    console.log(`~~~ ${mint.key} # ${balance}`, info);

    const txhash = user.transferToken(mint.key, transferTo, 1); //await mint.mintTo(transferTo, user, 1); //response.txId;
    // const txhash = await mint.mintTo(user.publicKey, user, 10);
    //
    // const response = await actions.sendToken({
    //   connection: this.solanaModel.connection,
    //   wallet: this.walletModel.selectedAdaptor as unknown as Wallet,
    //   source: ata,
    //   destination: user.publicKey,
    //   mint: mint.key,
    //   amount: 10,
    // });
    //
    // console.log(`~~~~ sendToken???`, response);
    // const txhash = await user.transferToken(mintKey, transferTo, 1);

    return txhash;
  }
}
