import { promises } from 'fs';
import { homedir } from 'os';
import { resolve } from 'path';

import macros from '../pipe/macros.js';

/**
 * Parse config file and return an object with data inside the file.
 * @returns { Object }
 */
export default async function configToObj() {
  return (
    await promises.readFile(resolve(homedir(), macros.configFolder, macros.configFile), {
      encoding: 'utf-8',
    })
  )
    .trim()
    .split('\n')
    .reduce(function (obj, item) {
      const itemSplit = item.split('=');

      return {
        ...obj,
        [itemSplit[0]]: itemSplit[1],
      };
    }, {});
}
