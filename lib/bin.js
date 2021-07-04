#!/usr/bin/env node
import meow from "meow";
import chalk from "chalk";
import { promises } from "fs";
import { dirname } from "path";
import { fileURLToPath } from "url";

import commandsManager from './pipe/commands.js';

(async function main () {
    try {
        let commandUnknown = false;
        let flags = {};
        const opsKeys = Object.keys(commandsManager);
        const commands = (
            await promises.readdir(`${dirname(fileURLToPath(import.meta.url))}/commands`)
        ).map((command) => command.split(".")[0]);
    } catch (error) {
        process.stderr.write(chalk`{bgRed ${error.message}}`);
        return process.exit(-1);
    }
})()