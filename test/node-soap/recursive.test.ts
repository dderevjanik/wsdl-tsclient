import test from "tape";
import { existsSync } from "fs";
import { parseAndGenerate } from "../../src";
import { Logger } from "../../src/utils/logger";

test("recursive", async t => {
    Logger.disabled();

    const input = "./test/resources/recursive.wsdl";
    const outdir = "./test/generated";

    t.test("generate wsdl client", async t => {
        // TODO: Fix this issue
        // await parseAndGenerate(input, outdir);
        t.end();
    });

    t.test("check definitions", async t => {
        // t.equal(existsSync(`${outdir}/recursive/definitions/ActivityNameFilter.ts`), true);
        // t.equal(existsSync(`${outdir}/recursive/definitions/TnsparamsGetLeadChanges.ts`), true);
        // t.equal(existsSync(`${outdir}/recursive/definitions/TnssuccessGetLeadChanges.ts`), true);
        // t.end();
    });
});