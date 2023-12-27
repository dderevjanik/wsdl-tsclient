import { parseAndGenerate } from "./src";
import { parseWsdl } from "./src/parser";

(async function () {
    const d = await parseAndGenerate(
        "./ANA_altea/NH DOM Test WSDL for Travel Agents_TST_1.0_Technical.wsdl",
        "./ANA_altea/generate",
        {
            modelNamePreffix: "",
            modelNameSuffix: "",
            maxRecursiveDefinitionName: 100,
        }
    );
})();
