import chalk from "chalk";
import redent from "redent";
import trimNewlines from "trim-newlines";
import { homedir } from "os";
import { resolve } from "path";
import { promises, createWriteStream } from "fs";
import inquirer from "inquirer";

import macros from '../pipe/macros.js';
import checkConfig from "../utils/checkConfig.js";

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
        type: "boolean",
        alias: "c",
      },
      update: {
        type: "boolean",
        alias: "u",
      },
    },
  },
  async start(flags) {
    if (!Object.keys(flags).length) return this.showHelpMessage("Missing flags");

    const configExist = await checkConfig();

    if (configExist) {
      if (flags.create)
        return this.showHelpMessage(
          "configuration already been created try with the --update flag"
        );
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
            type: "input",
            name: "token",
            message: "Enter token API",
            validate(value) {
              if (!value.length) return false;
              return true;
            },
          },
        ]);

        return createWriteStream(`${folderToCreate}/${macros.configFile}`)
          .on("error", function (error) {
            process.stderr.write(chalk`{red ${error.message}}`);
            return process.exit(-1);
          })
          .write(`token=${answer.token}`, "utf-8", function (err) {
            if (err) {
              process.stderr.write(chalk`{red ${error.message}}`);
              return process.exit(-1);
            }

            process.stdout.write(
              redent(
                chalk`{green Config well created 👌}`
              )
            );
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
          chalk`${(this.data.helper || "").replace(/\t+\n*$/, "")}
          {red ${additionalMessage}}`
        ),
        2
      )
    );
    return process.exit(0);
  },
};
