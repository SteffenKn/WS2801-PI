import {expect} from 'chai';
import {argv} from 'optimist';

import LedController, { ClockSpeed, LedColor, LedStrip } from '../../dist/index';

const ledController: LedController = new LedController(10, {
  debug: argv.noDebug !== true,
});
const automaticRenderingLedController: LedController = new LedController(10, {
  debug: argv.noDebug !== true,
  automaticRendering: true,
});

describe ('LedController', (): void => {
  afterEach (async(): Promise<void> => {
    await ledController.clearLeds().show();
    await automaticRenderingLedController.clearLeds().renderPromise;
  });

  it ('should be able to create an LedController', async(): Promise<void> => {
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

  it ('should be able to set the clockSpeed', (): void => {
    const previousClockSpeed: ClockSpeed = ledController.clockSpeed;
    const expectedClockSpeed: ClockSpeed = ClockSpeed.OneMHZ;

    ledController.clockSpeed = expectedClockSpeed;

    const currentClockSpeed: ClockSpeed = ledController.clockSpeed;

    expect(previousClockSpeed).not.to.equal(expectedClockSpeed);
    expect(currentClockSpeed).to.equal(expectedClockSpeed);
  });

  it ('should be able to get the led strip', (): void => {
    const ledStrip: LedStrip = ledController.getLedStrip();

    for (const led of ledStrip) {
      expect(led.red).to.equal(0);
      expect(led.green).to.equal(0);
      expect(led.blue).to.equal(0);
    }
  });

  it ('should be able to fill the led strip', async(): Promise<void> => {
    const expectedLedColor: LedColor = {
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

  it ('should be able to clear the led strip', async(): Promise<void> => {
    const expectedLedColor: LedColor = {
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

  it ('should be able to set a single led', async(): Promise<void> => {
    const expectedLedColor: LedColor = {
      red: 255,
      green: 155,
      blue: 55,
    };
    const indexOfExpectedLed: number = Math.floor(Math.random() * 10);

    await ledController.setLed(indexOfExpectedLed, expectedLedColor).show();

    const ledStrip: LedStrip = ledController.getLedStrip();
    const blankLeds: LedStrip = ledStrip.slice();
    blankLeds.splice(indexOfExpectedLed, 1);

    for (let index: number = 0; index < blankLeds.length; index++) {
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

  it ('should be able to change the brightness', async () => {
    const brightnessToSet: number = 50;

    await ledController.setBrightness(brightnessToSet).show();

    let actualBrightness: number | 'auto' = ledController.getBrightness();

    expect(actualBrightness).to.equal(brightnessToSet);

    await ledController.setBrightness('auto').show();
    actualBrightness = ledController.getBrightness();

    expect(actualBrightness).to.equal('auto');
  });

  it ('should be able to set the whole led strip', async(): Promise<void> => {
    const expectedLedColor: LedColor = {
      red: 255,
      green: 155,
      blue: 55,
    };

    const ledStripLength = ledController.getLedStrip().length;

    let ledStripToSet: LedStrip = [];
    for(let index: number = 0; index < ledStripLength; index++) {
      ledStripToSet[index] = expectedLedColor;
    }

    await ledController.setLedStrip(ledStripToSet).show();

    const ledStrip: LedStrip = ledController.getLedStrip();

    for (let index: number = 0; index < ledStrip.length; index++) {

      expect(ledStrip[index].red).to.equal(expectedLedColor.red);
      expect(ledStrip[index].green).to.equal(expectedLedColor.green);
      expect(ledStrip[index].blue).to.equal(expectedLedColor.blue);
    }


    await ledController.clearLeds().show();
  });

  it ('should throw an error if led strip to set is invalid', async(): Promise<void> => {
    const currentLedStrip: LedStrip = ledController.getLedStrip()
    const ledStripLength: number = currentLedStrip.length;

    let ledStripWithTooManyLeds: LedStrip = [];
    for(let index: number = 0; index < ledStripLength + 1; index++) {
      ledStripWithTooManyLeds[index] = {red: 255, blue: 0, green: 0};
    }

    let ledStripWithTooFewLeds: LedStrip = [];
    for(let index: number = 0; index < ledStripLength - 1; index++) {
      ledStripWithTooFewLeds[index] = {red: 255, blue: 0, green: 0};
    }

    let ledStripWithInvalidLedColor: LedStrip = currentLedStrip.slice();
    ledStripWithInvalidLedColor[0].green = 256;

    let ledStripWithMissingLedColor: LedStrip = currentLedStrip.slice();
    ledStripWithMissingLedColor[1].blue = undefined;

    let ledStripWithMissingLed: LedStrip = currentLedStrip.slice();
    ledStripWithMissingLed[2] = undefined;

    expect(ledController.setLedStrip.bind(ledController, ledStripWithTooManyLeds)).to.throw(`The led strip consists of ${ledStripLength} leds, but led colors that should be set consists of ${ledStripLength + 1} leds.`);
    expect(ledController.setLedStrip.bind(ledController, ledStripWithTooFewLeds)).to.throw(`The led strip consists of ${ledStripLength} leds, but led colors that should be set consists of ${ledStripLength - 1} leds.`);

    expect(ledController.setLedStrip.bind(ledController, ledStripWithInvalidLedColor)).to.throw(`Some led colors of the led strip are invalid. The following leds are invalid:\n`);
    expect(ledController.setLedStrip.bind(ledController, ledStripWithMissingLedColor)).to.throw(`Some led colors of the led strip are invalid. The following leds are invalid:\n`);
    expect(ledController.setLedStrip.bind(ledController, ledStripWithMissingLed)).to.throw(`Some led colors of the led strip are invalid. The following leds are invalid:\n`);


    await ledController.clearLeds().show();
  });

  it ('should trigger led strip changed callback when led strip was changed', async(): Promise<void> => {
    const expectedLedColor: LedColor = {
      red: 255,
      green: 155,
      blue: 55,
    };
    const indexOfExpectedLed: number = Math.floor(Math.random() * 10);

    let callbackWasTriggered: boolean = false;
    const listenerId: string = ledController.onLedStripChanged((ledStrip: LedStrip) => {
      callbackWasTriggered = true;

      expect(ledStrip[indexOfExpectedLed].red).to.equal(expectedLedColor.red);
      expect(ledStrip[indexOfExpectedLed].green).to.equal(expectedLedColor.green);
      expect(ledStrip[indexOfExpectedLed].blue).to.equal(expectedLedColor.blue);
    })

    await ledController.setLed(indexOfExpectedLed, expectedLedColor).show();

    expect(callbackWasTriggered).to.be.true;

    ledController.removeEventListener(listenerId);
  });

  it ('should trigger brightness changed callback when brightness was changed', async(): Promise<void> => {
    const expectedBrightness: number = 75;

    let callbackWasTriggered: boolean = false;

    const listenerId: string = ledController.onBrightnessChanged((brightness: number) => {
      callbackWasTriggered = true;

      expect(brightness).to.equal(expectedBrightness);
    })

    await ledController.setBrightness(expectedBrightness).show();

    expect(callbackWasTriggered).to.be.true;

    ledController.removeEventListener(listenerId);
  });

  it ('should throw an error if the brightness value is invalid', () => {
    expect(ledController.setBrightness.bind(ledController, -1)).to.throw(`The brightness must be between 0 and 100 or 'auto'.`);
    expect(ledController.setBrightness.bind(ledController, 101)).to.throw(`The brightness must be between 0 and 100 or 'auto'.`);
    expect(ledController.setBrightness.bind(ledController, 'aut')).to.throw(`The brightness must be between 0 and 100 or 'auto'.`);
  });

  it ('should be able to handle multiple changes at the same time', async(): Promise<void> => {
    const ledColor: LedColor = {
      red: 255,
      green: 155,
      blue: 55,
    };

    await new Promise((resolve: Function): void => {
      const unfillInterval: NodeJS.Timeout = setInterval(async(): Promise<void> => {
        const black: LedColor = {red: 0, green: 0, blue: 0};
        await ledController.fillLeds(black).show();
      }, 100);

      const fillInterval: NodeJS.Timeout = setInterval(async(): Promise<void> => {
        await ledController.fillLeds(ledColor).show();
      }, 100);

      const fillAgainInterval: NodeJS.Timeout = setInterval(async(): Promise<void> => {
        await ledController.fillLeds(ledColor).show();
      }, 100);

      setTimeout((): void => {
        clearInterval(unfillInterval);
        clearInterval(fillInterval);
        clearInterval(fillAgainInterval);

        resolve();
      }, 1050);
    });

    const ledStrip: LedStrip = ledController.getLedStrip();

    expect(ledStrip[5].red).to.equal(ledColor.red);
    expect(ledStrip[5].green).to.equal(ledColor.green);
    expect(ledStrip[5].blue).to.equal(ledColor.blue);

    await ledController.clearLeds().show();
  });

  it ('should only render ledStrip after show was called.', async(): Promise<void> => {
    const ledColor: LedColor = {
      red: 255,
      green: 155,
      blue: 55,
    };

    ledController.fillLeds(ledColor);

    const ledStripBeforeShow: LedStrip = ledController.getLedStrip();

    expect(ledStripBeforeShow[5].red).to.equal(0);
    expect(ledStripBeforeShow[5].green).to.equal(0);
    expect(ledStripBeforeShow[5].blue).to.equal(0);

    await ledController.show();

    const ledStripAfterShow: LedStrip = ledController.getLedStrip();

    expect(ledStripAfterShow[5].red).to.equal(ledColor.red);
    expect(ledStripAfterShow[5].green).to.equal(ledColor.green);
    expect(ledStripAfterShow[5].blue).to.equal(ledColor.blue);

    await ledController.clearLeds().show();
  });

  it ('should not be necessary to call show if automatic rendering is activated.', async(): Promise<void> => {
    const ledColor: LedColor = {
      red: 255,
      green: 155,
      blue: 55,
    };

    automaticRenderingLedController.fillLeds(ledColor);
    await automaticRenderingLedController.renderPromise;

    const ledStrip: LedStrip = automaticRenderingLedController.getLedStrip();

    expect(ledStrip[5].red).to.equal(ledColor.red);
    expect(ledStrip[5].green).to.equal(ledColor.green);
    expect(ledStrip[5].blue).to.equal(ledColor.blue);

    automaticRenderingLedController.clearLeds();
    await automaticRenderingLedController.renderPromise;
  });
});
