import test from "tape";
import { existsSync } from "fs";
import { parseAndGenerate } from "../../../src";
import { Logger } from "../../../src/utils/logger";

test("elementref/bar", async t => {
    Logger.disabled();

    const input = "./test/resources/elementref/bar.xsd";
    const outdir = "./test/generated/elementref";

    t.test("generate wsdl client", async t => {
        await parseAndGenerate(input, outdir);
        t.end();
    });
});