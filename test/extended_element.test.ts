import test from "tape";
import { existsSync } from "fs";
import { parseAndGenerate } from "../src";
import { Logger } from "../src/utils/logger";

test("extended_element", async t => {
    Logger.disabled();

    const input = "./test/resources/extended_element.wsdl";
    const outdir = "./test/generated";

    t.test("generate wsdl client", async t => {
        await parseAndGenerate(input, outdir);
        t.end();
    });

    t.test("check definitions", async t => {
        t.equal(existsSync(`${outdir}/extendedelement/definitions/DummyList.ts`), true);
        t.equal(existsSync(`${outdir}/extendedelement/definitions/DummyRequest.ts`), true);
        t.equal(existsSync(`${outdir}/extendedelement/definitions/DummyResponse.ts`), true);
        t.equal(existsSync(`${outdir}/extendedelement/definitions/DummyResult.ts`), true);
        t.equal(existsSync(`${outdir}/extendedelement/definitions/ExtendedDummyRequest.ts`), true);
        t.end();
    });
});