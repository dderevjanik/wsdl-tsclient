import test from "tape";
import { existsSync } from "fs";
import { parseAndGenerate } from "../src";
import { Logger } from "../src/utils/logger";

test("builtin_types", async suite => {
    Logger.disabled();

    const input = "./test/resources/builtin_types.wsdl";
    const outdir = "./test/generated";

    test("generate wsdl client", async t => {
        await parseAndGenerate(input, outdir);
        t.equal(existsSync(`${outdir}/builtintypes/definitions/Xsduration.ts`), true);
        t.equal(existsSync(`${outdir}/builtintypes/definitions/XsnonNegativeInteger.ts`), true);
        t.equal(existsSync(`${outdir}/builtintypes/definitions/XsnonNegativeInteger1.ts`), true);
        t.equal(existsSync(`${outdir}/builtintypes/definitions/Xsstring.ts`), true);
        t.end();
    });

    suite.end();
});