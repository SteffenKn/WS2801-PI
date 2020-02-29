import chai from 'chai';

import LedController, {LedColor, Ledstrip} from '../../dist/index';

const expect: chai.ExpectStatic = chai.expect;

let ledController: LedController;
let automaticRenderingLedController: LedController;

describe ('LedController', (): void => {
  afterEach (async(): Promise<void> => {
    await ledController.clearLeds().show();
    await automaticRenderingLedController.clearLeds().renderPromise;
  });

  it ('should be able to create an LedController', async(): Promise<void> => {
    ledController = new LedController(10, {
      debug: true,
    });
    automaticRenderingLedController = new LedController(10, {
      debug: true,
      automaticRendering: true,
    });

    await ledController.renderPromise;
    await automaticRenderingLedController.renderPromise;

    expect(ledController).not.to.equal(undefined);
    expect(automaticRenderingLedController).not.to.equal(undefined);
  });

  it ('should be able to get the ledstrip', (): void => {
    const ledstrip: Ledstrip = ledController.getLedstrip();

    for (const led of ledstrip) {
      expect(led.red).to.equal(0);
      expect(led.green).to.equal(0);
      expect(led.blue).to.equal(0);
    }
  });

  it ('should be able to fill the ledstrip', async(): Promise<void> => {
    const expectedLed: LedColor = {
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

  it ('should be able to clear the ledstrip', async(): Promise<void> => {
    const expectedLed: LedColor = {
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

  it ('should be able to fill a single led', async(): Promise<void> => {
    const expectedLed: LedColor = {
      red: 255,
      green: 155,
      blue: 55,
    };
    const indexOfExpectedLed: number = Math.floor(Math.random() * 10);

    await ledController.setLed(indexOfExpectedLed, expectedLed.red, expectedLed.green, expectedLed.blue).show();

    const ledstrip: Ledstrip = ledController.getLedstrip();
    const blankLeds: Ledstrip = ledstrip.slice();
    blankLeds.splice(indexOfExpectedLed, 1);

    for (let index: number = 0; index < blankLeds.length; index++) {
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

  it ('should be able to handle multiple changes at the same time', async(): Promise<void> => {
    const ledColor: LedColor = {
      red: 255,
      green: 155,
      blue: 55,
    };

    await new Promise((resolve: Function): void => {
      const unfillInterval: NodeJS.Timeout = setInterval(async(): Promise<void> => {
        await ledController.fillLeds(0, 0, 0).show();
      }, 100);

      const fillInterval: NodeJS.Timeout = setInterval(async(): Promise<void> => {
        await ledController.fillLeds(ledColor.red, ledColor.green, ledColor.blue).show();
      }, 100);

      const fillAgainInterval: NodeJS.Timeout = setInterval(async(): Promise<void> => {
        await ledController.fillLeds(ledColor.red, ledColor.green, ledColor.blue).show();
      }, 100);

      setTimeout((): void => {
        clearInterval(unfillInterval);
        clearInterval(fillInterval);
        clearInterval(fillAgainInterval);

        resolve();
      }, 1050);
    });

    const ledstrip: Ledstrip = ledController.getLedstrip();

    expect(ledstrip[5].red).to.equal(ledColor.red);
    expect(ledstrip[5].green).to.equal(ledColor.green);
    expect(ledstrip[5].blue).to.equal(ledColor.blue);

    await ledController.clearLeds().show();
  });

  it ('should only render ledstrip after show was called.', async(): Promise<void> => {
    const ledColor: LedColor = {
      red: 255,
      green: 155,
      blue: 55,
    };

    ledController.fillLeds(ledColor.red, ledColor.green, ledColor.blue);

    const ledstripBeforeShow: Ledstrip = ledController.getLedstrip();

    expect(ledstripBeforeShow[5].red).to.equal(0);
    expect(ledstripBeforeShow[5].green).to.equal(0);
    expect(ledstripBeforeShow[5].blue).to.equal(0);

    await ledController.show();

    const ledstripAfterShow: Ledstrip = ledController.getLedstrip();

    expect(ledstripAfterShow[5].red).to.equal(ledColor.red);
    expect(ledstripAfterShow[5].green).to.equal(ledColor.green);
    expect(ledstripAfterShow[5].blue).to.equal(ledColor.blue);

    await ledController.clearLeds().show();
  });

  it ('should not be necessary to call show if automatic rendering is activated.', async(): Promise<void> => {
    const ledColor: LedColor = {
      red: 255,
      green: 155,
      blue: 55,
    };

    automaticRenderingLedController.fillLeds(ledColor.red, ledColor.green, ledColor.blue);
    await automaticRenderingLedController.renderPromise;

    const ledstrip: Ledstrip = automaticRenderingLedController.getLedstrip();

    expect(ledstrip[5].red).to.equal(ledColor.red);
    expect(ledstrip[5].green).to.equal(ledColor.green);
    expect(ledstrip[5].blue).to.equal(ledColor.blue);

    automaticRenderingLedController.clearLeds();
    await automaticRenderingLedController.renderPromise;
  });
});
