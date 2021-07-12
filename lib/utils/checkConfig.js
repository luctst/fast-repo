import { homedir } from "os";
import { resolve } from "path";
import { promises, constants } from "fs";
import chalk from "chalk";
import redent from "redent";

/**
 * Check if config is present and correct.
 * @param {Boolean} stopProcess - If true stop process if an error is thrown
 * @returns {Boolean}
 */
export default async function checkConfig(stopProcess = false) {
  try {
    const pathConfig = resolve(homedir(), "fast-repo");

    await promises.access(pathConfig, constants.F_OK | constants.W_OK);

    const config = await promises.readdir(pathConfig);
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
