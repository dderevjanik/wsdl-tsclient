import test from "tape";
import { existsSync } from "fs";
import { parseAndGenerate } from "../../src";
import { Logger } from "../../src/utils/logger";

test("array_namespace_override", async t => {
    Logger.disabled();

    const input = "./test/resources/array_namespace_override.wsdl";
    const outdir = "./test/generated";

    t.test("generate wsdl client", async t => {
        await parseAndGenerate(input, outdir);
        t.end();
    });

    t.test("check definitions", async t => {
        t.equal(existsSync(`${outdir}/arraynamespaceoverride/definitions/Items.ts`), true);
        t.equal(existsSync(`${outdir}/arraynamespaceoverride/definitions/Markdowns.ts`), true);
        t.equal(existsSync(`${outdir}/arraynamespaceoverride/definitions/Order.ts`), true);
        t.equal(existsSync(`${outdir}/arraynamespaceoverride/definitions/OrderDetails.ts`), true);
        t.equal(existsSync(`${outdir}/arraynamespaceoverride/definitions/TnscreateOrderResponseVo.ts`), true);
        t.equal(existsSync(`${outdir}/arraynamespaceoverride/definitions/TnscreateWebOrderRequest.ts`), true);
        t.end();
    });
});