import test from "tape";
import { existsSync } from "fs";
import { parseAndGenerate } from "../src";
import { Logger } from "../src/utils/logger";

test("Dummy", async t => {
    Logger.disabled();

    const input = "./test/resources/Dummy.wsdl";
    const outdir = "./test/generated";

    t.test("generate wsdl client", async t => {
        await parseAndGenerate(input, outdir);
        t.end();
    });

    t.test("check definitions", async t => {
        t.equal(existsSync(`${outdir}/dummy/definitions/DummyList.ts`), true);
        t.equal(existsSync(`${outdir}/dummy/definitions/DummyRequest.ts`), true);
        t.equal(existsSync(`${outdir}/dummy/definitions/DummyResponse.ts`), true);
        t.equal(existsSync(`${outdir}/dummy/definitions/DummyResult.ts`), true);
        t.end();
    });
});