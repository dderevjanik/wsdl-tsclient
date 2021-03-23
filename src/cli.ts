#!/usr/bin/env node
import yargs, { describe } from "yargs";
import path from "path";
import { Logger } from "./utils/logger";
import { parseAndGenerate, Options } from "./index";
import packageJson from "../package.json";

type Config = {
    _: any[];
    h?: boolean;
    help?: boolean;
    o?: string;
    v?: boolean;
    version?: boolean;
    "no-color"?: boolean;
    quiet?: boolean;
    verbose?: boolean;
    emitDefinitionsOnly?: boolean;
    modelNamePrefix?: string;
    modelNameSuffix?: string;
};

const conf = yargs(process.argv.slice(2))
    .version(packageJson.version)
    .usage("wsdl-tsclient [options] [path]")
    .example("", "wsdl-tsclient file.wsdl -o ./generated/")
    .example("", "wsdl-tsclient ./res/**/*.wsdl -o ./generated/")
    .demandOption(["o"])
    .positional("source", {
        type: "string"
    })
    .option("o", {
        type: "string",
        description: "Output dir"
    })
    .option("version", {
        alias: "v",
        type: "boolean"
    })
    .option("emitDefinitionsOnly", {
        type: "boolean",
        description: "Generate only Definitions"
    })
    .option("modelNamePreffix", {
        type: "string",
    })
    .option("modelNameSuffix", {
        type: "string"
    })
    .option("quiet", {
        type: "boolean",
        description: "Suppress logs"
    })
    .option("verbose", {
        type: "boolean",
        description: "Print verbose logs"
    })
    .option("no-color", {
        type: "boolean",
        description: "Logs without colors"
    })
    .argv;

if (conf.v || conf.version) {
    Logger.log(`${packageJson.version}\n`);
    process.exit(0);
}

//

if (conf["no-color"]) {
    Logger.colors = false;
}

if (conf.verbose) {
    Logger.isDebug = true;
}

if (conf.quiet) {
    Logger.isDebug = false;
    Logger.isInfo = false;
    Logger.isError = false;
}

//

const options: Partial<Options> = {};

if (conf.emitDefinitionsOnly) {
    options.emitDefinitionsOnly = true;
}

if (conf.modelNamePrefix) {
    options.modelNamePreffix = conf.modelNamePreffix;
}

if (conf.modelNameSuffix) {
    options.modelNameSuffix = conf.modelNameSuffix;
}

//

if (conf._ === undefined || conf._.length === 0) {
    Logger.error("Node wsdl files found");
    Logger.debug(`Path: ${conf._}`);
    process.exit(1);
}

(async function () {
    if (conf.o === undefined || conf.o.length === 0) {
        Logger.error("You forget to pass path to Output directory -o");
        process.exit(1);
    } else {
        const outDir = path.resolve(conf.o);

        let errorOccured = false;
        const matches = conf._;

        // if (matches.length > 1) {
        //     Logger.debug(matches.map((m) => path.resolve(m)).join("\n"));
        //     Logger.log(`Found ${matches.length} wsdl files`);
        // }
        // for (const match of matches) {
        //     const wsdlPath = path.resolve(match);
        //     const wsdlName = path.basename(wsdlPath);
        //     Logger.log(`Generating soap client from "${wsdlName}"`);
        //     try {
        //         await parseAndGenerate(wsdlPath, path.join(outDir), options);
        //     } catch (err) {
        //         Logger.error(`Error occured while generating client "${wsdlName}"`);
        //         Logger.error(`\t${err}`);
        //         errorOccured = true;
        //     }
        // }
        // if (errorOccured) {
        //     process.exit(1);
        // }
    }
})();
