import util from "util";

const exec = util.promisify(require('child_process').exec);
const pathToTsc = `./node_modules/.bin/tsc`;

export async function typecheck(pathToIndex: string) {
    await exec(`${pathToTsc} ${pathToIndex} --noEmit`);
}
