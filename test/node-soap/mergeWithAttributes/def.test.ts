import test from "tape";
import { existsSync } from "fs";
import { parseAndGenerate } from "../../../src";
import { Logger } from "../../../src/utils/logger";

test("mergeWithAttributes/def", async t => {
    Logger.disabled();

    const input = "./test/resources/mergeWithAttributes/def.xsd";
    const outdir = "./test/generated/mergeWithAttributes";

    t.test("generate wsdl client", async t => {
        await parseAndGenerate(input, outdir);
        t.end();
    });

});