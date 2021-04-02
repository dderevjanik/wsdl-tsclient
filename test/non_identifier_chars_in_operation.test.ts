import test from "tape";
import { existsSync } from "fs";
import { parseAndGenerate } from "../src";
import { Logger } from "../src/utils/logger";

test("non_identifier_chars_in_operation", async t => {
    Logger.disabled();

    const input = "./test/resources/non_identifier_chars_in_operation.wsdl";
    const outdir = "./test/generated";

    t.test("generate wsdl client", async t => {
        await parseAndGenerate(input, outdir);
        t.end();
    });

    t.test("check definitions", async t => {
        t.equal(existsSync(`${outdir}/nonidentifiercharsinoperation/definitions/Request.ts`), true);
        t.equal(existsSync(`${outdir}/nonidentifiercharsinoperation/definitions/Response.ts`), true);
        t.end();
    });
});