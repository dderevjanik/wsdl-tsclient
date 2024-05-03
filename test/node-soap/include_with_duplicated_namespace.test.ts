import test from "tape";
import { existsSync } from "fs";
import { parseAndGenerate } from "../../src";
import { Logger } from "../../src/utils/logger";
import { typecheck } from "../utils/tsc";

const target = "include_with_duplicated_namespace";

test(target, async (t) => {
    Logger.disabled();

    const input = `./test/resources/${target}.wsdl`;
    const outdir = "./test/generated";

    t.test(`${target} - generate wsdl client`, async (t) => {
        await parseAndGenerate(input, outdir);
        t.end();
    });

    t.test(`${target} - check definitions`, async (t) => {
        t.equal(existsSync(`${outdir}/includewithduplicatednamespace/definitions/DummyList.ts`), true);
        t.equal(existsSync(`${outdir}/includewithduplicatednamespace/definitions/DummyResponse.ts`), true);
        t.equal(existsSync(`${outdir}/includewithduplicatednamespace/definitions/DummyResult.ts`), true);
        t.equal(existsSync(`${outdir}/includewithduplicatednamespace/definitions/ExtendedDummyRequest.ts`), true);
        t.end();
    });

    t.test(`${target} - compile`, async (t) => {
        await typecheck(`${outdir}/includewithduplicatednamespace/index.ts`);
        t.end();
    });
});
