import AsyncLock from 'async-lock';
import * as PiSpi from 'pi-spi';

const lock: AsyncLock = new AsyncLock();

export type LedColor = {
  red: number,
  blue: number,
  green: number,
};

export type Ledstrip = Array<LedColor>;

export default class LedController {
  private spi: PiSpi.SPI;

  private ledAmount: number;
  private ledstripBuffer: Buffer;
  private undisplayedLedstrip: Ledstrip = [];
  private displayedLedstrip: Ledstrip = [];

  private debug: boolean;

  constructor(ledAmount: number, debug: boolean = false) {
    this.ledAmount = ledAmount;
    this.debug = debug;

    if (!this.debug) {
      this.spi = PiSpi.initialize('/dev/spidev0.0');
      this.spi.clockSpeed(2e6);
    }

    this.ledstripBuffer = Buffer.alloc(this.ledAmount * 3);

    this.clearLeds().show();
  }

  public setLed(led: number, red: number, green: number, blue: number): LedController {
    const ledIndex: number = led * 3;

    this.undisplayedLedstrip[led] = {
      red: red,
      green: green,
      blue: blue,
    };

    this.ledstripBuffer[ledIndex] = red;
    this.ledstripBuffer[ledIndex + 1] = green;
    this.ledstripBuffer[ledIndex + 2] = blue;

    return this;
  }

  public fillLeds(red: number, green: number, blue: number): LedController {
    for (let ledIndex: number = 0; ledIndex < this.ledAmount; ledIndex++) {
      this.setLed(ledIndex, red, green, blue);
    }

    return this;
  }

  public getLedstrip(): Ledstrip {
    return this.displayedLedstrip;
  }

  public clearLeds(): LedController {
    this.fillLeds(0, 0, 0);

    return this;
  }

  public show(): Promise<void> {
    return lock.acquire('show', async(done: Function): Promise<void> => {

      const doneWriting: (error?: Error, data?: Buffer) => Promise<void> = async(): Promise<void> => {
        await this.wait(10);

        this.displayedLedstrip = this.undisplayedLedstrip;

        done();
      };

      if (this.debug) {
        setTimeout((): void => {
          doneWriting();
        }, 60);

        return;
      }

      this.spi.write(this.ledstripBuffer, doneWriting);
    });
  }

  private wait(ms: number): Promise<void> {
    return new Promise((resolve: Function): void => {
      setTimeout((): void => {
        resolve();
      }, ms);
    });
  }
}
