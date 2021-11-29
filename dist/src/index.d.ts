export { generate } from "./generator";
export { parseWsdl } from "./parser";
export interface Options {
    emitDefinitionsOnly: boolean;
    modelNamePreffix: string;
    modelNameSuffix: string;
    caseInsensitiveNames: boolean;
    maxRecursiveDefinitionName: number;
}
export declare const defaultOptions: Options;
export declare function parseAndGenerate(wsdlPath: string, outDir: string, options?: Partial<Options>): Promise<void>;
//# sourceMappingURL=index.d.ts.map