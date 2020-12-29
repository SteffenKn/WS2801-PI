# WS2801-Pi

WS2801-Pi is a module for controlling WS2801 LED strips with a Raspberry Pi via SPI.

## Installation

- Install this module
- [Activate SPI](https://www.raspberrypi-spy.co.uk/2014/08/enabling-the-spi-interface-on-the-raspberry-pi/)

## Documentation

The documentation can be found [here](http://ws2801-pi.knaup.dev/).

## Wiring

| Raspberry Pi | led strip |
|:------------:|:----------:|
| GND | GND |
| SCLK | Clock |
| MOSI | Data |

> You should connect the GND and the V+ of the led strip to an external power supply.

## Config

| Config | Explanation | Type | Default |
|:------------:|:----------:|:----------:|:----------:|
| debug | Run without sending signals to the gpio ports. | boolean | false |
| automaticRendering | Automatically run `show()` after changing Leds. | boolean | false |
| clockSpeed | Set the desired [clockSpeed](https://projects.drogon.net/understanding-spi-on-the-raspberry-pi/). | ClockSpeed | 2e6 \| 2MHz |


> The **clockSpeed** can also be changed via `ledController.clockSpeed`.

## Usage

```javascript
import LedController from 'ws2801-pi';
// const LedController = require('ws2801-pi').default;

const amountOfLedsOnStrip = 100;

const ledController = new LedController(amountOfLedsOnStrip);

let color = {
  red: 255,
  green: 120,
  blue: 0,
};

// Set color of whole led strip
ledController.fillLeds(color);
ledController.show();

color.red = 0;
color.green = 0;
color.blue = 255;

// Set color of single led
ledController.setLed(0, color);
ledController.show();

// Clear led strip (turn all leds off)
ledController
  .clearLeds()
  .show();
```

> **Hint:** Make sure to call `show()` after changing leds in order to physically change the leds.

> **Hint:** If `automaticRendering` is set `show()` does not have to be called. The rendering can then be awaited via `ledController.renderPromise`.


## Example Animation

```javascript
import LedController from 'ws2801-pi';
// const LedController = require('ws2801-pi').default;

const amountOfLedsOnStrip = 100;

const ledController = new LedController(amountOfLedsOnStrip);

async function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function animate() {
  let colors = [
    {red: 255, green: 0, blue: 0},
    {red: 0, green: 255, blue: 0},
    {red: 0, green: 0, blue: 255},
    {red: 255, green: 255, blue: 0},
    {red: 255, green: 0, blue: 255},
    {red: 0, green: 255, blue: 255},
    {red: 0, green: 2505, blue: 0},
  ];

  for (const color of colors) {
    for (let ledIndex = 0; ledIndex < amountOfLedsOnStrip; ledIndex++) {
      ledController
        .setLed(ledIndex, color)
        .show();

      await wait(30);
    }

    await wait(300);
  }
}
animate();
```
