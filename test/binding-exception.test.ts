import test from "tape";
import { existsSync } from "fs";
import { parseAndGenerate } from "../src";
import { Logger } from "../src/utils/logger";

test("builtin-types", async suite => {
    Logger.disabled();

    const input = "./test/resources/binding_document.wsdl";
    const outdir = "./test/generated";

    test("generate wsdl client", async t => {
        await parseAndGenerate(input, outdir);
        t.equal(existsSync(`${outdir}/bindingexception/definitions/LoginUserRequest.ts`), true);
        t.equal(existsSync(`${outdir}/bindingexception/definitions/LoginUserResponse.ts`), true);
        t.end();
    });

    suite.end();
});