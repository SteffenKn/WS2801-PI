import AsyncLock from 'async-lock';
import PiSpi from 'pi-spi';

import {validateLedStrip} from './led-strip-validation';

export type LedStrip = Array<LedColor>;

export type LedColor = {
  red: number,
  blue: number,
  green: number,
};

export type Ws2801PiConfig = {
  debug?: boolean,
  automaticRendering?: boolean,
  spiClockSpeed?: ClockSpeed,
};

export enum ClockSpeed {
  ZeroPointFiveMHZ = 0.5e6,
  OneMHZ = 1e6,
  TwoMHZ = 2e6,
  FourMHZ = 4e6,
  EightMHZ = 8e6,
  SixteenMHZ = 16e6,
  ThirtyTwoMHZ = 32e6,
}

type Listener = {
  event: string,
  callback: Function,
};

enum EventNames {
  LedStripChanged = 'led-strip-changed',
  BrightnessChanged = 'brightness-changed',
}

const lock: AsyncLock = new AsyncLock();

const DEFAULT_CLOCK_SPEED: ClockSpeed = ClockSpeed.TwoMHZ;

export default class LedController {
  public renderPromise: Promise<void>;

  private spi: PiSpi.SPI;

  private ledAmount: number;
  private undisplayedLedStrip: LedStrip = [];
  private displayedLedStrip: LedStrip = [];
  private brightness: number | 'auto' = 'auto';
  private spiClockSpeed: ClockSpeed;

  private debug: boolean;
  private automaticRendering: boolean;

  private listeners: {[id: string]: Listener} = {};

  constructor(ledAmount: number, config: Ws2801PiConfig = {}) {
    this.ledAmount = ledAmount;
    this.debug = config.debug === true;
    this.automaticRendering = config.automaticRendering === true;

    if (!this.debug) {
      this.spi = PiSpi.initialize('/dev/spidev0.0');

      this.clockSpeed = config.spiClockSpeed ? config.spiClockSpeed : DEFAULT_CLOCK_SPEED;
    }

    this.clearLeds();
    this.displayedLedStrip = this.undisplayedLedStrip;
  }

  public set clockSpeed(clockSpeed: ClockSpeed) {
    this.spiClockSpeed = clockSpeed;

    if (!this.debug) {
      this.spi.clockSpeed(clockSpeed);
    }
  }

  public get clockSpeed(): ClockSpeed {
    return this.spiClockSpeed;
  }

  public getLedStrip(): LedStrip {
    return this.displayedLedStrip;
  }

  public setLed(ledIndex: number, color: LedColor): LedController {
    this.colorizeLed(ledIndex, color);

    if (this.automaticRendering) {
      this.show();
    }

    return this;
  }

  public fillLeds(color: LedColor): LedController {
    for (let ledIndex: number = 0; ledIndex < this.ledAmount; ledIndex++) {
      this.colorizeLed(ledIndex, color);
    }

    if (this.automaticRendering) {
      this.show();
    }

    return this;
  }

  public setBrightness(brightness: number | 'auto'): LedController {
    if ((typeof brightness !== 'number' && brightness !== 'auto') || brightness < 0 || brightness > 100) {
      throw new Error(`The brightness must be between 0 and 100 or 'auto'.`);
    }

    this.brightness = brightness;

    this.brightnessChanged();

    return this;
  }

  public getBrightness(): number | 'auto' {
    return this.brightness;
  }

  public clearLeds(): LedController {
    const black: LedColor = {red: 0, green: 0, blue: 0};
    this.fillLeds(black);

    if (this.automaticRendering) {
      this.show();
    }

    return this;
  }

  public setLedStrip(ledStrip: LedStrip): LedController {
    validateLedStrip(this.ledAmount, ledStrip);

    for (let ledIndex: number = 0; ledIndex < this.ledAmount; ledIndex++) {
      this.colorizeLed(ledIndex, ledStrip[ledIndex]);
    }

    if (this.automaticRendering) {
      this.show();
    }

    return this;
  }

