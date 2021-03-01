#!/usr/bin/env node

import yargs from "yargs-parser";
import path from "path";
import { generateClient } from "./index";
import packageJson from "../package.json";

type Config = {
    _: any[];
    h?: boolean;
    help?: boolean;
    i?: string;
    o?: string;
};

const conf: Config = yargs(process.argv.slice(2)) as any;
if (conf.h || conf.help) {
    process.stdout.write(`Version: ${packageJson.version}\n`);
    process.stdout.write("Usage: wsdl-tsclient WSDL_PATH -o OUT_DIR\n");
    process.stdout.write("\n");
    process.stdout.write("Example: wsdl-tsclient file.wsdl -o ./generator/client\n");
    process.stdout.write("\n");
    process.stdout.write("\tWSDL_PATH\tpath to your wsdl file\n");
    process.stdout.write("\t-o\toutput dir\n");
    // TODO: Finish --js
    process.exit(0);
}

if (conf._ === undefined || conf._.length === 0) {
    console.error('You forget to pass path to wsdl file');
    process.exit(1);
}

if (conf.o === undefined || conf.o.length === 0) {
    console.error('You forget to pass path to output directory -o');
    process.exit(1);
} else {
    const wsdlPath = path.resolve(conf.i);
    const outDir = path.resolve(conf.o);
    generateClient(wsdlPath, outDir)
        .then(() => process.exit(0))
        .catch((err) => {
            console.error(err);
            process.exit(1);
        });
}