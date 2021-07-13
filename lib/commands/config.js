import chalk from 'chalk';
import redent from 'redent';
import trimNewlines from 'trim-newlines';
import { homedir } from 'os';
import { resolve } from 'path';
import { promises, createWriteStream } from 'fs';
import inquirer from 'inquirer';

import macros from '../pipe/macros.js';
import checkConfig from '../utils/checkConfig.js';

export default {
  data: {
    helper: chalk`
            Usage: config [options]

            Inspect and modify config.

            Options:
            -c, --create    Start process to create fast-repo config folder.
            -u, --update    Start process to update fast-repo config.
        `,
    options: {
      create: {
        type: 'boolean',
        alias: 'c',
      },
      update: {
        type: 'boolean',
        alias: 'u',
      },
    },
  },
  async start(flags) {
    if (!Object.keys(flags).length) return this.showHelpMessage('Missing flags');

    const configExist = await checkConfig();

    if (configExist) {
      if (flags.create)
        return this.showHelpMessage(
          'configuration already been created try with the --update flag'
        );

      if (flags.update) {
        const aswr = await inquirer.prompt([
          {
            type: 'input',
            name: 'newToken',
            message: 'Enter your new token',
            validate(value) {
              if (!value.length) return 'Enter a value';
              return true;
            },
          },
          {
            type: 'confirm',
            name: 'isValid',
            message(sessions) {
              return `Validate this new token ? ${new inquirer.Separator(
                `${sessions.newToken}`
              )}`;
            },
          },
          {
            type: 'input',
            name: 'editNewToken',
            message(session) {
              return `Edit new token old value ${new inquirer.Separator(
                `${session.newToken}`
              )}`;
            },
            when(answer) {
              if (!answer.isValid) return true;
              return false;
            },
            validate(value) {
              if (!value.length) return 'Enter a value';
              return true;
            },
          },
        ]);

        const newToken = aswr.editNewToken ? aswr.editNewToken : aswr.newToken;

        return createWriteStream(
          resolve(homedir(), macros.configFolder, macros.configFile)
        )
          .on('error', function (error) {
            process.stderr.write(chalk`{red ${error.message}}`);
            return process.exit(-1);
          })
          .write(`token=${newToken}`, 'utf-8', function (err) {
            if (err) {
              process.stderr.write(chalk`{red ${error.message}}`);
              return process.exit(-1);
            }

            process.stdout.write(redent(chalk`{green Config updated correctly 👌}`));
            return process.exit(0);
          });
      }
    }

    if (flags.update)
      return this.showHelpMessage(
        "Can't update configuration because it does not exist try with the --create flag"
      );

    if (flags.create) {
      try {
        const folderToCreate = resolve(homedir(), macros.configFolder);
        await promises.mkdir(folderToCreate, { recursive: true });

        const answer = await inquirer.prompt([
          {
            type: 'input',
            name: 'token',
            message: 'Enter token API',
            validate(value) {
              if (!value.length) return false;
              return true;
            },
          },
        ]);

        return createWriteStream(`${folderToCreate}/${macros.configFile}`)
          .on('error', function (error) {
            process.stderr.write(chalk`{red ${error.message}}`);
            return process.exit(-1);
          })
          .write(`token=${answer.token}`, 'utf-8', function (err) {
            if (err) {
              process.stderr.write(chalk`{red ${error.message}}`);
              return process.exit(-1);
            }

            process.stdout.write(redent(chalk`{green Config well created 👌}`));
            return process.exit(0);
          });
      } catch (error) {
        process.stderr.write(chalk`{bgRed ${error.message}}`);
        return process.exit(-1);
      }
    }
  },
  showHelpMessage(additionalMessage) {
    process.stderr.write(
      redent(
        trimNewlines(
          chalk`${(this.data.helper || '').replace(/\t+\n*$/, '')}
          {red ${additionalMessage}}`
        ),
        2
      )
    );
    return process.exit(0);
  },
};
