import chalk from 'chalk';
import inquirer from 'inquirer';
import redent from 'redent';
import Listr from 'listr';
import { resolve } from 'path';
import { promises } from 'fs';
import { spawn } from 'child_process';

import checkConfig from '../utils/checkConfig.js';
import http from '../utils/http.js';
import execa from 'execa';

const data = {
  helper: chalk`
        Usage: create [options]

        Create a new github repo and a new folder connected to it.

        Options:
        -n, --name <repo-name>          Name of repo and folder created
        -p, --path  <path-name>         The path to create the folder
    `,
  options: {
    name: {
      type: 'string',
      alias: 'n',
      isRequired(flag, input) {
        if (input.includes('create') && !flag.help) {
          return true;
        }

        return false;
      },
    },
    path: {
      type: 'string',
      alias: 'p',
      default: process.cwd(),
    },
  },
};

async function start(flags) {
  try {
    if (!/^[a-zA-Z0-9-_.]+$/.test(flags.name)) {
      throw new Error('Invalid name');
    }

    const key = await checkConfig(true);
    const ghquestions = JSON.parse(
      await promises.readFile(new URL('../utils/ghquestions.json', import.meta.url))
    );
    const pathToCreateFolder = resolve(flags.path);
    const languages = (await http.get('repos/github/gitignore/contents')).data
      .map(function l(c) {
        const languageName = c.name.split('.')[0];
        if (
          c.type === 'dir' ||
          ['README', 'LICENSE', 'CONTRIBUTING'].includes(languageName)
        )
          return;
        return c.name.split('.')[0]; // eslint-disable-line consistent-return
      })
      .filter((f) => f !== undefined);

    flags.path = `${pathToCreateFolder}/${flags.name}`;

    process.stdout.write(
      redent(chalk`{cyan Just a few questions to configurate your new repo :)}\n`)
    );

    const answer = await inquirer.prompt([
      {
        type: 'confirm',
        message: 'Would you like to create a folder link to your new repo ?',
        name: 'createFolder',
      },
      {
        type: 'confirm',
        name: 'confirmCreateFolder',
        message: chalk`We will create {yellow ${flags.name}} folder to this path {yellow ${flags.path}} is it correct ?`,
        when(session) {
          if (session.createFolder) return true;
          return false;
        },
      },
      {
        type: 'string',
        name: 'editPath',
        message: 'Enter new path',
        when(session) {
          if (session.createFolder && !session.confirmCreateFolder) return true;
          return false;
        },
        filter(newPath) {
          return resolve(newPath, flags.name);
        },
      },
      {
        type: 'string',
        name: 'description',
        message: `Add a little description ? ${new inquirer.Separator('Optional')}`,
      },
      {
        type: 'list',
        message: 'The desired language or platform to apply to the .gitignore.',
        name: 'gitignore_template',
        choices: [...languages],
      },
      ...ghquestions,
    ]);

    const objMerge = {
      ...flags,
      ...answer,
    };

    const tasks = new Listr([
      {
        title: 'Publish repository',
        async task(ctx, task) {
          try {
            const result = await http.post('/user/repos', objMerge, {
              headers: {
                'User-Agent': key.name,
                Authorization: `token ${key.token}`,
              },
            });

            ctx.repoSSLUrl = result.data.ssh_url;
            task.output = `${objMerge.name} successfully created 🚀`;
            return Promise.resolve();
          } catch (error) {
            task.output = `Can\'t create repository ${objMerge.name} - ${error.response.data.message}`;
            return Promise.reject();
          }
        },
      },
      {
        title: 'Create folder link to this repo',
        skip(ctx) {
          if (!ctx.createFolder) return true;
          return false;
        },
        async task(ctx) {
          const pathToCreate = ctx.editPath ? ctx.editPath : ctx.path;

          try {
            await promises.mkdir(pathToCreate);
            return spawn(`git init && git remote add origin ${ctx.repoSSLUrl}`, [], {
              cwd: pathToCreate,
              shell: true,
            })
              .on('error', function (error) {
                return Promise.reject(error);
              })
              .on('close', (code) => {
                if (code === 0) {
                  return Promise.resolve();
                }

                return Promise.reject(new Error(`${code} - fail on creating folder`));
              });
          } catch (error) {
            return Promise.reject(error);
          }
        },
      },
      {
        title: 'Install luctst-cli package',
        enabled(ctx) {
          if (!ctx.withLuctstCli) return false;
          return true;
        },
        task(ctx) {
          const pathToCreate = ctx.editPath ? ctx.editPath : ctx.path;

          return execa(
            'npx luctst-cli start',
            [
              `-p ${pathToCreate}`,
              `--gitignore ${ctx.gitignore_template}`,
              `-n ${key.name}`,
              `--github-user ${key.name}`,
              `--project-name ${ctx.name}`,
              `-d ${ctx.description}`,
            ],
            {
              cwd: pathToCreate,
            }
          );
        },
      },
    ]);

    await tasks.run(objMerge);
  } catch (error) {
    if (!error.context) {
      process.stderr.write(chalk`{bgRed ${error.message}}`);
    }

    return process.exit(-1);
  }
}

export default {
  data,
  start,
};
