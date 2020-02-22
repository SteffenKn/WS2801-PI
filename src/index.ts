import * as PiSpi from 'pi-spi';

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

  private renderingIsBlocked: boolean = false;
  private shouldRerenderWhenDone: boolean = false;
  private rerenderPromise: Promise<void> | undefined;
  private rerenderPromiseResolveFn: Function | undefined;

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
    if (this.renderingIsBlocked) {
      this.shouldRerenderWhenDone = true;

      const isAlreadyWaitingForRerendering: boolean = this.rerenderPromise !== undefined;
      if (isAlreadyWaitingForRerendering) {
        return this.rerenderPromise;
      }

      this.rerenderPromise = new Promise((resolve: Function): void => {
        this.rerenderPromiseResolveFn = resolve;
      });
    }

    this.renderingIsBlocked = true;

    this.displayedLedstrip = this.undisplayedLedstrip;

    return new Promise((resolve: Function): void => {
      const doneWriting: (error?: Error, data?: Buffer) => Promise<void> = async(): Promise<void> => {
        resolve();

        await this.wait(10);

        this.renderingIsBlocked = false;

        if (this.shouldRerenderWhenDone) {
          this.shouldRerenderWhenDone = false;

          this.rerender();
        }
      };

      if (this.debug) {
        setTimeout(() => {
          doneWriting();
        }, 60);

        return;
      }

      this.spi.write(this.ledstripBuffer, doneWriting);
    });
  }

  private async rerender(): Promise<void> {
    await this.show();

    this.rerenderPromiseResolveFn();

    this.rerenderPromise = undefined;
    this.rerenderPromiseResolveFn = undefined;
  }

  private wait(ms: number): Promise<void> {
    return new Promise((resolve: Function): void => {
      setTimeout((): void => {
        resolve();
      }, ms);
    });
  }
}
