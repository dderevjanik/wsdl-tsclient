import test from "tape";
import { existsSync } from "fs";
import { parseAndGenerate } from "../../src";
import { Logger } from "../../src/utils/logger";

test("ws-policy", async t => {
    Logger.disabled();

    const input = "./test/resources/ws-policy.wsdl";
    const outdir = "./test/generated";

    t.test("generate wsdl client", async t => {
        await parseAndGenerate(input, outdir);
        t.end();
    });

    t.test("check definitions", async t => {
        t.equal(existsSync(`${outdir}/wspolicy/definitions/DummyList.ts`), true);
        t.equal(existsSync(`${outdir}/wspolicy/definitions/DummyRequest.ts`), true);
        t.equal(existsSync(`${outdir}/wspolicy/definitions/DummyResponse.ts`), true);
        t.equal(existsSync(`${outdir}/wspolicy/definitions/DummyResult.ts`), true);
        t.end();
    });
});