import test from "tape";
import { existsSync } from "fs";
import { parseAndGenerate } from "../src";
import { Logger } from "../src/utils/logger";

test("include_with_duplicated_namespace", async t => {
    Logger.disabled();

    const input = "./test/resources/include_with_duplicated_namespace.wsdl";
    const outdir = "./test/generated";

    t.test("generate wsdl client", async t => {
        await parseAndGenerate(input, outdir);
        t.end();
    });

    t.test("check definitions", async t => {
        t.equal(existsSync(`${outdir}/includewithduplicatednamespace/definitions/DummyList.ts`), true);
        t.equal(existsSync(`${outdir}/includewithduplicatednamespace/definitions/DummyResponse.ts`), true);
        t.equal(existsSync(`${outdir}/includewithduplicatednamespace/definitions/DummyResult.ts`), true);
        t.equal(existsSync(`${outdir}/includewithduplicatednamespace/definitions/ExtendedDummyRequest.ts`), true);
        t.end();
    });
});