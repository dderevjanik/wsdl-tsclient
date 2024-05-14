import test from "tape";
import { existsSync } from "fs";
import { parseAndGenerate } from "../../src";
import { Logger } from "../../src/utils/logger";

const target = "self_recursive";

test(target, async (t) => {
    Logger.disabled();

    const input = `./test/resources/${target}.wsdl`;
    const outdir = "./test/generated";

    t.test(`${target} - generate wsdl client`, async (t) => {
        await parseAndGenerate(input, outdir);
        t.end();
    });

    t.test(`${target} - check definitions`, async (t) => {
        t.equal(existsSync(`${outdir}/selfrecursive/definitions/GetPerson.ts`), true);
        t.equal(existsSync(`${outdir}/selfrecursive/definitions/GetPersonResponse.ts`), true);
        t.equal(existsSync(`${outdir}/selfrecursive/definitions/Person.ts`), true);
        t.equal(existsSync(`${outdir}/selfrecursive/definitions/Request.ts`), true);
        t.end();
    });
});
