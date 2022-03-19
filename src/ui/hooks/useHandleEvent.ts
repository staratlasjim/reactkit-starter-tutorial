import { EventHandler, EventService } from '../../services/events/EventService';
import { useIsomorphicLayoutEffect } from 'react-use';

export const useHandleEvent = (event: string, handler: EventHandler) => {
  useIsomorphicLayoutEffect(() => {
    EventService.on(event, handler);
    return () => EventService.off(event, handler);
  }, []);
};
