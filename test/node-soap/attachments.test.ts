import test from "tape";
import { existsSync } from "fs";
import { parseAndGenerate } from "../../src";
import { Logger } from "../../src/utils/logger";

test("attachments", async t => {
    Logger.disabled();

    const input = "./test/resources/attachments.wsdl";
    const outdir = "./test/generated";

    t.test("generate wsdl client", async t => {
        await parseAndGenerate(input, outdir);
        t.end();
    });

    t.test("check definitions", async t => {
        t.equal(existsSync(`${outdir}/attachments/definitions/Request.ts`), true);
        t.end();
    });

});