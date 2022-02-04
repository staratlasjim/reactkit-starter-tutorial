import { FC } from 'react';
import { observer } from 'mobx-react-lite';
import { useViewModel } from '../../../viewmodels/useViewModel';
import { CandyMachineCountDownTimerViewModel } from '../../../viewmodels/countdowntimer/CandyMachineCountDownTimerViewModel';

export const CandyMachineCountDownTimerView: FC = observer(() => {
  const vm = useViewModel(CandyMachineCountDownTimerViewModel);

  return (
    <div>
      <p>{vm.labelString}</p>
      {vm.timerString && <p>${`⏰ - ${vm.timerString}`}</p>}
    </div>
  );
});
