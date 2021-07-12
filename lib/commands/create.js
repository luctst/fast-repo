import chalk from "chalk";
import checkConfig from "../utils/checkConfig.js";

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
      type: "string",
      alias: "n",
      isRequired(flag, input) {
        if (input.includes("create") && !flag.help) {
          return true;
        }

        return false;
      },
    },
    path: {
      type: "string",
      alias: "p",
      default: process.cwd(),
    },
  },
};
async function start() {
}

export default {
  data,
  start,
};
