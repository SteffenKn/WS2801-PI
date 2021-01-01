import {LedColor, LedStrip} from './index';

export function validateLedStrip(amountOfLeds: number, ledStrip: LedStrip): void {
  if (amountOfLeds !== ledStrip.length) {
    throw new Error(`The led strip consists of ${amountOfLeds} leds, but led colors that should be set consists of ${ledStrip.length} leds.`);
  }

  const invalidLedIndexes: Array<number> = [];
  for (let ledIndex: number = 0; ledIndex < ledStrip.length; ledIndex++) {
    const ledColor: LedColor = ledStrip[ledIndex];

    if (ledColor === undefined) {
      invalidLedIndexes.push(ledIndex);
      continue;
    }

    if (ledColor.red == undefined || typeof ledColor.red !== 'number' || ledColor.red < 0 || ledColor.red > 255) {
      invalidLedIndexes.push(ledIndex);
    }

    if (ledColor.green == undefined || typeof ledColor.green !== 'number' || ledColor.green < 0 || ledColor.green > 255) {
      invalidLedIndexes.push(ledIndex);
    }

    if (ledColor.blue == undefined || typeof ledColor.blue !== 'number' || ledColor.blue < 0 || ledColor.blue > 255) {
      invalidLedIndexes.push(ledIndex);
    }
  }

  if (invalidLedIndexes.length !== 0) {
    let errorMessage: string = `Some led colors of the led strip are invalid. The following leds are invalid:\n`;

    for (const invalidLedIndex of invalidLedIndexes) {
      errorMessage += `${invalidLedIndex}: ${JSON.stringify(ledStrip[invalidLedIndex])}, `;
    }

    errorMessage = errorMessage.substring(0, errorMessage.length - 2);

    throw new Error(errorMessage);
  }
}
