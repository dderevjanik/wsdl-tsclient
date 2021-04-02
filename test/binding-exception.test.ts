import test from "tape";
import { existsSync } from "fs";
import { parseAndGenerate } from "../src";
import { Logger } from "../src/utils/logger";

test("binding-exception", async t => {
    Logger.disabled();

    const input = "./test/resources/binding-exception.wsdl";
    const outdir = "./test/generated";

    t.test("generate wsdl client", async t => {
        await parseAndGenerate(input, outdir);
        t.end();
    });

    t.test("check definitions", async t => {
        t.equal(existsSync(`${outdir}/bindingexception/definitions/LoginUserRequest.ts`), true);
        t.equal(existsSync(`${outdir}/bindingexception/definitions/LoginUserResponse.ts`), true);
        t.end();
    });
});