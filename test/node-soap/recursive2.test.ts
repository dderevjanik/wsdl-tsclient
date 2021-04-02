import test from "tape";
import { existsSync } from "fs";
import { parseAndGenerate } from "../../src";
import { Logger } from "../../src/utils/logger";

test("recursive2", async t => {
    Logger.disabled();

    const input = "./test/resources/recursive2.wsdl";
    const outdir = "./test/generated";

    t.test("generate wsdl client", async t => {
        await parseAndGenerate(input, outdir);
        t.end();
    });

    t.test("check definitions", async t => {
        t.equal(existsSync(`${outdir}/recursive2/definitions/AccountElement.ts`), true);
        t.equal(existsSync(`${outdir}/recursive2/definitions/AccountElements.ts`), true);
        t.equal(existsSync(`${outdir}/recursive2/definitions/AddAttribute.ts`), true);
        t.equal(existsSync(`${outdir}/recursive2/definitions/AddAttributeRequest.ts`), true);
        t.equal(existsSync(`${outdir}/recursive2/definitions/AddAttributeResponse.ts`), true);
        t.equal(existsSync(`${outdir}/recursive2/definitions/Attr.ts`), true);
        t.equal(existsSync(`${outdir}/recursive2/definitions/Identifier.ts`), true);
        t.equal(existsSync(`${outdir}/recursive2/definitions/Items.ts`), true);
        t.equal(existsSync(`${outdir}/recursive2/definitions/Messages.ts`), true);
        t.equal(existsSync(`${outdir}/recursive2/definitions/OperationResponse.ts`), true);
        t.equal(existsSync(`${outdir}/recursive2/definitions/RequestItem.ts`), true);
        t.equal(existsSync(`${outdir}/recursive2/definitions/RequestItems.ts`), true);
        t.equal(existsSync(`${outdir}/recursive2/definitions/Requests.ts`), true);
        t.equal(existsSync(`${outdir}/recursive2/definitions/Response.ts`), true);
        t.equal(existsSync(`${outdir}/recursive2/definitions/ResponseItem.ts`), true);
        t.end();
    });
});