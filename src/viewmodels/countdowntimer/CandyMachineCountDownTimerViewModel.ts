import { ViewModel } from '../ViewModel';
import { autorun, makeObservable, observable, runInAction } from 'mobx';
import { Lifecycle, scoped } from 'tsyringe';
import { CandyMachineModel } from '../../models/CandyMachine/CandyMachineModel';
import dayjs from 'dayjs';

@scoped(Lifecycle.ContainerScoped)
export class CandyMachineCountDownTimerViewModel extends ViewModel {
  labelString: string = '';
  timerString: string = '';
  dropDateTime: Date = new Date();
  protected timerLoop: any;

  constructor(protected candyMachineModel: CandyMachineModel) {
    super();
    makeObservable(this, {
      labelString: observable,
      timerString: observable,
      dropDateTime: observable,
    });
  }

  protected onInitialize(): void {
    this.candyMachineModel.initialize();
    this.labelString = 'Candy Drop Starting in:';
    this.createReactions();
    this.timerLoop = setInterval(() => {
      this.doCountDown();
    }, 1000);
  }

  protected afterReactionsRemoved() {
    if (this.timerLoop) clearInterval(this.timerLoop);
    this.timerLoop = null;
    this.candyMachineModel.end();
  }

  protected doCountDown(): void {
    const currentDate = dayjs(new Date().getTime());
    const dropDate = dayjs(this.dropDateTime);

    if (currentDate.isSame(dropDate) || currentDate.isAfter(dropDate)) {
      runInAction(() => {
        this.timerString = 'Ready to MINT';
      });
      clearInterval(this.timerLoop);
      this.timerLoop = null;
      if (!this.candyMachineModel.isActive) {
        runInAction(() => {
          this.candyMachineModel.isActive = true;
        });
      }
      return;
    }

    const days = dropDate.diff(currentDate, 'days');
    const hours = dropDate.diff(currentDate, 'hours');
    const minutes = dropDate.diff(currentDate, 'minutes');
    const seconds = dropDate.diff(currentDate, 'seconds') - (hours * 24 + minutes * 60);
    this.timerString = `${days}d ${hours}h ${minutes}m ${seconds}s`;
  }

  protected createReactions(): void {
    this.addReaction(
      autorun(() => {
        const newTimeString = `Drop Date: ${this.candyMachineModel.goLiveDateTime}`;
        const newGoLifeDateTime = new Date(this.candyMachineModel.goLiveData * 1000);
        runInAction(() => {
          this.timerString = newTimeString;
          this.dropDateTime = newGoLifeDateTime;
        });
      })
    );
  }
}
