#!/usr/bin/env node
import yargs from "yargs-parser";
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
};

const conf: Config = yargs(process.argv.slice(2)) as any;
if (conf.h || conf.help) {
    process.stdout.write(`Version: ${packageJson.version}\n`);
    process.stdout.write("Syntax: wsdl-tsclient [options] [path]\n");
    process.stdout.write("\n");
    process.stdout.write("Example: wsdl-tsclient file.wsdl -o ./generated/\n");
    process.stdout.write("\t wsdl-tsclient ./res/**/*.wsdl -o ./generated/\n");
    process.stdout.write("\n");
    process.stdout.write("Options:\n");
    // process.stdout.write("\tWSDL_PATH\tpath to your wsdl file(s)\n");
    process.stdout.write("\t-o\t\t\tOutput dir\n");
    process.stdout.write("\t-h, --help\t\tPrint this message\n");
    process.stdout.write("\t-v, --version\t\tPrint version\n");
    process.stdout.write("\t--emitDefinitionsOnly\tGenerate only Definitions\n");
    process.stdout.write("\t--quiet\t\t\tSuppress logs\n");
    process.stdout.write("\t--verbose\t\tPrint verbose logs\n");
    process.stdout.write("\t--no-color\t\tLogs without colors\n");
    // TODO: Finish --js
    process.exit(0);
}

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

//

if (conf._ === undefined || conf._.length === 0) {
    Logger.error("You forget to pass Path to wsdl file");
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

        if (matches.length > 1) {
            Logger.debug(matches.map(m => path.resolve(m)).join("\n"));
            Logger.log(`Found ${matches.length} wsdl files`);
        }
        for (const match of matches) {
            const wsdlPath = path.resolve(match);
            const wsdlName = path.basename(wsdlPath);
            Logger.log(`Generating soap client from "${wsdlName}"`);
            try {
                await parseAndGenerate(wsdlPath, path.join(outDir), options);
            } catch(err) {
                Logger.error(`Error occured while generating client "${wsdlName}"`);
                Logger.error(`\t${err}`);
                errorOccured = true;
            }
        }
        if (errorOccured) {
            process.exit(1);
        }
    }
})();