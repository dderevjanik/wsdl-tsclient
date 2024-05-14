import util from "util";

const exec = util.promisify(require("child_process").exec);

export async function typecheck(pathToIndex: string) {
    const cmd = `tsc ${pathToIndex} --noEmit`;
    await exec(cmd, {
        env: process.env,
    });
}
