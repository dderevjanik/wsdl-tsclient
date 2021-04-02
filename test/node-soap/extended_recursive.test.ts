import test from "tape";
import { existsSync } from "fs";
import { parseAndGenerate } from "../../src";
import { Logger } from "../../src/utils/logger";

test("extended_recursive", async t => {
    Logger.disabled();

    const input = "./test/resources/extended_recursive.wsdl";
    const outdir = "./test/generated";

    t.test("generate wsdl client", async t => {
        await parseAndGenerate(input, outdir);
        t.end();
    });

    t.test("check definitions", async t => {
        t.equal(existsSync(`${outdir}/extendedrecursive/definitions/Department.ts`), true);
        t.equal(existsSync(`${outdir}/extendedrecursive/definitions/GetPerson.ts`), true);
        t.equal(existsSync(`${outdir}/extendedrecursive/definitions/GetPersonResponse.ts`), true);
        t.equal(existsSync(`${outdir}/extendedrecursive/definitions/GetPersonResult.ts`), true);
        t.end();
    });
});