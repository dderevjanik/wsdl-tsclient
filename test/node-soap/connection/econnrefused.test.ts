import test from "tape";
import { existsSync } from "fs";
import { parseAndGenerate } from "../../../src";
import { Logger } from "../../../src/utils/logger";
import { typecheck } from "../../utils/tsc";

const target = "connection/econnrefused";

test(target, async (t) => {
    Logger.disabled();

    const input = `./test/resources/${target}.wsdl`;
    const outdir = "./test/generated/connection";

    t.test(`${target} - generate wsdl client`, async (t) => {
        try {
            await parseAndGenerate(input, outdir);
            t.fail("Should throw error ECONNREFUSED 127.0.0.1:1");
        } catch (err) {
            t.ok(err, "Got error");
        }
        t.end();
    });
});
