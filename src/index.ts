import path from "path";
import { parseWsdl } from "./parser";
import { generate } from "./generator";
import { timeElapsed } from "./utils/timer";
import { Logger } from "./utils/logger";

export { generate } from "./generator";
export { parseWsdl } from "./parser";

export interface Options {
    emitDefinitionsOnly: boolean;
    modelNamePreffix: string;
    modelNameSuffix: string;
}

export const defaultOptions: Options = {
    emitDefinitionsOnly: false,
    modelNamePreffix: "",
    modelNameSuffix: "",
};

export async function parseAndGenerate(
    wsdlPath: string,
    outDir: string,
    options: Partial<Options> = {}
): Promise<void> {
    const mergedOptions: Options = {
        ...defaultOptions,
        ...options,
    };
    // Logger.debug(`Options: ${JSON.stringify(mergedOptions, null, 2)}`);

    const timeParseStart = process.hrtime();
    const parsedWsdl = await parseWsdl(wsdlPath, mergedOptions);
    Logger.debug(`Parser time: ${timeElapsed(process.hrtime(timeParseStart))}ms`);

    const timeGenerateStart = process.hrtime();
    await generate(parsedWsdl, path.join(outDir, parsedWsdl.name.toLowerCase()), mergedOptions);
    Logger.debug(`Generator time: ${timeElapsed(process.hrtime(timeGenerateStart))}ms`);

    Logger.info(`Generating finished: ${timeElapsed(process.hrtime(timeParseStart))}ms`);
}
