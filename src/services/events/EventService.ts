import { isCSR } from '../../utils/SsrUtils';

export type EventHandler = (eventType: any) => void;

export class EventService {
  static on(eventType: string, listener: EventHandler) {
    if (isCSR()) {
      document.addEventListener(eventType, listener);
    }
  }

  static off(eventType: string, listener: EventHandler) {
    if (isCSR()) {
      document.removeEventListener(eventType, listener);
    }
  }

  static once(eventType: string, listener: EventHandler) {
    if (isCSR()) {
      EventService.on(eventType, handleEventOnce);

      function handleEventOnce(event: Event) {
        listener(event);
        EventService.off(eventType, handleEventOnce);
      }
    }
  }

  static trigger(eventType: string, data: any) {
    if (isCSR()) {
      const event = new CustomEvent(eventType, { detail: data });
      document.dispatchEvent(event);
    }
  }
}
