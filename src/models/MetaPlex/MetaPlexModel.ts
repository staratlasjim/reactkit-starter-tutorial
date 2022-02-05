import { singleton } from 'tsyringe';
import { Model } from '../Model';
import { SolanaModel } from '../Solana/SolanaModel';
import { PublicKey } from '@solana/web3.js';
import { Metadata, MetadataDataData } from '@metaplex-foundation/mpl-token-metadata';

import { isString } from 'lodash';
import axios from 'axios';

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

@singleton()
export class MetaPlexModel extends Model {
  constructor(protected solanaModel: SolanaModel) {
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
}
