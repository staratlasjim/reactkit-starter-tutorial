import { ViewModel } from './ViewModel';
import { autorun, computed, makeAutoObservable, makeObservable, runInAction } from 'mobx';
import { MetaPlexModel } from '../models/MetaPlex/MetaPlexModel';
import { WalletModel } from '../models/WalletModel/WalletModel';
import { injectable } from 'tsyringe';

@injectable()
export class DisplayNftImageListViewModel extends ViewModel {
  protected data: {
    images: Array<string>;
  } = { images: [] };

  constructor(protected walletModel: WalletModel, protected metaPlexModel: MetaPlexModel) {
    super();

    makeObservable(this, {
      imagesSrc: computed,
    });
    makeAutoObservable(this.data);
  }

  protected onInitialize(): void {
    this.walletModel.initialize();
    this.metaPlexModel.initialize();
    this.createReactions();
  }

  protected onEnd() {
    this.walletModel.end();
    this.metaPlexModel.end();
    super.onEnd();
  }

  get imagesSrc(): Array<string> {
    return this.data.images;
  }

  protected createReactions(): void {
    this.addReaction(
      autorun(() => {
        if (!this.walletModel.connected) return;

        this.loadImageSrcData().then(() => console.log('done loading nft image src data'));
      })
    );
  }

  protected async loadImageSrcData() {
    console.log('loadImageSrcData 1', this.walletModel.publicKey);
    const metaDataDataArray = await this.metaPlexModel.findAllNftDataByOwner(
      this.walletModel.pubKey
    );
    console.log('loadImageSrcData 2', metaDataDataArray);
    const newImageData = new Array<string>();
    for (const metaDataDataArrayElement of metaDataDataArray) {
      const secondaryData = await this.metaPlexModel.loadSecondaryMetaData(
        metaDataDataArrayElement
      );
      console.log('secondaryData', secondaryData);
      newImageData.push(secondaryData.image);
    }
    console.log('newImageData', newImageData);
    runInAction(() => {
      this.data.images = newImageData;
    });
  }
}
