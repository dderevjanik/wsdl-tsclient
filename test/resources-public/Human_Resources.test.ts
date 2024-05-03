import test from "tape";
import { existsSync } from "fs";
import { parseAndGenerate } from "../../src";
import { Logger } from "../../src/utils/logger";

const target = "Human_Resources";

test(target, async (t) => {
    Logger.disabled();
    Logger.isWarn = true;

    const input = `./test/resources-public/${target}.wsdl`;
    const outdir = "./test/generated";

    t.test(`${target} - generate wsdl client`, async (t) => {
        await parseAndGenerate(input, outdir, { maxRecursiveDefinitionName: 85 });
        t.end();
    });

    t.test(`${target} - check definitions`, async (t) => {
        // TODO: Add more definitions to check
        t.equal(existsSync(`${outdir}/humanresources/definitions/AcademicAppointee.ts`), true);
        t.end();
    });
});
