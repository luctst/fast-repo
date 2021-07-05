import { homedir } from "os";
import { resolve } from "path";
import { promises, constants } from "fs";

export default async function checkConfig() {
  await promises.access(resolve(homedir(), "fast-repo"), constants.F_OK | constants.W_OK);
}
