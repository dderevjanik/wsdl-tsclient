import test from "tape";
import { parseAndGenerate } from "../../src";
import { Logger } from "../../src/utils/logger";

test("binding_document", async t => {
    Logger.disabled();

    const input = "./test/resources/binding_document.wsdl";
    const outdir = "./test/generated";

    t.test("generate wsdl client", async t => {
        await parseAndGenerate(input, outdir);
        t.end();
    });
});