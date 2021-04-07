import test from "tape";
import { parseAndGenerate } from "../../src";
import { Logger } from "../../src/utils/logger";

const target = "binding_document";

test(target, async t => {
    Logger.disabled();

    const input = `./test/resources/${target}.wsdl`;
    const outdir = "./test/generated";

    t.test(`${target} - generate wsdl client`, async t => {
        await parseAndGenerate(input, outdir);
        t.end();
    });
});