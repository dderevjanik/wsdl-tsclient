import path from "path";
import { parseWsdl } from "./parser";
import { generate } from "./generator";
import { timeElapsed } from "./utils/timer";
import { Logger } from "./utils/logger";

export { generate } from "./generator";
export { parseWsdl } from "./parser";

export enum ModelPropertyNaming {
    "camelCase" = "camelCase",
    "PascalCase" = "PascalCase",
}
export interface Options {
    /**
     * Generate only Definitions
     * @default false
     */
    emitDefinitionsOnly: boolean;
    /**
     * Prefix for generated interface names
     * @default ""
     */
    modelNamePreffix: string;
    /**
     * Suffix for generated interface names
     * @default ""
     */
    modelNameSuffix: string;
    /**
     * Case-insensitive name while parsing definition names
     * @default false
     */
    caseInsensitiveNames: boolean;
    /**
     * Maximum count of definition's with same name but increased suffix. Will throw an error if exceed
     * @default 64
     */
    maxRecursiveDefinitionName: number;
    modelPropertyNaming: ModelPropertyNaming;
    /**
     * Print verbose logs
     * @default false
     */
    verbose: boolean;
    /**
     * Suppress all logs
     * @default false
     */
    quiet: boolean;
    /**
     * Logs with colors
     * @default true
     */
    colors: boolean;
}

export const defaultOptions: Options = {
    emitDefinitionsOnly: false,
    modelNamePreffix: "",
    modelNameSuffix: "",
    caseInsensitiveNames: false,
    maxRecursiveDefinitionName: 64,
    modelPropertyNaming: null,
    //
    verbose: false,
    quiet: false,
    colors: true,
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

    if (options.verbose) {
        Logger.isDebug = true;
    }
    if (options.colors === false) {
        Logger.colors = false;
    }
    if (options.quiet) {
        Logger.isDebug = false;
        Logger.isLog = false;
        Logger.isInfo = false;
        Logger.isWarn = false;
        Logger.isError = false;
    }

    // Logger.debug(`Options: ${JSON.stringify(mergedOptions, null, 2)}`);

    const timeParseStart = process.hrtime();
    const parsedWsdl = await parseWsdl(wsdlPath, mergedOptions);
    Logger.debug(`Parser time: ${timeElapsed(process.hrtime(timeParseStart))}ms`);

    const timeGenerateStart = process.hrtime();
    await generate(parsedWsdl, path.join(outDir, parsedWsdl.name.toLowerCase()), mergedOptions);
    Logger.debug(`Generator time: ${timeElapsed(process.hrtime(timeGenerateStart))}ms`);

    Logger.info(`Generating finished: ${timeElapsed(process.hrtime(timeParseStart))}ms`);
}
