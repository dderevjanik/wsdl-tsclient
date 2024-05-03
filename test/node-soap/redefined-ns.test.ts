import test from "tape";
import { existsSync } from "fs";
import { parseAndGenerate } from "../../src";
import { Logger } from "../../src/utils/logger";
import { typecheck } from "../utils/tsc";

const target = "redefined-ns";

test(target, async (t) => {
    Logger.disabled();

    const input = `./test/resources/${target}.wsdl`;
    const outdir = "./test/generated";

    t.test(`${target} - generate wsdl client`, async (t) => {
        await parseAndGenerate(input, outdir);
        t.end();
    });

    t.test(`${target} - check definitions`, async (t) => {
        t.equal(existsSync(`${outdir}/redefinedns/definitions/VerificationData.ts`), true);
        t.equal(existsSync(`${outdir}/redefinedns/definitions/VerificationRequest.ts`), true);
        t.equal(existsSync(`${outdir}/redefinedns/definitions/Verify.ts`), true);
        t.equal(existsSync(`${outdir}/redefinedns/definitions/VerifyResponse.ts`), true);
        t.equal(existsSync(`${outdir}/redefinedns/definitions/VerifyResult.ts`), true);
        t.end();
    });

    t.test(`${target} - compile`, async (t) => {
        await typecheck(`${outdir}/redefinedns/index.ts`);
        t.end();
    });
});
