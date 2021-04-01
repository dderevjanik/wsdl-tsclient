import test from "tape";
import { existsSync } from "fs";
import { parseAndGenerate } from "../src";
import { Logger } from "../src/utils/logger";

test("attachments", async suite => {
    Logger.disabled();

    const input = "./test/resources/attachments.wsdl";
    const outdir = "./test/generated";

    test("generate wsdl client", async t => {
        await parseAndGenerate(input, outdir);
        t.end();
    });

    test("check definitions", async t => {
        t.equal(existsSync(`${outdir}/attachments/definitions/Request.ts`), true);
        t.end();
    });

    suite.end();
});