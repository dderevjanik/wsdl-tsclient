import test from "tape";
import { existsSync } from "fs";
import { parseAndGenerate } from "../src";
import { Logger } from "../src/utils/logger";

test("cross_schema", async t => {
    Logger.disabled();

    const input = "./test/resources/cross_schema.wsdl";
    const outdir = "./test/generated";

    t.test("generate wsdl client", async t => {
        await parseAndGenerate(input, outdir);
        t.end();
    });

    t.test("check definitions", async t => {
        t.equal(existsSync(`${outdir}/crossschema/definitions/OperationResponse.ts`), true);
        t.equal(existsSync(`${outdir}/crossschema/definitions/OperationReturn.ts`), true);
        t.end();
    });
});