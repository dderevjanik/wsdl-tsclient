import test from "tape";
import { existsSync } from "fs";
import { parseAndGenerate } from "../../src";
import { Logger } from "../../src/utils/logger";
import { typecheck } from "../utils/tsc";

const target = "cross_schema";

test(target, async (t) => {
    Logger.disabled();

    const input = `./test/resources/${target}.wsdl`;
    const outdir = "./test/generated";

    t.test(`${target} - generate wsdl client`, async (t) => {
        await parseAndGenerate(input, outdir);
        t.end();
    });

    t.test(`${target} - check definitions`, async (t) => {
        t.equal(existsSync(`${outdir}/crossschema/definitions/OperationResponse.ts`), true);
        t.equal(existsSync(`${outdir}/crossschema/definitions/OperationReturn.ts`), true);
        t.end();
    });

    // TODO: Finish
    // t.test(`${target} - compile`, async t => {
    //     await typecheck(`${outdir}/crossschema/index.ts`);
    // 	t.end();
    // });
});
