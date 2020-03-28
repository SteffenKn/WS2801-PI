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

  it ('should be able to get the ledstrip"', () => {
    const ledstrip = ledController.getLedstrip();

    for (const led of ledstrip) {
      expect(led.red).to.equal(0);
      expect(led.green).to.equal(0);
      expect(led.blue).to.equal(0);
    }
  });

  it ('should be able to fill the ledstrip"', async () => {
    const expectedLed = {
      red: 255,
      green: 155,
      blue: 55,
    };

    await ledController.fillLeds(expectedLed.red, expectedLed.green, expectedLed.blue).show();

    for (const led of ledController.getLedstrip()) {
      expect(led.red).to.equal(expectedLed.red);
      expect(led.green).to.equal(expectedLed.green);
      expect(led.blue).to.equal(expectedLed.blue);
    }

    await ledController.clearLeds().show();
  });

  it ('should be able to clear the ledstrip"', async () => {
    const expectedLed = {
      red: 255,
      green: 155,
      blue: 55,
    };

    await ledController.fillLeds(expectedLed.red, expectedLed.green, expectedLed.blue).show();

    for (const led of ledController.getLedstrip()) {
      expect(led.red).to.equal(expectedLed.red);
      expect(led.green).to.equal(expectedLed.green);
      expect(led.blue).to.equal(expectedLed.blue);
    }

    await ledController.clearLeds().show();

    for (const led of ledController.getLedstrip()) {
      expect(led.red).to.equal(0);
      expect(led.green).to.equal(0);
      expect(led.blue).to.equal(0);
    }
  });

  it ('should be able to fill a single led"', async () => {
    const expectedLed = {
      red: 255,
      green: 155,
      blue: 55,
    };
    const indexOfExpectedLed = Math.floor(Math.random() * 10);

    await ledController.setLed(indexOfExpectedLed, expectedLed.red, expectedLed.green, expectedLed.blue).show();


    const ledstrip = ledController.getLedstrip();
    const blankLeds = ledstrip.slice();
    blankLeds.splice(indexOfExpectedLed, 1);

    for (let index = 0; index < blankLeds.length; index++) {
      if (index === indexOfExpectedLed) {
        continue;
      }

      expect(ledstrip[index].red).to.equal(0);
      expect(ledstrip[index].green).to.equal(0);
      expect(ledstrip[index].blue).to.equal(0);
    }

    expect(ledstrip[indexOfExpectedLed].red).to.equal(expectedLed.red);
    expect(ledstrip[indexOfExpectedLed].green).to.equal(expectedLed.green);
    expect(ledstrip[indexOfExpectedLed].blue).to.equal(expectedLed.blue);

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
        await ledController.fillLeds(0, 0, 0).show();
      }, 100);

      const fillInterval = setInterval(async() => {
        await ledController.fillLeds(ledColor.red, ledColor.green, ledColor.blue).show();
      }, 100);

      const fillAgainInterval = setInterval(async() => {
        await ledController.fillLeds(ledColor.red, ledColor.green, ledColor.blue).show();
      }, 100);

      setTimeout(() => {
        clearInterval(unfillInterval);
        clearInterval(fillInterval);
        clearInterval(fillAgainInterval);

        resolve();
      }, 1050);

    });

    const ledstrip = ledController.getLedstrip();

    expect(ledstrip[5].red).to.equal(ledColor.red);
    expect(ledstrip[5].green).to.equal(ledColor.green);
    expect(ledstrip[5].blue).to.equal(ledColor.blue);

    await ledController.clearLeds().show();
  });

  it ('should only render ledstrip after show was called.', async () => {
    const ledColor = {
      red: 255,
      green: 155,
      blue: 55,
    };

    ledController.fillLeds(ledColor.red, ledColor.green, ledColor.blue);

    const ledstripBeforeShow = ledController.getLedstrip();

    expect(ledstripBeforeShow[5].red).to.equal(0);
    expect(ledstripBeforeShow[5].green).to.equal(0);
    expect(ledstripBeforeShow[5].blue).to.equal(0);

    await ledController.show();

    const ledstripAfterShow = ledController.getLedstrip();

    expect(ledstripAfterShow[5].red).to.equal(ledColor.red);
    expect(ledstripAfterShow[5].green).to.equal(ledColor.green);
    expect(ledstripAfterShow[5].blue).to.equal(ledColor.blue);

    await ledController.clearLeds().show();
  });

  it ('should not be necessary to call show if automatic rendering is activated.', async () => {
    const ledColor = {
      red: 255,
      green: 155,
      blue: 55,
    };

    automaticRenderingLedController.fillLeds(ledColor.red, ledColor.green, ledColor.blue);
    await automaticRenderingLedController.renderPromise;

    const ledstrip = automaticRenderingLedController.getLedstrip();

    expect(ledstrip[5].red).to.equal(ledColor.red);
    expect(ledstrip[5].green).to.equal(ledColor.green);
    expect(ledstrip[5].blue).to.equal(ledColor.blue);

    automaticRenderingLedController.clearLeds()
    await automaticRenderingLedController.renderPromise;
  });
});
