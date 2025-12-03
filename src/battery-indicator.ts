export interface BatteryIndicatorProps {
  width?: number | string;
  height?: number | string;
  colorFill?: string;
  colorStroke?: string;
  colorLightning?: string;
  padding?: number;
  showLevel?: boolean;
  autoConnect?: boolean;
}

export type BatteryChangeEvent = {
  charging: boolean;
  level?: number;
};

const DEFAULT_PROPS: Required<BatteryIndicatorProps> = {
  width: 120,
  height: 56,
  colorFill: '#22c55e',
  colorStroke: '#000',
  colorLightning: '#facc15',
  padding: 3,
  showLevel: true,
  autoConnect: true,
};

export class BatteryIndicatorElement extends HTMLElement {
  private svg: SVGElement | null = null;
  private fillRect: SVGRectElement | null = null;
  private lightningPath: SVGPathElement | null = null;
  private levelText: SVGTextElement | null = null;
  private battery: any = null;
  private _charging = false;
  private _level = 1;

  static get observedAttributes() {
    return ['width', 'height', 'color-fill', 'color-stroke', 'color-lightning', 'padding', 'show-level', 'auto-connect'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
    if (this.getBoolAttr('auto-connect', true)) {
      this.connectBattery().catch(() => {});
    }
  }

  disconnectedCallback() {
    this.destroy();
  }

  attributeChangedCallback() {
    this.render();
  }

  private getBoolAttr(name: string, fallback: boolean) {
    const val = this.getAttribute(name);
    return val === null ? fallback : val !== 'false';
  }

  private getNumAttr(name: string, fallback: number) {
    const val = this.getAttribute(name);
    return val === null ? fallback : Number(val);
  }

  private getStrAttr(name: string, fallback: string) {
    return this.getAttribute(name) ?? fallback;
  }

  private props(): Required<BatteryIndicatorProps> {
    return {
      width: this.getStrAttr('width', String(DEFAULT_PROPS.width)),
      height: this.getStrAttr('height', String(DEFAULT_PROPS.height)),
      colorFill: this.getStrAttr('color-fill', DEFAULT_PROPS.colorFill),
      colorStroke: this.getStrAttr('color-stroke', DEFAULT_PROPS.colorStroke),
      colorLightning: this.getStrAttr('color-lightning', DEFAULT_PROPS.colorLightning),
      padding: this.getNumAttr('padding', DEFAULT_PROPS.padding),
      showLevel: this.getBoolAttr('show-level', DEFAULT_PROPS.showLevel),
      autoConnect: this.getBoolAttr('auto-connect', DEFAULT_PROPS.autoConnect),
    };
  }

  private render() {
    const { width, height, colorStroke, colorFill, colorLightning, padding, showLevel } = this.props();
    const w = Number(width);
    const h = Number(height);
    const pad = padding;
    const tipW = 8;
    const fillW = Math.max(0, (w - pad * 2 - tipW) * this._level);

    const svg = `
      <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
        <!-- 电池外框 -->
        <rect x="0" y="0" width="${w - tipW}" height="${h}" rx="4" ry="4" fill="none" stroke="${colorStroke}" stroke-width="2"/>
        <!-- 端子 -->
        <rect x="${w - tipW}" y="${h * 0.25}" width="${tipW}" height="${h * 0.5}" rx="2" ry="2" fill="none" stroke="${colorStroke}" stroke-width="2"/>
        <!-- 电量填充 -->
        <rect x="${pad}" y="${pad}" width="${fillW}" height="${h - pad * 2}" rx="2" ry="2" fill="${colorFill}"/>
        <!-- 闪电 -->
        <path id="lightning" d="M${w * 0.35},${h * 0.2} L${w * 0.45},${h * 0.45} L${w * 0.4},${h * 0.45} L${w * 0.5},${h * 0.8} L${w * 0.42},${h * 0.55} L${w * 0.48},${h * 0.55} Z" fill="${colorLightning}" display="${this._charging ? 'inline' : 'none'}"/>
        <!-- 电量文字 -->
        ${showLevel ? `<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="14" fill="${colorStroke}">${Math.round(this._level * 100)}%</text>` : ''}
      </svg>
    `;

    if (!this.shadowRoot) return;
    this.shadowRoot.innerHTML = svg;

    this.svg = this.shadowRoot.querySelector('svg') as SVGElement;
    this.fillRect = this.shadowRoot.querySelector('rect:nth-of-type(3)') as SVGRectElement;
    this.lightningPath = this.shadowRoot.querySelector('#lightning') as SVGPathElement;
    this.levelText = this.shadowRoot.querySelector('text') as SVGTextElement;

    this.updateAria();
  }

  private updateAria() {
    const label = this._charging ? 'Battery charging' : 'Battery discharging';
    this.setAttribute('aria-label', label);
  }

  private emitChange() {
    const detail: BatteryChangeEvent = { charging: this._charging, level: this._level };
    this.dispatchEvent(new CustomEvent('batterychange', { detail }));
  }

  async connectBattery() {
    if (!('getBattery' in navigator)) return;
    try {
      this.battery = await (navigator as any).getBattery();
      this.syncBattery();
      this.battery.addEventListener('chargingchange', () => this.syncBattery());
      this.battery.addEventListener('levelchange', () => this.syncBattery());
    } catch {}
  }

  private syncBattery() {
    if (!this.battery) return;
    this._charging = Boolean(this.battery.charging);
    this._level = Math.max(0, Math.min(1, this.battery.level ?? 1));
    this.refreshVisuals();
    this.emitChange();
  }

  private refreshVisuals() {
    const { width, height, padding, showLevel } = this.props();
    const w = Number(width);
    const h = Number(height);
    const tipW = 8;
    const fillW = Math.max(0, (w - padding * 2 - tipW) * this._level);

    if (this.fillRect) this.fillRect.setAttribute('width', String(fillW));
    if (this.lightningPath) this.lightningPath.setAttribute('display', this._charging ? 'inline' : 'none');
    if (this.levelText) this.levelText.textContent = showLevel ? `${Math.round(this._level * 100)}%` : '';

    this.updateAria();
  }

  setCharging(charging: boolean) {
    this._charging = charging;
    this.refreshVisuals();
    this.emitChange();
  }

  setLevel(level: number) {
    this._level = Math.max(0, Math.min(1, level));
    this.refreshVisuals();
    this.emitChange();
  }

  destroy() {
    if (this.battery) {
      this.battery.removeEventListener('chargingchange', () => this.syncBattery());
      this.battery.removeEventListener('levelchange', () => this.syncBattery());
    }
  }
}

customElements.define('battery-indicator', BatteryIndicatorElement);