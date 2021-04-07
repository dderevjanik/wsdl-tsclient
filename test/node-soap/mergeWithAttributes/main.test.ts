import test from "tape";
import { existsSync } from "fs";
import { parseAndGenerate } from "../../../src";
import { Logger } from "../../../src/utils/logger";

test("mergeWithAttributes/main", async t => {
    Logger.disabled();

    const input = "./test/resources/mergeWithAttributes/main.wsdl";
    const outdir = "./test/generated/mergeWithAttributes";

    t.test("generate wsdl client", async t => {
        await parseAndGenerate(input, outdir);
        t.end();
    });

    t.test("check definitions", async t => {
        t.equal(existsSync(`${outdir}/main/definitions/AskPeat.ts`), true);
        t.equal(existsSync(`${outdir}/main/definitions/AskPeatResponse.ts`), true);
        t.end();
    });

});