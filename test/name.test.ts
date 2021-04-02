import test from "tape";
import { existsSync } from "fs";
import { parseAndGenerate } from "../src";
import { Logger } from "../src/utils/logger";

test("Name", async t => {
    Logger.disabled();

    const input = "./test/resources/Name.xsd";
    const outdir = "./test/generated";

    t.test("generate wsdl client", async t => {
        await parseAndGenerate(input, outdir);
        t.end();
    });
});