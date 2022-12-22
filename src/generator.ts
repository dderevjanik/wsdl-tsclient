import camelcase from "camelcase";
import path from "path";
import {
    ImportDeclarationStructure,
    MethodSignatureStructure,
    OptionalKind,
    Project,
    PropertySignatureStructure,
    StructureKind,
} from "ts-morph";
import { ModelPropertyNaming } from ".";
import { Definition, Method, ParsedWsdl } from "./models/parsed-wsdl";
import { Logger } from "./utils/logger";

export interface GeneratorOptions {
    emitDefinitionsOnly: boolean;
    modelPropertyNaming: ModelPropertyNaming;
}

const defaultOptions: GeneratorOptions = {
    emitDefinitionsOnly: false,
    modelPropertyNaming: null,
};

/**
 * To avoid duplicated imports
 */
function addSafeImport(
    imports: OptionalKind<ImportDeclarationStructure>[],
    moduleSpecifier: string,
    namedImport: string,
    isTypeOnly: boolean = false
) {
    if (!imports.find((imp) => imp.moduleSpecifier == moduleSpecifier)) {
        imports.push({
            moduleSpecifier,
            namedImports: [{ name: namedImport }],
            isTypeOnly
        });
    }
}

const incorrectPropNameChars = [" ", "-", "."];
/**
 * This is temporally method to fix this issue https://github.com/dsherret/ts-morph/issues/1160
 */
function sanitizePropName(propName: string) {
    if (incorrectPropNameChars.some((char) => propName.includes(char))) {
        return `"${propName}"`;
    }
    return propName;
}

function createProperty(
    name: string,
    type: string,
    doc: string,
    isArray: boolean,
    optional = true
): PropertySignatureStructure {
    return {
        kind: StructureKind.PropertySignature,
        name: sanitizePropName(name),
        docs: [doc],
        hasQuestionToken: true,
        type: isArray ? `Array<${type}>` : type,
    };
}

function generateDefinitionFile(
    project: Project,
    definition: null | Definition,
    defDir: string,
    stack: string[],
    generated: Definition[],
    options: GeneratorOptions
): void {
    const defName = definition.name;
    const defFilePath = path.join(defDir, `${defName}.ts`);
    const defFile = project.createSourceFile(defFilePath, "", {
        overwrite: true,
    });

    generated.push(definition);

    const definitionImports: OptionalKind<ImportDeclarationStructure>[] = [];
    const definitionProperties: PropertySignatureStructure[] = [];
    for (const prop of definition.properties) {
        if (options.modelPropertyNaming) {
            switch (options.modelPropertyNaming) {
                case ModelPropertyNaming.camelCase:
                    prop.name = camelcase(prop.name);
                    break;
                case ModelPropertyNaming.PascalCase:
                    prop.name = camelcase(prop.name, { pascalCase: true });
                    break;
            }
        }
        if (prop.kind === "PRIMITIVE") {
            // e.g. string
            definitionProperties.push(createProperty(prop.name, prop.type, prop.description, prop.isArray));
        } else if (prop.kind === "REFERENCE") {
            // e.g. Items
            if (!generated.includes(prop.ref)) {
                // Wasn't generated yet
                generateDefinitionFile(project, prop.ref, defDir, [...stack, prop.ref.name], generated, options);
            }
            // If a property is of the same type as its parent type, don't add import
            if (prop.ref.name !== definition.name) {
                addSafeImport(definitionImports, `./${prop.ref.name}.js`, prop.ref.name, true);
            }
            definitionProperties.push(createProperty(prop.name, prop.ref.name, prop.sourceName, prop.isArray));
        }
    }

    defFile.addImportDeclarations(definitionImports);
    defFile.addStatements([
        {
            leadingTrivia: (writer) => writer.newLine(),
            isExported: true,
            name: defName,
            docs: [definition.docs.join("\n")],
            kind: StructureKind.Interface,
            properties: definitionProperties,
        },
    ]);
    Logger.log(`Writing Definition file: ${path.resolve(path.join(defDir, defName))}.ts`);
    defFile.saveSync();
}

