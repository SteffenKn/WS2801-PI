const SPI = require('pi-spi');

module.exports = class LedController {

  constructor(ledAmount) {
    this.spi = SPI.initialize("/dev/spidev0.0");
    this.spi.clockSpeed(2e6);

    this.ledAmount = ledAmount;
    this.buffer = Buffer.alloc(LED_AMOUNT * 3);
  }

  setLed(led, red, green, blue) {
    const ledIndex = led * 3;

    buffer[ledIndex] = red;
    buffer[ledIndex + 1] = green;
    buffer[ledIndex + 2] = blue;

    return this;
  }


  fillLeds(red, green, blue) {
    for(let ledIndex = 0; ledIndex < LED_AMOUNT; ledIndex++) {
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
      spi.write(buffer, resolve);
    });
  }
}
