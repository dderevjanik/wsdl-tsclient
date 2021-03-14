#!/usr/bin/env node
import camelCase from "camelcase";
import yargs from "yargs-parser";
import path from "path";
import glob from "glob";
import { Logger } from "./utils/logger";
import { generateClient, parseAndGenerate } from "./index";
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
    process.stdout.write("\t-h, --help\tPrint this message\n");
    process.stdout.write("\t-v, --version\tPrint version\n");
    process.stdout.write("\t-o\t\tOutput dir\n");
    process.stdout.write("\t--no-color\t");
    process.stdout.write("\t--quiet\tSuppress logs");
    process.stdout.write("\t--verbose\tPrint verbose logs");
    // TODO: Finish --js
    process.exit(0);
}

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

if (conf.v || conf.version) {
    Logger.log(`${packageJson.version}\n`);
    process.exit(0);
}

if (conf._ === undefined || conf._.length === 0) {
    Logger.error("You forget to pass Path to wsdl file");
    process.exit(1);
}

(async function () {
    if (conf.o === undefined || conf.o.length === 0) {
        Logger.error("You forget to Pass path to output directory -o");
        process.exit(1);
    } else {
        const outDir = path.resolve(conf.o);

        let errorOccured = false;
        glob(conf._[0], async (err, matches) => {
            if (err) {
                console.error(err);
                process.exit(1);
            }
            for (const match of matches) {
                const wsdlPath = path.resolve(match);
                const wsdlName = path.basename(wsdlPath);
                Logger.log(`Generating soap client from "${wsdlName}"`);
                try {
                    await parseAndGenerate(wsdlPath, path.join(outDir));
                } catch(err) {
                    Logger.error(`Error occured while generating client "${wsdlName}"`);
                    Logger.error(err);
                    errorOccured = true;
                }
            }
        });
        if (errorOccured) {
            process.exit(1);
        }
    }
})();