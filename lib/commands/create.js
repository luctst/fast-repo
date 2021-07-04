import chalk from "chalk";

const data = {
    helper: chalk`
        Usage: create: [options]        parse your json file and create folder

        Options:
        -j, --name <pathToJsonFile> Json file path
        -p, --path  <pathName>          the path to create the folder
    `,
    options: {
        name: {
            type: 'string',
            alias: 'n',
            isRequired: true
        },
        path: {
            type: "string",
            alias: "p",
            default: process.cwd(),
        }
    }
};
async function start() {};

export default {
    data,
    start
}