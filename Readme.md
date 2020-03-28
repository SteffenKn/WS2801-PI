# WS2801-Pi

> WARNING: This module is still in early development.

A simple module to control a ws2801 led strip with a pi via SPI.

## Installation

- Install this module
- [Activate SPI](https://www.raspberrypi-spy.co.uk/2014/08/enabling-the-spi-interface-on-the-raspberry-pi/)

## Usage

```javascript
import LedController from 'ws2801-pi';
// const LedController = require('ws2801-pi').default;

const amountOfLedsOnStrip = 100;

const ledController = new LedController(amountOfLedsOnStrip);

let red = 255;
let green = 120;
let blue = 0;

// Set color of whole led strip
ledController.fillLeds(red, green, blue);
ledController.show();

red = 0;
green = 0;
blue = 255;

// Set color of single led
ledController.setLed(0, red, green, blue);
ledController.show();

// Clear led strip (turn all leds off)
ledController
  .clearLeds()
  .show();
```

> **Hint:** Make sure to call `show()` after changing leds in order to physically change the leds.

> **Hint:** If `automaticRendering` is set `show()` does not have to be called. The rendering can then be awaited via `ledController.renderPromise`.

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
  for (let color = 0; color < 4; color++) {
    for (let ledIndex = 0; ledIndex < amountOfLedsOnStrip; ledIndex++) {
      const red = color === 0 ? 255 : 0;
      const green = color === 1 ? 255 : 0;
      const blue = color === 2 ? 255 : 0;

      ledController
        .setLed(ledIndex, red, green, blue)
        .show();

      await wait(30);
    }

    await wait(300);
  }
}
animate();
```

## Changelog

### v0.0.10

- 🐛 Fix Publishing

### v0.0.9

- ♻️ **Rewrite Code in TypeScript**
- ✨ **Add Automatic Rendering**
- ✨ **Make ClockSpeed Changeable**
- 🐛 **Fix Awaiting Show if Rerendering Needed**
- 🐛 **Fix Rerendering**
- ✅ Add Tests
- ✨ Add Tslint

### v0.0.8

- ✨ **Add Rerender Mechanism**

### v0.0.7

- ✨ **Block Updating Ledstrip After Updating for a Short Duration**

### v0.0.6

- 🐛 **Fix Typo**

### v0.0.5

- ♻️ **Improve getLeds Functionality**

### v0.0.4

- ✨ **Add getLeds Functionality**

### v0.0.3

- 🐛 **Fix LedController**
- 🐛 **Fix Example Animation**
- 📝 Add Comments to Usage

### v0.0.2

- 📝 **Add Wiring Section**
- 📝 Add Changelog Section
- ✏️ Fix Typo

### v0.0.1

- ✨ **Add Basic LedController**
