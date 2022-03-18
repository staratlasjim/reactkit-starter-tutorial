import { singleton } from 'tsyringe';
import { Model } from '../Model';
import { SolanaModel } from '../Solana/SolanaModel';
import { PublicKey } from '@solana/web3.js';
import { Metadata, MetadataDataData } from '@metaplex-foundation/mpl-token-metadata';
// import { mintNFT } from '@metaplex/js/lib/actions';

import { isString } from 'lodash';
import axios from 'axios';
import { WalletModel } from '../WalletModel/WalletModel';
import { Wallet, actions } from '@metaplex/js';

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
  }

  protected onEnd() {
    this.solanaModel.end();
    super.onEnd();
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
}
