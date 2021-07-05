#!/usr/bin/env node
import meow from "meow";
import chalk from "chalk";
import { promises } from "fs";
import { dirname, basename } from "path";
import { fileURLToPath } from "url";
import trimNewlines from "trim-newlines";
import redent from "redent";

import commandsManager from "./pipe/commands.js";

(async function main() {
  try {
    let commandUnknown = false;
    let flags = {};
    const opsKeys = Object.keys(commandsManager);
    const commands = (
      await promises.readdir(`${dirname(fileURLToPath(import.meta.url))}/commands`)
    ).map((command) => command.split(".")[0]);

    process.argv.slice(2).forEach((argv) => {
      if (opsKeys.includes(argv)) {
        flags = {
          ...flags,
          ...commandsManager[argv].data.options,
        };
      }
    });

    const cli = meow(
      chalk`
        Usage: fast-repo <command> [options]
    
        Options:
            -v, --version       output the version number
            -h, --help          output usage information
        
        Commands:
            create [options]    Init github repo and folder
        
        Run {cyan fast-repo <command> --help} for detailed usage of given command.
        `,
      {
        importMeta: import.meta,
        booleanDefault: undefined,
        flags,
      }
    );

    if (cli.input.length === 0) return cli.showHelp(0);

    cli.input.forEach((command) => {
      if (!commands.includes(command)) {
        commandUnknown = true;
        return true;
      }

      return false;
    });

    if (commandUnknown) {
      return process.stderr.write(
        chalk`${cli.help}   {red Unknown command {yellow ${cli.input.join(", ")}}}`
      );
    }

    if (cli.flags.help) {
      process.stderr.write(
        redent(
          trimNewlines(
            (commandsManager[cli.input[0]].data.helper || "").replace(/\t+\n*$/, "")
          ),
          2
        )
      );
      return process.exit(0);
    }

    return await commandsManager[cli.input[0]].start(cli.flags);
  } catch (error) {
    if (error.syscall === "access" && basename(error.path) === "fast-repo") {
      process.stderr.write(
        redent(
          chalk`
                    {bgRed ${error.message}}

                    Run {cyan fast-repo config --create} for create config presets.
                    `
        )
      );
    } else {
      process.stderr.write(chalk`{bgRed ${error.message}}`);
    }

    return process.exit(-1);
  }
})();
