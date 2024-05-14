import util from "util";

const exec = util.promisify(require("child_process").exec);

export async function typecheck(pathToIndex: string) {
    await exec(`tsc ${pathToIndex} --noEmit`, {
        env: process.env,
    });
}
