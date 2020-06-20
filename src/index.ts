import AsyncLock from 'async-lock';
import * as PiSpi from 'pi-spi';

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

const lock: AsyncLock = new AsyncLock();

const DEFAULT_CLOCK_SPEED: ClockSpeed = ClockSpeed.TwoMHZ;

export default class LedController {
  public renderPromise: Promise<void>;

  private spi: PiSpi.SPI;

  private ledAmount: number;
  private ledStripBuffer: Buffer;
  private undisplayedLedStrip: LedStrip = [];
  private displayedLedStrip: LedStrip = [];
  private spiClockSpeed: ClockSpeed;

  private debug: boolean;
  private automaticRendering: boolean;

  constructor(ledAmount: number, config: Ws2801PiConfig = {}) {
    this.ledAmount = ledAmount;
    this.debug = config.debug === true;
    this.automaticRendering = config.automaticRendering === true;

    if (!this.debug) {
      this.spi = PiSpi.initialize('/dev/spidev0.0');

      this.clockSpeed = config.spiClockSpeed ? config.spiClockSpeed : DEFAULT_CLOCK_SPEED;
    }

    this.ledStripBuffer = Buffer.alloc(this.ledAmount * 3);

    this.clearLeds().show();
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

  public clearLeds(): LedController {
    const black: LedColor = {red: 0, green: 0, blue: 0};
    this.fillLeds(black);

    if (this.automaticRendering) {
      this.show();
    }

    return this;
  }

  public show(): Promise<void> {
    const ledsToFill: LedStrip = this.undisplayedLedStrip.slice();
    const ledBufferToWrite: Buffer = this.ledStripBuffer.slice();

    this.renderPromise = lock.acquire('render', async(done: Function): Promise<void> => {

      const doneWriting: (error?: Error, data?: Buffer) => Promise<void> = async(): Promise<void> => {
        this.displayedLedStrip = ledsToFill;

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

  private colorizeLed(ledNumber: number, color: LedColor): void {
    const ledIndex: number = ledNumber * 3;

    const red: number = Math.max(0, Math.min(color.red, 255));
    const green: number = Math.max(0, Math.min(color.green, 255));
    const blue: number = Math.max(0, Math.min(color.blue, 255));

    this.undisplayedLedStrip[ledNumber] = {
      red: red,
      green: green,
      blue: blue,
    };

    this.ledStripBuffer[ledIndex] = red;
    this.ledStripBuffer[ledIndex + 1] = green;
    this.ledStripBuffer[ledIndex + 2] = blue;
  }
}
