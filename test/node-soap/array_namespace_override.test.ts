import test from "tape";
import { existsSync } from "fs";
import { parseAndGenerate } from "../../src";
import { Logger } from "../../src/utils/logger";
import { typecheck } from "../utils/tsc";

const target = "array_namespace_override.wsdl";

test(target, async (t) => {
    Logger.disabled();

    const input = `./test/resources/${target}`;
    const outdir = "./test/generated";

    t.test(`${target} - generate wsdl client`, async (t) => {
        await parseAndGenerate(input, outdir);
        t.end();
    });

    t.test(`${target} - check definitions`, async (t) => {
        t.equal(existsSync(`${outdir}/arraynamespaceoverride/definitions/Items.ts`), true);
        t.equal(existsSync(`${outdir}/arraynamespaceoverride/definitions/Markdowns.ts`), true);
        t.equal(existsSync(`${outdir}/arraynamespaceoverride/definitions/Order.ts`), true);
        t.equal(existsSync(`${outdir}/arraynamespaceoverride/definitions/OrderDetails.ts`), true);
        t.equal(existsSync(`${outdir}/arraynamespaceoverride/definitions/TnscreateOrderResponseVo.ts`), true);
        t.equal(existsSync(`${outdir}/arraynamespaceoverride/definitions/TnscreateWebOrderRequest.ts`), true);
        t.end();
    });

    t.test(`${target} - compile`, async (t) => {
        await typecheck(`${outdir}/arraynamespaceoverride/index.ts`);
        t.end();
    });
});
