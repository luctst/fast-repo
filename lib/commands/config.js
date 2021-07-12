import chalk from "chalk";
import inquirer from "inquirer";
import checkConfig from "../utils/checkConfig.js";

export default {
  data: {
    helper: chalk`
            Usage: config [options]

            Inspect and modify config, if no flag is passed --create will be called by default

            Options:
            -c, --create    Start process to create fast-repo config folder.
            -u, --update    Start process to update fast-repo config.
        `,
    options: {
      create: {
        type: "boolean",
        alias: "c",
        default: true,
      },
      update: {
        type: "boolean",
        alias: "u",
      },
    },
  },
  async start(flags) {
    const flgs = Object.keys(this.data.options);
    const configExist = checkConfig();

    if (configExist) {
    }
  },
};
