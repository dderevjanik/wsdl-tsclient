import { parseWsdl } from "./parser";
import { generate } from "./generator";
import { timeElapsed } from "./utils/timer";
import { Logger } from "./utils/logger";

export { generate } from "./generator";
export { parseWsdl } from "./parser";

export async function parseAndGenerate(wsdlPath: string, outDir: string): Promise<void> {
    const timeParseStart = process.hrtime();
    const parsedWsdl = await parseWsdl(wsdlPath);
    Logger.debug(`Parser time: ${timeElapsed(process.hrtime(timeParseStart))}ms`);

    const timeGenerateStart = process.hrtime();
    await generate(parsedWsdl, outDir);
    Logger.debug(`Generator time: ${timeElapsed(process.hrtime(timeGenerateStart))}ms`);

    Logger.info(`Generating finished: ${timeElapsed(process.hrtime(timeParseStart))}ms`);
}