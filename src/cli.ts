#!/usr/bin/env node
import yargs from "yargs";
import path from "path";
import { Logger } from "./utils/logger";
import { parseAndGenerate, Options } from "./index";
import glob from 'glob';
import packageJson from "../package.json";
import { promisify } from "util";

const conf = yargs(process.argv.slice(2))
    .version(packageJson.version)
    .usage("wsdl-tsclient [options] [path]")
    .example("", "wsdl-tsclient file.wsdl -o ./generated/")
    .example("", "wsdl-tsclient ./res/**/*.wsdl -o ./generated/")
    .demandOption(["o"])
    .option("o", {
        type: "string",
        description: "Output directory",
    })
    .option("version", {
        alias: "v",
        type: "boolean",
    })
    .option("emitDefinitionsOnly", {
        type: "boolean",
        description: "Generate only Definitions",
    })
    .option("modelNamePreffix", {
        type: "string",
        description: "Prefix for generated interface names",
    })
    .option("modelNameSuffix", {
        type: "string",
        description: "Suffix for generated interface names",
    })
    .option("caseInsensitiveNames", {
        type: "boolean",
        description: "Case-insensitive name while parsing definition names",
    })
    .option("maxRecursiveDefinitionName", {
        type: "number",
        description: "Maximum count of definition's with same name but increased suffix. Will throw an error if exceed",
    })
    .option("quiet", {
        type: "boolean",
        description: "Suppress all logs",
    })
    .option("verbose", {
        type: "boolean",
        description: "Print verbose logs",
    })
    .option("no-color", {
        type: "boolean",
        description: "Logs without colors",
    }).argv;

// Logger section

if (conf["no-color"] || process.env.NO_COLOR) {
    Logger.colors = false;
}

if (conf.verbose || process.env.DEBUG) {
    Logger.isDebug = true;
}

if (conf.quiet) {
    Logger.isDebug = false;
    Logger.isLog = false;
    Logger.isInfo = false;
    Logger.isWarn = false;
    Logger.isError = false;
}

// Options override section

const options: Partial<Options> = {};

if (conf["no-color"] || process.env.NO_COLOR) {
    options.colors = false;
}

if (conf.verbose || process.env.DEBUG) {
    options.verbose = true;
}

if (conf.quiet) {
    options.quiet = true;
}

if (conf.emitDefinitionsOnly) {
    options.emitDefinitionsOnly = true;
}

if (conf.modelNamePreffix) {
    options.modelNamePreffix = conf.modelNamePreffix;
}

if (conf.modelNameSuffix) {
    options.modelNameSuffix = conf.modelNameSuffix;
}

if (conf.maxRecursiveDefinitionName || conf.maxRecursiveDefinitionName == 0) {
    options.maxRecursiveDefinitionName = conf.maxRecursiveDefinitionName;
}

if (conf.caseInsensitiveNames) {
    options.caseInsensitiveNames = conf.caseInsensitiveNames;
}

Logger.debug("Options");
Logger.debug(JSON.stringify(options, null, 2));

//

if (conf._ === undefined || conf._.length === 0) {
    Logger.error("No WSDL files found");
    Logger.debug(`Path: ${conf._}`);
    process.exit(1);
}

(async function () {
    if (conf.o === undefined || conf.o.length === 0) {
        Logger.error("You forget to pass path to Output directory -o");
        process.exit(1);
    } else {
        const outDir = path.resolve(conf.o);

        let errorsCount = 0;
        let patterns = conf._ as string[];
        Logger.debug(`patterns: ${patterns}`);
        let matches: string[] = [];
        for (const pattern of patterns) {
          const expanded = await promisify(glob)(pattern);
          matches = matches.concat(expanded);
        }
        if (matches.length > 1) {
            Logger.debug(matches.map((m) => path.resolve(m)).join("\n"));
            Logger.log(`Found ${matches.length} wsdl files`);
        }
        for (const match of matches) {
            const wsdlPath = path.resolve(match);
            const wsdlName = path.basename(wsdlPath);
            Logger.log(`Generating soap client from "${wsdlName}"`);
            try {
                await parseAndGenerate(wsdlPath, path.join(outDir), options);
            } catch (err) {
                Logger.error(`Error occured while generating client "${wsdlName}"`);
                Logger.error(`\t${err}`);
                errorsCount += 1;
            }
        }
        if (errorsCount) {
            Logger.error(`${errorsCount} Errors occured!`);
            process.exit(1);
        }
    }
})();
