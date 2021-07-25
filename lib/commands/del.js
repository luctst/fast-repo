import chalk from 'chalk';
import inquirer from 'inquirer';
import redent from 'redent';

import checkConfig from '../utils/checkConfig.js';
import http from '../utils/http.js';

export default {
  data: {
    helper: chalk`
        Usage: del

        Delete one or more repository
        `,
    options: {},
  },
  async start() {
    try {
      const config = await checkConfig(true);
      const reposList = await http.get('user/repos', {
        params: {
          sort: 'updated',
          per_page: 100,
        },
        headers: {
          'User-Agent': config.name,
          Authorization: `token ${config.token}`,
        },
      });

      if (!reposList.data.length) {
        process.stderr.write(chalk`{yellow There is no repository to delete 😢}`);
        return process.exit(0);
      }

      const answer = await inquirer.prompt([
        {
          type: 'checkbox',
          name: 'repos',
          message: 'Select one or more repository',
          validate(value) {
            if (!value.length) return 'Select at least one repo';
            if (value.length >= 10) return 'You can select until 10 repos';
            return true;
          },
          choices() {
            return reposList.data.map((repo) => {
              let { name } = repo;

              if (repo.description) {
                name += ` - ${new inquirer.Separator(`${repo.description}`)}`;
              }

              return {
                name,
                value: repo.name,
                short: repo.name,
              };
            });
          },
          pageSize: 10,
        },
        {
          type: 'confirm',
          name: 'validate',
          message(session) {
            return `Are you sur to delete \n ${redent(chalk.reset(session.repos.map(path => ` - ${ path }`).join('\n')))}`
          },
        },
      ]);

      if (!answer.validate) {
        process.stdout.write(chalk`{cyan You didn\'t confirm try again :)}`);
        return process.exit(0);
      }

      if (answer.repos.length <= 1) {
        await http.delete(`repos/${config.name}/${answer.repos[0]}`, {
          headers: {
            'User-Agent': config.name,
            Authorization: `token ${config.token}`,
          },
        });
      } else {
        await Promise.all(
          answer.repos.map(
            async (repo) =>
              await http.delete(`repos/${config.name}/${repo}`, {
                headers: {
                  'User-Agent': config.name,
                  Authorization: `token ${config.token}`,
                },
              })
          )
        );
      }

      return process.stdout.write(chalk`{green Del command successfully complete :)}`);
    } catch (error) {
      process.stderr.write(chalk`{bgRed ${error.message}}`);
      return process.exit(-1);
    }
  },
};
