import test from "tape";
import { existsSync } from "fs";
import { parseAndGenerate } from "../../src";
import { Logger } from "../../src/utils/logger";

const target = "recursive";

test(target, async (t) => {
    Logger.disabled();

    const input = `./test/resources/${target}.wsdl`;
    const outdir = "./test/generated";

    t.test(`${target} - generate wsdl client`, async (t) => {
        // TODO: Fix this issue
        // await parseAndGenerate(input, outdir);
        t.end();
    });

    t.test(`${target} - check definitions`, async (t) => {
        // t.equal(existsSync(`${outdir}/recursive/definitions/ActivityNameFilter.ts`), true);
        // t.equal(existsSync(`${outdir}/recursive/definitions/TnsparamsGetLeadChanges.ts`), true);
        // t.equal(existsSync(`${outdir}/recursive/definitions/TnssuccessGetLeadChanges.ts`), true);
        // t.end();
    });

    // t.test(`${target} - compile`, async t => {
    //     await typecheck(`${outdir}/arraynamespaceoverride/index.ts`);
    // });
});
