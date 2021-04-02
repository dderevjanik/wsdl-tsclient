import test from "tape";
import { existsSync } from "fs";
import { parseAndGenerate } from "../../src";
import { Logger } from "../../src/utils/logger";

test("typeof_null_extend_check", async t => {
    Logger.disabled();

    const input = "./test/resources/typeof_null_extend_check.wsdl";
    const outdir = "./test/generated";

    t.test("generate wsdl client", async t => {
        await parseAndGenerate(input, outdir);
        t.end();
    });

    t.test("check definitions", async t => {
        t.equal(existsSync(`${outdir}/typeofnullextendcheck/definitions/QaSearch.ts`), true);
        t.equal(existsSync(`${outdir}/typeofnullextendcheck/definitions/QaSearchResult.ts`), true);
        t.end();
    });
});