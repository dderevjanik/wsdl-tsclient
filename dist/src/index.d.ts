export { generate } from "./generator";
export { parseWsdl } from "./parser";
export declare enum ModelPropertyNaming {
    'camelCase' = "camelCase",
    'PascalCase' = "PascalCase"
}
export interface Options {
    emitDefinitionsOnly: boolean;
    modelNamePreffix: string;
    modelNameSuffix: string;
    caseInsensitiveNames: boolean;
    maxRecursiveDefinitionName: number;
    modelPropertyNaming: ModelPropertyNaming;
}
export declare const defaultOptions: Options;
export declare function parseAndGenerate(wsdlPath: string, outDir: string, options?: Partial<Options>): Promise<void>;
//# sourceMappingURL=index.d.ts.map