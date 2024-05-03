import test from "tape";
import { existsSync } from "fs";
import { parseAndGenerate } from "../../../src";
import { Logger } from "../../../src/utils/logger";
import { typecheck } from "../../utils/tsc";

const target = "recursive/B";

test(target, async (t) => {
    Logger.disabled();

    const input = `./test/resources/${target}.xsd`;
    const outdir = "./test/generated/recursive";

    t.test(`${target} - generate wsdl client`, async (t) => {
        await parseAndGenerate(input, outdir);
        t.end();
    });

    // t.test(`${target} - check definitions`, async t => {
    //     t.equal(existsSync(`${outdir}/B/definitions/BankSvcRq.ts`), true);
    //     t.equal(existsSync(`${outdir}/B/definitions/BankSvcRs.ts`), true);
    //     t.equal(existsSync(`${outdir}/B/definitions/BRq.ts`), true);
    //     t.equal(existsSync(`${outdir}/B/definitions/BRs.ts`), true);
    //     t.equal(existsSync(`${outdir}/B/definitions/PaymentRq.ts`), true);
    //     t.equal(existsSync(`${outdir}/B/definitions/PaymentRs.ts`), true);
    //     t.end();
    // });

    t.test(`${target} - compile`, async (t) => {
        await typecheck(`${outdir}/b/index.ts`);
        t.end();
    });
});
