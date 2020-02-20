import * as PiSpi from "pi-spi";

export type LedColor = {
  red: number,
  blue: number,
  green: number,
}

export default class LedController {
  private spi: PiSpi.SPI;

  private ledAmount: number;
  private ledstripBuffer: Buffer;
  private undisplayedLedstrip: Array<LedColor> = [];
  private displayedLedstrip: Array<LedColor> = [];

  private renderingIsBlocked: boolean = false;
  private shouldRerenderWhenDone: boolean = false;

  private debug: boolean;

  constructor(ledAmount: number, debug = false) {
    this.ledAmount = ledAmount;
    this.debug = debug;

    if (!this.debug) {
      this.spi = PiSpi.initialize("/dev/spidev0.0");
      this.spi.clockSpeed(2e6);
    }

    this.ledstripBuffer = Buffer.alloc(this.ledAmount * 3);

    this.clearLeds().show();
  }

  public setLed(led: number, red: number, green: number, blue: number): LedController {
    const ledIndex = led * 3;

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
    for(let ledIndex = 0; ledIndex < this.ledAmount; ledIndex++) {
      this.setLed(ledIndex, red, green, blue);
    }

    return this;
  }

  public getLedstrip(): Array<LedColor> {
    return this.displayedLedstrip;
  }

  public clearLeds(): LedController {
    this.fillLeds(0, 0, 0);

    return this;
  }

  public show(): Promise<void> {
    if (this.renderingIsBlocked) {
      this.shouldRerenderWhenDone = true;
      return new Promise((resolve) => resolve());
    }

    this.renderingIsBlocked = true;

    this.displayedLedstrip = this.undisplayedLedstrip;

    return new Promise((resolve) => {
      const doneWriting = () => {
        setTimeout(() => {
          this.renderingIsBlocked = false;

          if(this.shouldRerenderWhenDone) {
            this.shouldRerenderWhenDone = false;

            this.show();
          }
        }, 10);

        resolve();
      }

      if(this.debug) {
        doneWriting();

        return;
      }

      this.spi.write(this.ledstripBuffer, doneWriting);
    });
  }
}
