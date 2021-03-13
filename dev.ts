import { parseWsdl } from "./src/parser";

(async function () {
    const d = await parseWsdl("XXX", "./ed.wsdl", "./generated");
})();