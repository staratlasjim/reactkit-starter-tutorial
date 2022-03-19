import { injectable } from 'tsyringe';
import { autorun, makeAutoObservable, makeObservable, observable, runInAction } from 'mobx';
import { isEmpty } from 'lodash';
import { MetadataDataData } from '@metaplex-foundation/mpl-token-metadata';

import { ViewModel } from '../ViewModel';
import { MetaPlexModel } from '../../models/MetaPlex/MetaPlexModel';
import { PublicKey } from '@solana/web3.js';
import axios from 'axios';

type MetaDataDataType = {
  name: string;
  symbol: string;
  uri: string;
  sellerFeeBasisPoints: number;
  description: string;
  image: string;
  collection: {
    name: string;
    family: string;
  };
};

@injectable()
export class DisplayNftViewModel extends ViewModel {
  mintAddress: string;
  protected data: MetaDataDataType;
  constructor(protected metaPlexModel: MetaPlexModel) {
    super();
    this.mintAddress = '';
    this.data = {
      name: '',
      symbol: '',
      uri: '',
      sellerFeeBasisPoints: 0,
      description: '',
      image: '',
      collection: { name: '', family: '' },
    };
    makeObservable(this, {
      mintAddress: observable,
    });

    makeAutoObservable(this.data);
  }

  protected onInitialize(): void {
    this.metaPlexModel.initialize();
    this.createReactions();
  }

  protected afterReactionsRemoved(): void {
    this.metaPlexModel.end();
  }

  protected createReactions(): void {
    this.addReaction(
      autorun(() => {
        if (isEmpty(this.mintAddress)) return;
        try {
          new PublicKey(this.mintAddress);
          console.log(`Going to look for nft meta data: ${this.mintAddress}`);
          this.loadNftMetaData().then((metadata) => console.log('loaded nft meta data', metadata));
        } catch (e) {
          console.error(e);
        }
      })
    );
  }

  async loadNftMetaData(): Promise<MetadataDataData> {
    const metaData = await this.metaPlexModel.getMetaData(this.mintAddress);
    console.log(`MetaData for: ${this.mintAddress}`, metaData);
    const metaDataData = metaData.data.data;
    const response = (await axios.get(metaDataData.uri)).data;
    runInAction(() => {
      this.data.name = metaDataData.name;
      this.data.uri = metaDataData.uri;
      this.data.symbol = metaDataData.symbol;
      this.data.sellerFeeBasisPoints = metaDataData.sellerFeeBasisPoints;
      this.data.description = response.description;
      this.data.image = response.image;
      this.data.collection = response.collection;
    });

    return metaDataData;
  }

  get name(): string {
    return this.data.name;
  }

  get symbol(): string {
    return this.data.symbol;
  }

  get uri(): string {
    return this.data.uri;
  }

  get sellerFeeBasisPoints(): number {
    return this.data.sellerFeeBasisPoints;
  }

  get image(): string {
    return this.data.image;
  }

  get description(): string {
    return this.data.description;
  }

  get collection(): { name: string; family: string } {
    return this.data.collection;
  }

  public setMintAddress(address: string): void {
    console.log(`~~~~ changing to ${address}`);
    runInAction(() => {
      this.mintAddress = address;
    });
  }
}
