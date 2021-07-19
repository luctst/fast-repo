import chalk from 'chalk';
import redent from 'redent';
import trimNewlines from 'trim-newlines';
import { homedir } from 'os';
import { resolve } from 'path';
import { promises, createWriteStream } from 'fs';
import inquirer from 'inquirer';

import macros from '../pipe/macros.js';
import checkConfig from '../utils/checkConfig.js';
import configToObj from '../utils/configToObj.js';

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
            type: 'checkbox',
            name: 'dataToUpdates',
            message: 'Which data would you like to update ?',
            choices: [
              {
                name: 'Github username',
                value: 'GHusername',
              },
              {
                name: 'Github token api',
                value: 'GHtoken',
              },
            ],
            validate(value) {
              if (!value.length) return 'Select a value';
              return true;
            },
          },
          {
            type: 'input',
            name: 'githubAccount',
            message: 'Enter your github username',
            when(value) {
              if (!value.dataToUpdates.includes('GHusername')) return false;
              return true;
            },
            validate(value) {
              if (!value.length) return 'Enter a value';
              if (/^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i.test(value) === false)
                return 'Bad github username';

              return true;
            },
          },
          {
            type: 'input',
            name: 'newToken',
            message: 'Enter your new token',
            when(value) {
              if (!value.dataToUpdates.includes('GHtoken')) return false;
              return true;
            },
            validate(value) {
              if (!value.length) return 'Enter a value';
              return true;
            },
          },
        ]);

        const newConfigFile = await this.parseAnswer(aswr);

        return createWriteStream(
          resolve(homedir(), macros.configFolder, macros.configFile)
        )
          .on('error', (error) => {
            process.stderr.write(chalk`{red ${error.message}}`);
            return process.exit(-1);
          })
          .write(newConfigFile, 'utf-8', (err) => {
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
          {
            type: 'input',
            name: 'githubAccount',
            message: 'Enter your github username',
            validate(value) {
              if (!value.length) return 'Enter a value';
              if (/^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i.test(value) === false)
                return 'Bad github username';

              return true;
            },
          },
        ]);

        return createWriteStream(`${folderToCreate}/${macros.configFile}`)
          .on('error', (error) => {
            process.stderr.write(chalk`{red ${error.message}}`);
            return process.exit(-1);
          })
          .write(
            redent(
              trimNewlines(
                `
                token=${answer.token}
                name=${answer.githubAccount}
              `
              )
            ),
            'utf-8',
            (err) => {
              if (err) {
                process.stderr.write(chalk`{red ${error.message}}`);
                return process.exit(-1);
              }

              process.stdout.write(redent(chalk`{green Config well created 👌}`));
              return process.exit(0);
            }
          );
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
  async parseAnswer(answer) {
    const config = await configToObj();

    let StringToReturn = '';

    if (answer.githubAccount && answer.newToken) {
      StringToReturn = `token=${answer.newToken}\nname=${answer.githubAccount}`;
    } else if (answer.githubAccount) {
      StringToReturn = `token=${config.token}\nname=${answer.githubAccount}`;
    } else if (answer.newToken) {
      StringToReturn = `token=${answer.newToken}\nname=${config.name}`;
    }

    return redent(trimNewlines(StringToReturn));
  },
};
