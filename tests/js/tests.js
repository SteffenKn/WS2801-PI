'use strict';
const chai = require('chai');
const expect = chai.expect;

const LedController = require('../../dist/index').default;

let ledController;

describe ('LedController', () => {
  afterEach (async () => {
    await ledController.clearLeds().show();
  });

  it ('should be able to create an LedController"', () => {
    ledController = new LedController(10, true);

    expect(ledController).not.to.equal(undefined);
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
});
