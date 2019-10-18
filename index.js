const SPI = require('pi-spi');

module.exports = class LedController {

  constructor(ledAmount) {
    this.spi = SPI.initialize("/dev/spidev0.0");
    this.spi.clockSpeed(2e6);

    this.ledAmount = ledAmount;

    this.buffer = Buffer.alloc(this.ledAmount * 3);
    this.undisplayedLedstrip = [];
    this.displayedLedstrip = [];

    this.clearLeds().show();
  }

  setLed(led, red, green, blue) {
    const ledIndex = led * 3;

    this.undisplayedLedstrip[led] = {
      red: red,
      green: green,
      blue: blue,
    };

    this.buffer[ledIndex] = red;
    this.buffer[ledIndex + 1] = green;
    this.buffer[ledIndex + 2] = blue;

    return this;
  }


  fillLeds(red, green, blue) {
    for(let ledIndex = 0; ledIndex < this.ledAmount; ledIndex++) {
      this.setLed(ledIndex, red, green, blue);
    }

    return this;
  }

  getLedstrip() {
    return this.displayedLedstrip;
  }

  clearLeds() {
    this.fillLeds(0, 0, 0);

    return this;
  }

  show() {
    if (this.showIsBlocked) {
      return;
    }

    this.showIsBlocked = true;

    this.displayedLedstrip = this.undisplayedLedstrip;

    return new Promise((resolve) => {
      const doneWriting = () => {
        setTimeout(() => {
          this.showIsBlocked = false;
        }, 10);

        resolve();
      }

      this.spi.write(this.buffer, doneWriting);
    });
  }
}
