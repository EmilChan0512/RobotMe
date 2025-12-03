import type { BatteryIndicatorProps, BatteryChangeEvent } from './battery-indicator';

export class BatteryIndicator {
  private el: HTMLElement;
  private indicator: HTMLElement | null = null;

  constructor(private opts: BatteryIndicatorProps = {}) {
    this.el = document.createElement('battery-indicator');
    this.applyOpts();
  }

  private applyOpts() {
    const set = (k: keyof BatteryIndicatorProps, v: any) => {
      if (v === undefined) return;
      const attr = k.replace(/([A-Z])/g, '-$1').toLowerCase();
      this.el.setAttribute(attr, String(v));
    };
    set('width', this.opts.width);
    set('height', this.opts.height);
    set('colorFill', this.opts.colorFill);
    set('colorStroke', this.opts.colorStroke);
    set('colorLightning', this.opts.colorLightning);
    set('padding', this.opts.padding);
    set('showLevel', this.opts.showLevel);
    set('autoConnect', this.opts.autoConnect);
  }

  mount(parent: HTMLElement) {
    parent.appendChild(this.el);
    this.indicator = this.el;
  }

  unmount() {
    if (this.indicator && this.indicator.parentNode) {
      this.indicator.parentNode.removeChild(this.indicator);
    }
  }

  async connectBattery() {
    await (this.el as any).connectBattery?.();
  }

  setCharging(charging: boolean) {
    (this.el as any).setCharging?.(charging);
  }

  setLevel(level: number) {
    (this.el as any).setLevel?.(level);
  }

  destroy() {
    (this.el as any).destroy?.();
    this.unmount();
  }

  addEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void {
    this.el.addEventListener(type as any, listener as any, options);
  }

  removeEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void {
    this.el.removeEventListener(type as any, listener as any, options);
  }
}