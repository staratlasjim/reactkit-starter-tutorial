import { get, set, toString } from 'lodash';
import { EventService } from '../services/events/EventService';
import { LifeCycleObject } from '../core/LifeCycleObject';

type EventHandlerFunc = (event: Event) => void;
type EventHandlerInfo = {
  handler: EventHandlerFunc;
  onlyOnce: boolean;
};
export type DelayDomLoader = () => HTMLElement;

export interface DomEventHandlerWithLoader {
  loader: DelayDomLoader;
  type: string;
  handler: (event: Event) => void;
}

type DomEventHandler = Omit<DomEventHandlerWithLoader, 'loader'>;

export function handleEvents(obj: LifeCycleObject): EventHelper {
  const hdlr = new EventHelper(obj);
  set(obj, '_hndler', hdlr);
  return hdlr;
}

export class EventHelper {
  protected eventHandlers: Map<string, EventHandlerInfo>;

  protected delayDomLoaders: Array<DomEventHandlerWithLoader>;

  protected domEventHandlers: Map<HTMLElement, Array<DomEventHandler>>;
  protected orgInit: Function;
  protected orgEnd: Function;

  constructor(protected obj: LifeCycleObject) {
    this.eventHandlers = new Map<string, EventHandlerInfo>();

    this.delayDomLoaders = [];
    this.domEventHandlers = new Map<HTMLElement, Array<DomEventHandler>>();

    this.orgInit = get(this.obj, 'onInitialize');
    this.orgEnd = get(this.obj, 'onEnd');
    this.orgInit = this.orgInit.bind(this.obj);
    this.orgEnd = this.orgEnd.bind(this.obj);
    set(this.obj, 'onInitialize', this.onInitialize.bind(this));
    set(this.obj, 'onEnd', this.onEnd.bind(this));
  }

  addEventHandler(event: string, func: Function, onlyOnce = false): EventHelper {
    if (this.eventHandlers.has(event))
      throw new Error(`~~~ EventHandler for ${toString(this.obj)} has handler for ${event}`);

    this.eventHandlers.set(event, {
      handler: func.bind(this.obj),
      onlyOnce,
    });

    return this;
  }

  addDomEventHandler(
    loader: DelayDomLoader,
    type: string,
    handler: (event: Event) => void
  ): EventHelper {
    this.delayDomLoaders.push({
      loader,
      type,
      handler,
    });

    return this;
  }

  protected bindDomEvent(): void {
    this.delayDomLoaders.forEach((value) => {
      const { loader, type, handler } = value;
      const element = loader();
      if (!element) throw new Error(`~~~ unable to find element ${value.type}`);

      if (!this.domEventHandlers.has(element)) {
        this.domEventHandlers.set(element, []);
      }

      const handlers = this.domEventHandlers.get(element) ?? [];
      handlers.push({ type, handler: handler.bind(this.obj) });
    });
  }

  protected onInitialize(): void {
    this.bindDomEvent();

    this.eventHandlers.forEach((value, key) => {
      //eventService.addEventListener(key, value.handler, value.onlyOnce);
      if (value.onlyOnce) EventService.once(key, value.handler);
      else EventService.on(key, value.handler);
    });

    this.domEventHandlers.forEach((value, key) => {
      value.forEach((value1) => {
        key.addEventListener(value1.type, value1.handler);
      });
    });

    this.orgInit();
  }

  protected onEnd(): void {
    this.eventHandlers.forEach((value, key) => {
      EventService.off(key, value.handler);
    });

    this.domEventHandlers.forEach((value, key) => {
      value.forEach((value1) => {
        key.removeEventListener(value1.type, value1.handler);
      });
    });

    this.orgEnd();
  }
}
