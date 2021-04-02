import test from "tape";
import { existsSync } from "fs";
import { parseAndGenerate } from "../src";
import { Logger } from "../src/utils/logger";

test("default_namespace_soap12", async t => {
    Logger.disabled();

    const input = "./test/resources/default_namespace_soap12.wsdl";
    const outdir = "./test/generated";

    t.test("generate wsdl client", async t => {
        await parseAndGenerate(input, outdir);
        t.end();
    });

    t.test("check definitions", async t => {
        t.equal(existsSync(`${outdir}/defaultnamespacesoap12/definitions/Request.ts`), true);
        t.equal(existsSync(`${outdir}/defaultnamespacesoap12/definitions/Response.ts`), true);
        t.end();
    });
});