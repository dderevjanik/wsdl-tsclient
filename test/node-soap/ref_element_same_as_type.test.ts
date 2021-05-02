import test from "tape";
import { existsSync } from "fs";
import { parseAndGenerate } from "../../src";
import { Logger } from "../../src/utils/logger";
import { typecheck } from "../utils/tsc";

const target = "ref_element_same_as_type";

test(target, async t => {
    Logger.disabled();

    const input = `./test/resources/${target}.wsdl`;
    const outdir = "./test/generated";

    t.test(`${target} - generate wsdl client`, async t => {
        await parseAndGenerate(input, outdir);
        t.end();
    });

    t.test(`${target} - check definitions`, async t => {
        t.equal(existsSync(`${outdir}/refelementsameastype/definitions/ExampleContent.ts`), true);
        t.equal(existsSync(`${outdir}/refelementsameastype/definitions/ExampleRequest.ts`), true);
        t.equal(existsSync(`${outdir}/refelementsameastype/definitions/V1ExampleRequestType.ts`), true);
        t.end();
    });

    t.test(`${target} - compile`, async t => {
        await typecheck(`${outdir}/refelementsameastype/index.ts`);
		t.end();
    });

});