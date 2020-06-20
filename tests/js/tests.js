'use strict';
const chai = require('chai');
const expect = chai.expect;

const LedController = require('../../dist/index').default;
const ClockSpeed = require('../../dist/index').ClockSpeed;

const argv = require('optimist').argv;

let ledController;
let automaticRenderingLedController;

describe ('LedController', () => {
  afterEach (async () => {
    await ledController.clearLeds().show();
    await automaticRenderingLedController.clearLeds().renderPromise;
  });

  it ('should be able to create an LedController"', async () => {
    ledController = new LedController(10, {
      debug: argv.noDebug !== true,
    });
    automaticRenderingLedController = new LedController(10, {
      debug: argv.noDebug !== true,
      automaticRendering: true,
    });

    await ledController.renderPromise;
    await automaticRenderingLedController.renderPromise;

    expect(ledController).not.to.equal(undefined);
    expect(automaticRenderingLedController).not.to.equal(undefined);
  });

  it ('should be able to set the clockSpeed', () => {
    const previousClockSpeed = ledController.clockSpeed;
    const expectedClockSpeed = ClockSpeed.OneMHZ;

    ledController.clockSpeed = expectedClockSpeed;

    const currentClockSpeed = ledController.clockSpeed;

    expect(previousClockSpeed).not.to.equal(expectedClockSpeed);
    expect(currentClockSpeed).to.equal(expectedClockSpeed);
  });

  it ('should be able to get the led strip"', () => {
    const ledStrip = ledController.getLedStrip();

    for (const led of ledStrip) {
      expect(led.red).to.equal(0);
      expect(led.green).to.equal(0);
      expect(led.blue).to.equal(0);
    }
  });

  it ('should be able to fill the led strip"', async () => {
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

  it ('should be able to clear the led strip"', async () => {
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

  it ('should be able to fill a single led"', async () => {
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