export async function generate(
    parsedWsdl: ParsedWsdl,
    outDir: string,
    options: Partial<GeneratorOptions>
): Promise<void> {
    const mergedOptions: GeneratorOptions = {
        ...defaultOptions,
        ...options,
    };
    const project = new Project();

    const portsDir = path.join(outDir, "ports");
    const servicesDir = path.join(outDir, "services");
    const defDir = path.join(outDir, "definitions");

    const allMethods: Method[] = [];
    const allDefinitions: Definition[] = [];

    const clientImports: Array<OptionalKind<ImportDeclarationStructure>> = [];
    const clientServices: Array<OptionalKind<PropertySignatureStructure>> = [];
    for (const service of parsedWsdl.services) {
        const serviceFilePath = path.join(servicesDir, `${service.name}.ts`);
        const serviceFile = project.createSourceFile(serviceFilePath, "", {
            overwrite: true,
        });

        const serviceImports: Array<OptionalKind<ImportDeclarationStructure>> = [];
        const servicePorts: Array<OptionalKind<PropertySignatureStructure>> = [];
        for (const port of parsedWsdl.ports) {
            const portFilePath = path.join(portsDir, `${port.name}.ts`);
            const portFile = project.createSourceFile(portFilePath, "", {
                overwrite: true,
            });

            const portImports: Array<OptionalKind<ImportDeclarationStructure>> = [];
            const portFileMethods: Array<OptionalKind<MethodSignatureStructure>> = [];
            for (const method of port.methods) {
                // TODO: Deduplicate PortImports
                if (method.paramDefinition !== null) {
                    if (!allDefinitions.includes(method.paramDefinition)) {
                        // Definition is not generated
                        generateDefinitionFile(
                            project,
                            method.paramDefinition,
                            defDir,
                            [method.paramDefinition.name],
                            allDefinitions,
                            mergedOptions
                        );
                        addSafeImport(
                            clientImports,
                            `./definitions/${method.paramDefinition.name}.js`,
                            method.paramDefinition.name,
                            true
                        );
                    }
                    addSafeImport(
                        portImports,
                        `../definitions/${method.paramDefinition.name}.js`,
                        method.paramDefinition.name,
                        true
                    );
                }
                if (method.returnDefinition !== null) {
                    if (!allDefinitions.includes(method.returnDefinition)) {
                        // Definition is not generated
                        generateDefinitionFile(
                            project,
                            method.returnDefinition,
                            defDir,
                            [method.returnDefinition.name],
                            allDefinitions,
                            mergedOptions
                        );
                        addSafeImport(
                            clientImports,
                            `./definitions/${method.returnDefinition.name}.js`,
                            method.returnDefinition.name,
                            true
                        );
                    }
                    addSafeImport(
                        portImports,
                        `../definitions/${method.returnDefinition.name}.js`,
                        method.returnDefinition.name,
                        true
                    );
                }
                // TODO: Deduplicate PortMethods
                allMethods.push(method);
                portFileMethods.push({
                    name: sanitizePropName(method.name),
                    parameters: [
                        {
                            name: camelcase(method.paramName),
                            type: method.paramDefinition ? method.paramDefinition.name : "{}",
                        },
                        {
                            name: "callback",
                            type: `(err: any, result: ${
                                method.returnDefinition ? method.returnDefinition.name : "unknown"
                            }, rawResponse: any, soapHeader: any, rawRequest: any) => void`, // TODO: Use ts-morph to generate proper type
                        },
                    ],
                    returnType: "void",
                });
            } // End of PortMethod
            if (!mergedOptions.emitDefinitionsOnly) {
                addSafeImport(serviceImports, `../ports/${port.name}.js`, port.name, true);
                servicePorts.push({
                    name: sanitizePropName(port.name),
                    isReadonly: true,
                    type: port.name,
                });
                portFile.addImportDeclarations(portImports);
                portFile.addStatements([
                    {
                        leadingTrivia: (writer) => writer.newLine(),
                        isExported: true,
                        kind: StructureKind.Interface,
                        name: port.name,
                        methods: portFileMethods,
                    },
                ]);
                Logger.log(`Writing Port file: ${path.resolve(path.join(portsDir, port.name))}.ts`);
                portFile.saveSync();
            }
        } // End of Port

        if (!mergedOptions.emitDefinitionsOnly) {
            addSafeImport(clientImports, `./services/${service.name}.js`, service.name, true);
            clientServices.push({ name: sanitizePropName(service.name), type: service.name });

            serviceFile.addImportDeclarations(serviceImports);
            serviceFile.addStatements([
                {
                    leadingTrivia: (writer) => writer.newLine(),
                    isExported: true,
                    kind: StructureKind.Interface,
                    name: service.name,
                    properties: servicePorts,
                },
            ]);
            Logger.log(`Writing Service file: ${path.resolve(path.join(servicesDir, service.name))}.ts`);
            serviceFile.saveSync();
        }
    } // End of Service

    if (!mergedOptions.emitDefinitionsOnly) {
        const clientFilePath = path.join(outDir, "client.ts");
        const clientFile = project.createSourceFile(clientFilePath, "", {
            overwrite: true,
        });
        clientFile.addImportDeclaration({
            moduleSpecifier: "soap",
            namedImports: [
                { name: "Client", alias: "SoapClient" },
                { name: "createClientAsync", alias: "soapCreateClientAsync" },
            ],
        });
        clientFile.addImportDeclarations(clientImports);
        clientFile.addStatements([
            {
                leadingTrivia: (writer) => writer.newLine(),
                isExported: true,
                kind: StructureKind.Interface,
                // docs: [`${parsedWsdl.name}Client`],
                name: `${parsedWsdl.name}Client`,
                properties: clientServices,
                extends: ["SoapClient"],
                methods: allMethods.map<OptionalKind<MethodSignatureStructure>>((method) => ({
                    name: sanitizePropName(`${method.name}Async`),
                    parameters: [
                        {
                            name: camelcase(method.paramName),
                            type: method.paramDefinition ? method.paramDefinition.name : "{}",
                        },
                    ],
                    returnType: `Promise<[result: ${
                        method.returnDefinition ? method.returnDefinition.name : "unknown"
                    }, rawResponse: any, soapHeader: any, rawRequest: any]>`,
                })),
            },
        ]);
        const createClientDeclaration = clientFile.addFunction({
            name: "createClientAsync",
            docs: [`Create ${parsedWsdl.name}Client`],
            isExported: true,
            parameters: [
                {
                    isRestParameter: true,
                    name: "args",
                    type: "Parameters<typeof soapCreateClientAsync>",
                },
            ],
            returnType: `Promise<${parsedWsdl.name}Client>`, // TODO: `any` keyword is very dangerous
        });
        createClientDeclaration.setBodyText("return soapCreateClientAsync(args[0], args[1], args[2]) as any;");
        Logger.log(`Writing Client file: ${path.resolve(path.join(outDir, "client"))}.ts`);
        clientFile.saveSync();
    }

    // Create index file with re-exports
    const indexFilePath = path.join(outDir, "index.ts");
    const indexFile = project.createSourceFile(indexFilePath, "", {
        overwrite: true,
    });

    indexFile.addExportDeclarations(
        allDefinitions.map((def) => ({
            namedExports: [def.name],
            moduleSpecifier: `./definitions/${def.name}`,
        }))
    );
    if (!mergedOptions.emitDefinitionsOnly) {
        // TODO: Aggregate all exports during declarations generation
        // https://ts-morph.com/details/exports
        indexFile.addExportDeclarations([
            {
                namedExports: ["createClientAsync", `${parsedWsdl.name}Client`],
                moduleSpecifier: "./client",
            },
        ]);
        indexFile.addExportDeclarations(
            parsedWsdl.services.map((service) => ({
                namedExports: [service.name],
                moduleSpecifier: `./services/${service.name}`,
            }))
        );
        indexFile.addExportDeclarations(
            parsedWsdl.ports.map((port) => ({
                namedExports: [port.name],
                moduleSpecifier: `./ports/${port.name}`,
            }))
        );
    }

    Logger.log(`Writing Index file: ${path.resolve(path.join(outDir, "index"))}.ts`);

    indexFile.saveSync();
}
