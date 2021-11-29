import { ParsedWsdl } from "./models/parsed-wsdl";
interface ParserOptions {
    modelNamePreffix: string;
    modelNameSuffix: string;
    maxRecursiveDefinitionName: number;
}
/**
 * Parse WSDL to domain model `ParsedWsdl`
 * @param wsdlPath - path or url to wsdl file
 */
export declare function parseWsdl(wsdlPath: string, options: Partial<ParserOptions>): Promise<ParsedWsdl>;
export {};
//# sourceMappingURL=parser.d.ts.map