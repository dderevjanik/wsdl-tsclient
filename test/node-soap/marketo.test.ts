import test from "tape";
import { existsSync } from "fs";
import { parseAndGenerate } from "../../src";
import { Logger } from "../../src/utils/logger";

test("marketo", async t => {
    Logger.disabled();

    const input = "./test/resources/marketo.wsdl";
    const outdir = "./test/generated";

    t.test("generate wsdl client", async t => {
        await parseAndGenerate(input, outdir);
        t.end();
    });

    t.test("check definitions", async t => {
        t.equal(existsSync(`${outdir}/marketo/definitions/ActivityNameFilter.ts`), true);
        t.equal(existsSync(`${outdir}/marketo/definitions/TnsparamsGetLeadChanges.ts`), true);
        t.equal(existsSync(`${outdir}/marketo/definitions/TnssuccessGetLeadChanges.ts`), true);
        t.end();
    });
});