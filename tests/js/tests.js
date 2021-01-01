'use strict';
const chai = require('chai');
const expect = chai.expect;

const LedController = require('../../dist/index').default;
const ClockSpeed = require('../../dist/index').ClockSpeed;

const argv = require('optimist').argv;

const ledController = new LedController(10, {
  debug: argv.noDebug !== true,
});
const automaticRenderingLedController = new LedController(10, {
  debug: argv.noDebug !== true,
  automaticRendering: true,
});

describe ('LedController', () => {
  afterEach (async () => {
    await ledController.clearLeds().show();
    await automaticRenderingLedController.clearLeds().renderPromise;
  });

  it ('should be able to create an LedController', async () => {
    const createdLedController = new LedController(10, {
      debug: argv.noDebug !== true,
    });
    const createdAutomaticRenderingLedController = new LedController(10, {
      debug: argv.noDebug !== true,
      automaticRendering: true,
    });

    await createdLedController.renderPromise;
    await createdAutomaticRenderingLedController.renderPromise;

    expect(createdLedController).not.to.equal(undefined);
    expect(createdAutomaticRenderingLedController).not.to.equal(undefined);
  });

  it ('should be able to set the clockSpeed', () => {
    const previousClockSpeed = ledController.clockSpeed;
    const expectedClockSpeed = ClockSpeed.OneMHZ;

    ledController.clockSpeed = expectedClockSpeed;

    const currentClockSpeed = ledController.clockSpeed;

    expect(previousClockSpeed).not.to.equal(expectedClockSpeed);
    expect(currentClockSpeed).to.equal(expectedClockSpeed);
  });

  it ('should be able to get the led strip', () => {
    const ledStrip = ledController.getLedStrip();

    for (const led of ledStrip) {
      expect(led.red).to.equal(0);
      expect(led.green).to.equal(0);
      expect(led.blue).to.equal(0);
    }
  });

  it ('should be able to fill the led strip', async () => {
    const expectedLedColor = {
      red: 255,
      green: 155,
      blue: 55,
    };

    await ledController.fillLeds(expectedLedColor).show();

    for (const led of ledController.getLedStrip()) {
      expect(led.red).to.equal(expectedLedColor.red);
      expect(led.green).to.equal(expectedLedColor.green);
      expect(led.blue).to.equal(expectedLedColor.blue);
    }

    await ledController.clearLeds().show();
  });

  it ('should be able to clear the led strip', async () => {
    const expectedLedColor = {
      red: 255,
      green: 155,
      blue: 55,
    };

    await ledController.fillLeds(expectedLedColor).show();

    for (const led of ledController.getLedStrip()) {
      expect(led.red).to.equal(expectedLedColor.red);
      expect(led.green).to.equal(expectedLedColor.green);
      expect(led.blue).to.equal(expectedLedColor.blue);
    }

    await ledController.clearLeds().show();

    for (const led of ledController.getLedStrip()) {
      expect(led.red).to.equal(0);
      expect(led.green).to.equal(0);
      expect(led.blue).to.equal(0);
    }
  });

  it ('should be able to set a single led', async () => {
    const expectedLedColor = {
      red: 255,
      green: 155,
      blue: 55,
    };
    const indexOfExpectedLed = Math.floor(Math.random() * 10);

    await ledController.setLed(indexOfExpectedLed, expectedLedColor).show();


    const ledStrip = ledController.getLedStrip();
    const blankLeds = ledStrip.slice();
    blankLeds.splice(indexOfExpectedLed, 1);

    for (let index = 0; index < blankLeds.length; index++) {
      if (index === indexOfExpectedLed) {
        continue;
      }

      expect(ledStrip[index].red).to.equal(0);
      expect(ledStrip[index].green).to.equal(0);
      expect(ledStrip[index].blue).to.equal(0);
    }

    expect(ledStrip[indexOfExpectedLed].red).to.equal(expectedLedColor.red);
    expect(ledStrip[indexOfExpectedLed].green).to.equal(expectedLedColor.green);
    expect(ledStrip[indexOfExpectedLed].blue).to.equal(expectedLedColor.blue);

    await ledController.clearLeds().show();
  });

  it ('should be able to change the brightness', () => {
    const brightnessToSet = 50;

    ledController.setBrightness(brightnessToSet);

    let actualBrightness = ledController.getBrightness();

    expect(actualBrightness).to.equal(brightnessToSet);

    ledController.setBrightness('auto');
    actualBrightness = ledController.getBrightness();

    expect(actualBrightness).to.equal('auto');
  });

  it ('should be able to set the whole led strip', async() => {
    const expectedLedColor = {
      red: 255,
      green: 155,
      blue: 55,
    };

    const ledStripLength = ledController.getLedStrip().length;

    let ledStripToSet = [];
    for(let index = 0; index < ledStripLength; index++) {
      ledStripToSet[index] = expectedLedColor;
    }

    await ledController.setLedStrip(ledStripToSet).show();

    const ledStrip = ledController.getLedStrip();

    for (let index = 0; index < ledStrip.length; index++) {

      expect(ledStrip[index].red).to.equal(expectedLedColor.red);
      expect(ledStrip[index].green).to.equal(expectedLedColor.green);
      expect(ledStrip[index].blue).to.equal(expectedLedColor.blue);
    }


    await ledController.clearLeds().show();
  });

  it ('should throw an error if led strip to set is invalid', async() => {
    const currentLedStrip = ledController.getLedStrip()
    const ledStripLength = currentLedStrip.length;

    let ledStripWithTooManyLeds = [];
    for(let index = 0; index < ledStripLength + 1; index++) {
      ledStripWithTooManyLeds[index] = {red: 255, blue: 0, green: 0};
    }

    let ledStripWithTooFewLeds = [];
    for(let index = 0; index < ledStripLength - 1; index++) {
      ledStripWithTooFewLeds[index] = {red: 255, blue: 0, green: 0};
    }

    let ledStripWithInvalidLedColor = currentLedStrip.slice();
    ledStripWithInvalidLedColor[0].green = 256;

    let ledStripWithMissingLedColor = currentLedStrip.slice();
    ledStripWithMissingLedColor[1].blue = undefined;

    let ledStripWithMissingLed = currentLedStrip.slice();
    ledStripWithMissingLed[2] = undefined;

    expect(ledController.setLedStrip.bind(ledController, ledStripWithTooManyLeds)).to.throw(`The led strip consists of ${ledStripLength} leds, but led colors that should be set consists of ${ledStripLength + 1} leds.`);
    expect(ledController.setLedStrip.bind(ledController, ledStripWithTooFewLeds)).to.throw(`The led strip consists of ${ledStripLength} leds, but led colors that should be set consists of ${ledStripLength - 1} leds.`);

    expect(ledController.setLedStrip.bind(ledController, ledStripWithInvalidLedColor)).to.throw(`Some led colors of the led strip are invalid. The following leds are invalid:\n`);
    expect(ledController.setLedStrip.bind(ledController, ledStripWithMissingLedColor)).to.throw(`Some led colors of the led strip are invalid. The following leds are invalid:\n`);
    expect(ledController.setLedStrip.bind(ledController, ledStripWithMissingLed)).to.throw(`Some led colors of the led strip are invalid. The following leds are invalid:\n`);


    await ledController.clearLeds().show();
  });


  it ('should trigger led strip changed callback when led strip was changed', async() => {
    const expectedLedColor = {
      red: 255,
      green: 155,
      blue: 55,
    };
    const indexOfExpectedLed = Math.floor(Math.random() * 10);

    let callbackWasTriggered = false;
    const listenerId = ledController.onLedStripChanged((ledStrip) => {
      callbackWasTriggered = true;

      expect(ledStrip[indexOfExpectedLed].red).to.equal(expectedLedColor.red);
      expect(ledStrip[indexOfExpectedLed].green).to.equal(expectedLedColor.green);
      expect(ledStrip[indexOfExpectedLed].blue).to.equal(expectedLedColor.blue);
    })

    await ledController.setLed(indexOfExpectedLed, expectedLedColor).show();

    expect(callbackWasTriggered).to.be.true;

    ledController.removeEventListener(listenerId);
  });

  it ('should trigger brightness changed callback when brightness was changed', async() => {
    const expectedBrightness = 75;

    let callbackWasTriggered = false;

    const listenerId = ledController.onBrightnessChanged((brightness) => {
      callbackWasTriggered = true;

      expect(brightness).to.equal(expectedBrightness);
    })

    await ledController.setBrightness(expectedBrightness).show();

    expect(callbackWasTriggered).to.be.true;

    ledController.removeEventListener(listenerId);
  });

  it ('should throw an error if the brightness value is invalid', async () => {
    expect(ledController.setBrightness.bind(ledController, -1)).to.throw(`The brightness must be between 0 and 100 or 'auto'.`);
    expect(ledController.setBrightness.bind(ledController, 101)).to.throw(`The brightness must be between 0 and 100 or 'auto'.`);
    expect(ledController.setBrightness.bind(ledController, 'aut')).to.throw(`The brightness must be between 0 and 100 or 'auto'.`);
  });

  it ('should be able to handle multiple changes at the same time', async () => {
    const ledColor = {
      red: 255,
      green: 155,
      blue: 55,
    };

    await new Promise((resolve) => {
      const unfillInterval = setInterval(async() => {
        const black = {red: 0, green: 0, blue: 0};

        await ledController.fillLeds(black).show();
      }, 100);

      const fillInterval = setInterval(async() => {
        await ledController.fillLeds(ledColor).show();
      }, 100);

      const fillAgainInterval = setInterval(async() => {
        await ledController.fillLeds(ledColor).show();
      }, 100);

      setTimeout(() => {
        clearInterval(unfillInterval);
        clearInterval(fillInterval);
        clearInterval(fillAgainInterval);

        resolve();
      }, 1050);

    });

    const ledStrip = ledController.getLedStrip();

    expect(ledStrip[5].red).to.equal(ledColor.red);
    expect(ledStrip[5].green).to.equal(ledColor.green);
    expect(ledStrip[5].blue).to.equal(ledColor.blue);

    await ledController.clearLeds().show();
  });

  it ('should only render led strip after show was called.', async () => {
    const ledColor = {
      red: 255,
      green: 155,
      blue: 55,
    };

    ledController.fillLeds(ledColor);

    const ledStripBeforeShow = ledController.getLedStrip();

    expect(ledStripBeforeShow[5].red).to.equal(0);
    expect(ledStripBeforeShow[5].green).to.equal(0);
    expect(ledStripBeforeShow[5].blue).to.equal(0);

    await ledController.show();

    const ledStripAfterShow = ledController.getLedStrip();

    expect(ledStripAfterShow[5].red).to.equal(ledColor.red);
    expect(ledStripAfterShow[5].green).to.equal(ledColor.green);
    expect(ledStripAfterShow[5].blue).to.equal(ledColor.blue);

    await ledController.clearLeds().show();
  });

  it ('should not be necessary to call show if automatic rendering is activated.', async () => {
    const ledColor = {
      red: 255,
      green: 155,
      blue: 55,
    };

    automaticRenderingLedController.fillLeds(ledColor);
    await automaticRenderingLedController.renderPromise;

    const ledStrip = automaticRenderingLedController.getLedStrip();

    expect(ledStrip[5].red).to.equal(ledColor.red);
    expect(ledStrip[5].green).to.equal(ledColor.green);
    expect(ledStrip[5].blue).to.equal(ledColor.blue);

    automaticRenderingLedController.clearLeds()
    await automaticRenderingLedController.renderPromise;
  });
});
