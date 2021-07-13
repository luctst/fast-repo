import { homedir } from 'os';
import { resolve } from 'path';
import { promises, constants } from 'fs';
import chalk from 'chalk';
import redent from 'redent';

import macros from '../pipe/macros.js';

/**
 * Check if config is present and correct.
 * @param {Boolean} stopProcess - If true stop process if an error is thrown
 * @returns {Boolean}
 */
export default async function checkConfig(stopProcess = false) {
  try {
    const pathConfig = resolve(homedir(), macros.configFolder);

    await promises.access(pathConfig, constants.F_OK | constants.W_OK);

    const config = await promises.readdir(pathConfig, { withFileTypes: true });

    const configOk = config.every((item) => {
      if (item.name === macros.configFile) {
        return !!item.isFile();
      }
    });

    if (configOk) {
      const configArray = (
        await promises.readFile(
          resolve(homedir(), macros.configFolder, macros.configFile),
          {
            encoding: 'utf-8',
          }
        )
      )
        .trim()
        .split('=');

      if (configArray.length < 2 || configArray.length > 2) return false;
      if (configArray[0] !== 'token') return false;

      return true;
    }

    return false;
  } catch (error) {
    if (stopProcess) {
      process.stderr.write(
        redent(
          chalk`
                    {bgRed ${error.message}}

                    Run {cyan fast-repo config --create} for create config presets.
                    `
        )
      );
      process.exit(-1);
    }

    return false;
  }
}
