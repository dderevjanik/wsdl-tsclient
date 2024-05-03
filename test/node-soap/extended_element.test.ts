import test from "tape";
import { existsSync } from "fs";
import { parseAndGenerate } from "../../src";
import { Logger } from "../../src/utils/logger";
import { typecheck } from "../utils/tsc";

const target = "extended_element";

test(target, async (t) => {
    Logger.disabled();

    const input = `./test/resources/${target}.wsdl`;
    const outdir = "./test/generated";

    t.test(`${target} - generate wsdl client`, async (t) => {
        await parseAndGenerate(input, outdir);
        t.end();
    });

    t.test(`${target} - check definitions`, async (t) => {
        t.equal(existsSync(`${outdir}/extendedelement/definitions/DummyList.ts`), true);
        t.equal(existsSync(`${outdir}/extendedelement/definitions/DummyRequest.ts`), true);
        t.equal(existsSync(`${outdir}/extendedelement/definitions/DummyResponse.ts`), true);
        t.equal(existsSync(`${outdir}/extendedelement/definitions/DummyResult.ts`), true);
        t.equal(existsSync(`${outdir}/extendedelement/definitions/ExtendedDummyRequest.ts`), true);
        t.end();
    });

    t.test(`${target} - compile`, async (t) => {
        await typecheck(`${outdir}/extendedelement/index.ts`);
        t.end();
    });
});
