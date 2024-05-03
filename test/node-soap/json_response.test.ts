import test from "tape";
import { existsSync } from "fs";
import { parseAndGenerate } from "../../src";
import { Logger } from "../../src/utils/logger";
import { typecheck } from "../utils/tsc";

const target = "json_response";

test(target, async (t) => {
    Logger.disabled();

    const input = `./test/resources/${target}.wsdl`;
    const outdir = "./test/generated";

    t.test(`${target} - generate wsdl client`, async (t) => {
        await parseAndGenerate(input, outdir);
        t.end();
    });

    t.test(`${target} - check definitions`, async (t) => {
        t.equal(existsSync(`${outdir}/jsonresponse/definitions/Request.ts`), true);
        t.end();
    });

    t.test(`${target} - compile`, async (t) => {
        await typecheck(`${outdir}/jsonresponse/index.ts`);
        t.end();
    });
});
