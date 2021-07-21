import { homedir } from 'os';
import { resolve } from 'path';
import { promises, constants } from 'fs';
import chalk from 'chalk';
import redent from 'redent';

import macros from '../pipe/macros.js';
import configToObj from './configToObj.js';

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
      const config = await configToObj();
      const checkConfig = Object.keys(config);

      if (checkConfig.length > 2) return false;
      if (!checkConfig.includes('token') || !checkConfig.includes('name')) return false;
      if (!checkConfig[0].length || !checkConfig[1].length) return false;

      return stopProcess ? config : true;
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
