#!/usr/bin/env node

import camelCase from "camelcase";
import yargs from "yargs-parser";
import path from "path";
import glob from "glob";
import { generateClient } from "./index";
import packageJson from "../package.json";

type Config = {
    _: any[];
    h?: boolean;
    help?: boolean;
    o?: string;
};

const conf: Config = yargs(process.argv.slice(2)) as any;
if (conf.h || conf.help) {
    process.stdout.write(`Version: ${packageJson.version}\n`);
    process.stdout.write("Usage: wsdl-tsclient WSDL_PATH -o OUT_DIR\n");
    process.stdout.write("\n");
    process.stdout.write("Example: wsdl-tsclient file.wsdl -o ./generator/client\n");
    process.stdout.write("\n");
    process.stdout.write("\tWSDL_PATH\tpath to your wsdl file(s)\n");
    process.stdout.write("\t-o\t\toutput dir\n");
    // TODO: Finish --js
    process.exit(0);
}

if (conf._ === undefined || conf._.length === 0) {
    console.error("You forget to pass path to wsdl file");
    process.exit(1);
}

(async function () {
    if (conf.o === undefined || conf.o.length === 0) {
        console.error("You forget to pass path to output directory -o");
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
                const wsdlName = path
                    .basename(wsdlPath) // name of file
                    .split(".").slice(0, -1).join("."); // remove extension
                console.log(`Generating soap client for "${wsdlName}"`);
                try {
                    await generateClient(camelCase(wsdlName), wsdlPath, path.join(outDir, wsdlName));
                } catch(err) {
                    console.error(`Error occured while generating client "${wsdlName}"`);
                    console.error(err);
                    errorOccured = true;
                }
            }
        });
        if (errorOccured) {
            process.exit(1);
        }
    }
})();