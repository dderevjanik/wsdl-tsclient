import test from "tape";
import { existsSync } from "fs";
import { parseAndGenerate } from "../src";
import { Logger } from "../src/utils/logger";

test("binding-exception", async suite => {
    Logger.disabled();

    const input = "./test/resources/binding-exception.wsdl";
    const outdir = "./test/generated";

    test("generate wsdl client", async t => {
        await parseAndGenerate(input, outdir);
        t.end();
    });

    suite.end();
});