  public show(): Promise<void> {
    const ledsToFill: LedStrip = this.undisplayedLedStrip.slice();
    const ledBufferToWrite: Buffer = this.getLedStripAsBuffer(ledsToFill);

    this.renderPromise = lock.acquire('render', async(done: Function): Promise<void> => {

      const doneWriting: (error?: Error, data?: Buffer) => Promise<void> = async(): Promise<void> => {
        this.displayedLedStrip = ledsToFill;

        this.ledStripChanged(ledsToFill);

        done();
      };

      if (this.debug) {
        setTimeout((): void => {
          doneWriting();
        }, 60);

        return;
      }

      this.spi.write(ledBufferToWrite, doneWriting);
    });

    return this.renderPromise;
  }

  public onLedStripChanged(callback: Function): string {
    const id: string = this.generateId(5);

    this.listeners[id] = {
      event: EventNames.LedStripChanged,
      callback: callback,
    };

    return id;
  }

  public onBrightnessChanged(callback: Function): string {
    const id: string = this.generateId(5);

    this.listeners[id] = {
      event: EventNames.BrightnessChanged,
      callback: callback,
    };

    return id;
  }

  public removeEventListener(id: string): void {
    delete this.listeners[id];
  }

  private ledStripChanged(ledStrip: LedStrip): void {
    const ledStripChangedListeners: Array<Listener> =
      Object.values(this.listeners).filter((listener: Listener): boolean => listener.event === EventNames.LedStripChanged);

    for (const listener of ledStripChangedListeners) {
      listener.callback(ledStrip);
    }
  }

  private brightnessChanged(): void {
    const brightnessChangedListeners: Array<Listener> =
      Object.values(this.listeners).filter((listener: Listener): boolean => listener.event === EventNames.BrightnessChanged);

    for (const listener of brightnessChangedListeners) {
      listener.callback(this.brightness);
    }
  }

  private colorizeLed(ledNumber: number, color: LedColor): void {
    const fixedColor: LedColor = {
      red: Math.max(0, Math.min(color.red, 255)),
      green: Math.max(0, Math.min(color.green, 255)),
      blue: Math.max(0, Math.min(color.blue, 255)),
    };

    this.undisplayedLedStrip[ledNumber] = fixedColor;
  }

  private getLedStripAsBuffer(ledStrip: LedStrip): Buffer {
    const ledStripBuffer: Buffer =  Buffer.alloc(this.ledAmount * 3);

    for (let ledNumber: number = 0; ledNumber < this.ledAmount; ledNumber++) {
      const brightnessAdjustedColor: LedColor = this.getBrightnessAdjustedColor(ledStrip[ledNumber]);

      const ledBufferIndex: number = ledNumber * 3;
      ledStripBuffer[ledBufferIndex] = brightnessAdjustedColor.red;
      ledStripBuffer[ledBufferIndex + 1] = brightnessAdjustedColor.green;
      ledStripBuffer[ledBufferIndex + 2] = brightnessAdjustedColor.blue;
    }

    return ledStripBuffer;
  }

  private getBrightnessAdjustedColor(color: LedColor): LedColor {
    if (this.brightness === 'auto') {
      return color;
    }

    const brightnessMultiplier: number = this.brightness / 100 * 255;

    const highestColorValue: number = this.getHighestColorValue(color);

    const brightnessAdjustedColor: LedColor = {
      red: color.red / highestColorValue * brightnessMultiplier,
      green: color.green / highestColorValue * brightnessMultiplier,
      blue: color.blue / highestColorValue * brightnessMultiplier,
    };

    return brightnessAdjustedColor;
  }

  private getHighestColorValue(color: LedColor): number {
    if (color.red >= color.green && color.red >= color.blue) {
      return color.red;
    }

    if (color.green >= color.blue) {
      return color.green;
    }

    return color.blue;
  }

  private generateId(idLength: number): string {
    let result: string = '';
    const characters: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength: number = characters.length;

    for (let index: number = 0; index < idLength; index++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
 }
}
