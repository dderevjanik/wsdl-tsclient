import test from "tape";
import { existsSync } from "fs";
import { parseAndGenerate } from "../../../src";
import { Logger } from "../../../src/utils/logger";
import { typecheck } from "../../utils/tsc";

const target = "recursive/file";

test(target, async (t) => {
    Logger.disabled();

    const input = `./test/resources/${target}.wsdl`;
    const outdir = "./test/generated/elementref";

    t.test(`${target} - generate wsdl client`, async (t) => {
        await parseAndGenerate(input, outdir);
        t.end();
    });

    t.test(`${target} - check definitions`, async (t) => {
        t.equal(existsSync(`${outdir}/foo/definitions/BankSvcRq.ts`), true);
        t.equal(existsSync(`${outdir}/foo/definitions/BankSvcRs.ts`), true);
        t.equal(existsSync(`${outdir}/foo/definitions/FooRq.ts`), true);
        t.equal(existsSync(`${outdir}/foo/definitions/FooRs.ts`), true);
        t.equal(existsSync(`${outdir}/foo/definitions/PaymentRq.ts`), true);
        t.equal(existsSync(`${outdir}/foo/definitions/PaymentRs.ts`), true);
        t.end();
    });

    t.test(`${target} - compile`, async (t) => {
        await typecheck(`${outdir}/file/index.ts`);
        t.end();
    });
});
