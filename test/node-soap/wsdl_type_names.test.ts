import test from "tape";
import { existsSync, rmdirSync } from "fs";
import { parseAndGenerate } from "../../src";
import { Logger } from "../../src/utils/logger";
import { typecheck } from "../utils/tsc";

const target = "jaxws_generated_service";

test(target, async (t) => {
    Logger.disabled();

    const input = `./test/resources/${target}/TestService.wsdl`;
    const outdir = "./test/generated/jaxws_generated_service";

    t.test(`${target} - generate wsdl client with default options`, async (t) => {
        rmdirSync(outdir, { recursive: true });
        await parseAndGenerate(input, outdir);
        t.end();
    });

    t.test(`${target} - check definitions`, async (t) => {
        t.equal(existsSync(`${outdir}/testservice/definitions/Request.ts`), true);
        t.equal(existsSync(`${outdir}/testservice/definitions/Request1.ts`), true);
        t.equal(existsSync(`${outdir}/testservice/definitions/Return.ts`), true);
        t.equal(existsSync(`${outdir}/testservice/definitions/TnsaddNumber.ts`), true);
        t.equal(existsSync(`${outdir}/testservice/definitions/TnsaddNumberResponse.ts`), true);
        t.end();
    });

    t.test(`${target} - compile`, async (t) => {
        await typecheck(`${outdir}/testservice/index.ts`);
        t.end();
    });

    t.test(`${target} - generate wsdl client with useWsdlTypeNames`, async (t) => {
        rmdirSync(outdir, { recursive: true });
        await parseAndGenerate(input, outdir, { useWsdlTypeNames: true });
        t.end();
    });

    t.test(`${target} - check useWsdlTypeNames definitions`, async (t) => {
        t.equal(existsSync(`${outdir}/testservice/definitions/ComplextRecursiveResult.ts`), true);
        t.equal(existsSync(`${outdir}/testservice/definitions/ComplextRequest.ts`), true);
        t.equal(existsSync(`${outdir}/testservice/definitions/SimpleRequest.ts`), true);
        t.equal(existsSync(`${outdir}/testservice/definitions/TnsaddNumber.ts`), true);
        t.equal(existsSync(`${outdir}/testservice/definitions/TnsaddNumberResponse.ts`), true);
        t.end();
    });

    t.test(`${target} - compile useWsdlTypeNames`, async (t) => {
        await typecheck(`${outdir}/testservice/index.ts`);
        t.end();
    });
});
