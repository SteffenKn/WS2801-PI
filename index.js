const SPI = require('pi-spi');

module.exports = class LedController {

  constructor(ledAmount) {
    this.spi = SPI.initialize("/dev/spidev0.0");
    this.spi.clockSpeed(2e6);

    this.ledAmount = ledAmount;
    this.buffer = Buffer.alloc(this.ledAmount * 3);
  }

  setLed(led, red, green, blue) {
    const ledIndex = led * 3;

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

  clearLeds() {
    this.fillLeds(0, 0, 0);

    return this;
  }

  show() {
    return new Promise((resolve) => {
      this.spi.write(this.buffer, resolve);
    });
  }
}
