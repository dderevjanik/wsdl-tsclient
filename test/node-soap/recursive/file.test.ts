import test from "tape";
import { existsSync } from "fs";
import { parseAndGenerate } from "../../../src";
import { Logger } from "../../../src/utils/logger";

test("recursive/file", async t => {
    Logger.disabled();

    const input = "./test/resources/elementref/foo.wsdl";
    const outdir = "./test/generated/elementref";

    t.test("generate wsdl client", async t => {
        await parseAndGenerate(input, outdir);
        t.end();
    });

    t.test("check definitions", async t => {
        t.equal(existsSync(`${outdir}/foo/definitions/BankSvcRq.ts`), true);
        t.equal(existsSync(`${outdir}/foo/definitions/BankSvcRs.ts`), true);
        t.equal(existsSync(`${outdir}/foo/definitions/FooRq.ts`), true);
        t.equal(existsSync(`${outdir}/foo/definitions/FooRs.ts`), true);
        t.equal(existsSync(`${outdir}/foo/definitions/PaymentRq.ts`), true);
        t.equal(existsSync(`${outdir}/foo/definitions/PaymentRs.ts`), true);
        t.end();
    });

});