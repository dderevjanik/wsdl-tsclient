import * as path from "path";
import camelCase from "camelcase";
import { parseWsdl } from "./parser";
import { generate as generate } from "./generator";
import { existsSync } from "fs";
import { ImportDeclarationStructure, MethodSignatureStructure, OptionalKind, Project, PropertySignatureStructure, StructureKind } from "ts-morph";
import { reservedKeywords } from "./utils/javascript";
import { open_wsdl } from "soap/lib/wsdl/index";
import { Logger } from "./utils/logger";

// TODO: Avoid this
let definitionsList: Array<{ name: string; reference: any; }> = [];

function findNonUseDefNameInCache(defName: string) {
    if (!definitionsList.find(def => def.name === defName)) {
        return defName;
    }
    for (let i = 1; i < 20; i++) {
        if (!definitionsList.find(def => def.name === `${defName}${i}`)) {
            return `${defName}${i}`;
        }
    }
    throw new Error(`Out of stack for "${defName}", there's probably cyclic definition`)
}

function findReferenceDefiniton(definitionParts: { [propNameType: string]: string }) {
    return definitionsList.find(def => def.reference === definitionParts);
}

function timeElapsed(time: [number, number]) {
    return (time[0] * 1000000000 + time[1]) / 1000000;
}

const propertiesBlaclist = [
    "targetNSAlias",
    "targetNamespace"
]

// function isCyclic(obj) {
//     var seenObjects = [];

//     function detect(obj) {
//         if (obj && typeof obj === 'object') {
//             if (seenObjects.indexOf(obj) !== -1) {
//                 return true;
//             }
//             seenObjects.push(obj);
//             for (var key in obj) {
//                 if (obj.hasOwnProperty(key) && detect(obj[key])) {
//                     console.log(obj, 'cycle at ' + key);
//                     return true;
//                 }
//             }
//         }
//         return false;
//     }

//     return detect(obj);
// }

function createProperty(name: string, type: string, doc: string, optional = true): PropertySignatureStructure {
    return {
        kind: StructureKind.PropertySignature,
        name: camelCase(name),
        docs: [doc],
        hasQuestionToken: true,
        type: type
    };
}

/**
 * Generate definiton
 * @param project ts-morph project
 * @param defDir dir where to put definition file
 * @param name name of definition
 * @param defParts definitions parts (it's properties from wsdl)
 * @param stack definition stack (for deep objects)
 */
function generateDefinitionFile(project: Project, defDir: string, name: string, defParts: { [propNameType: string]: any }, stack: string[]): string {
    const defName = camelCase(name, { pascalCase: true });

    const fileName = findNonUseDefNameInCache(defName);
    const filePath = path.join(defDir, `${fileName}.ts`);

    const defFile = project.createSourceFile(filePath, "", { overwrite: true });
    definitionsList.push({ name: fileName, reference: defParts }); // NOTE: cache reference to this defintion globally (for avoiding circular references)

    const subDefExports: string[] = [];
    const defProperties: PropertySignatureStructure[] = [];

    if (defParts) {
        // NOTE: `node-soap` has sometimes problem with parsing wsdl files, it includes `defParts.undefined = undefined`
        if (("undefined" in defParts) && (defParts.undefined === undefined)) {
            // TODO: problem while parsing WSDL, maybe report to node-soap
            // TODO: add flag --FailOnWsdlError
            console.error({
                message: "Problem while generating a definition file",
                path: stack.join("."),
                parts: defParts
            });
        } else {
            Object.entries(defParts).forEach(([propName, type]) => {
                if (propName.endsWith("[]")) {
                    const stripedPropName = propName.substring(0, propName.length - 2);
                    // Array of
                    if (typeof type === "string") {
                        // primitive type
                        defProperties.push(createProperty(stripedPropName, "Array<string>", type));
                    } else {
                        // With sub-type
                        const reference = findReferenceDefiniton(type);
                        if (reference) {
                            // By referencing already declared definition, we will avoid circular references
                            subDefExports.push(reference.name);
                            defProperties.push(createProperty(reference.name, `Array<${reference.name}>`, ""));
                        } else {
                            const subDefName = generateDefinitionFile(project, defDir, stripedPropName, type, [...stack, propName]);
                            subDefExports.push(subDefName);
                            defProperties.push(createProperty(stripedPropName, `Array<${subDefName}>`, type));
                        }
                    }
                } else {
                    if (typeof type === "string") {
                        // primitive type
                        const property = createProperty(propName, "string", type);
                        defProperties.push(property);
                    } else {
                        // With sub-type
                        const reference = findReferenceDefiniton(type);
                        if (reference) {
                            // By referencing already declared definition, we will avoid circular references
                            subDefExports.push(reference.name);
                            defProperties.push(createProperty(reference.name, reference.name, ""));
                        } else {
                            const subDefName = generateDefinitionFile(project, defDir, propName, type, [...stack, propName]);
                            subDefExports.push(subDefName);
                            defProperties.push(createProperty(propName, subDefName, subDefName));
                        }
                    }
                }
            });
        }
    } else {
        // TODO: Doesn't have parts :(
    }
    defFile.addImportDeclarations(subDefExports.map<OptionalKind<ImportDeclarationStructure>>((imp) => ({
        moduleSpecifier: `./${imp}`,
        namedImports: [{ name: imp }]
    })));
    defFile.addStatements([{
        leadingTrivia: writer => writer.newLine(),
        isExported: true,
        name: defName,
        kind: StructureKind.Interface,
        properties: defProperties
    }]);
    defFile.saveSync();
    console.debug(`Created Definition file: ${path.join(defDir, defName)}`);
    return defName;
}

// TODO: Add logs
// TODO: Add comments for services, ports, methods and client
export async function generateClient(name: string, wsdlPath: string, outDir: string): Promise<void> {
    // Clear previous cache
    definitionsList = []; // TODO: Avoid this

    return new Promise((resolve, reject) => {
        const timeParseStart = process.hrtime();
        open_wsdl(wsdlPath, function (err, wsdl) {
            if (err) {
                return reject(err);
            }
            console.debug(`WSDL Parse Time: ${timeElapsed(process.hrtime(timeParseStart))}ms`);
            if (wsdl === undefined) {
                return reject(new Error("WSDL is undefined"));
            }

            const timeGenerateStart = process.hrtime();
            const project = new Project();
            const portsDir = path.join(outDir, "ports");
            const servicesDir = path.join(outDir, "services");
            const defDir = path.join(outDir, "definitions");

            const allMethods: { [methodName: string]: { paramName: string; paramType?: string; returnType?: string; } } = {};
            const allDefinitions = new Set<string>(); // TODO: Convert to Array

            const servicesExports = new Set<string>();
            for (const [serviceName, service] of Object.entries(wsdl.definitions.services)) {
                const portsExport = new Set<string>(); // TODO: Convert to Array

                for (const [portName, port] of Object.entries(service.ports)) { // [SI_ManageOrder_O]
                    const portImports = new Set<string>(); // TODO: Convert to Array
                    const portMethods: Array<{ name: string; paramName: string; paramType?: string; returnType?: string; }> = [];

                    for (const [methodName, method] of Object.entries(port.binding.methods)) { // [O_CustomerChange]

                        // TODO: Deduplicate code below by refactoring it to external function. Is it possible ?
                        let paramName = "request";
                        let paramType = "{}";
                        if (method.input) {
                            paramName = method.input.$name;
                            const inputMessage = wsdl.definitions.messages[method.input.$name];
                            // TODO: if $type not defined, inline type into function declartion
                            if (inputMessage.element) {
                                paramType = inputMessage.element.$type ?? inputMessage.element.$name;
                                let inputParamType = paramType;
                                if (!existsSync(path.resolve(defDir, `${paramType}.ts`))) {
                                    const defName = generateDefinitionFile(project, defDir, paramType, inputMessage.parts, [paramType]);
                                    allDefinitions.add(defName);
                                    inputParamType = defName;
                                }
                                portImports.add(inputParamType);
                            }
                        }

                        let returnType = "{}"; // default type
                        if (method.output) {
                            const outputMessage = wsdl.definitions.messages[method.output.$name];
                            if (outputMessage.element) {
                                // TODO: if input doesn't have $type, use $name for definition file
                                returnType = outputMessage.element.$type ?? outputMessage.element.$name;
                                let outputParamType = returnType;
                                if (!existsSync(path.resolve(defDir, `${returnType}.ts`))) {
                                    const defName = generateDefinitionFile(project, defDir, returnType, outputMessage.parts, [returnType]);
                                    allDefinitions.add(defName);
                                    outputParamType = defName;
                                }
                                portImports.add(outputParamType);
                            }
                        }

                        const finalParamName = reservedKeywords.includes(camelCase(paramName))
                            ? `${camelCase(paramName)}Param`
                            : camelCase(paramName)
                        allMethods[methodName] = {
                            paramName: finalParamName,
                            paramType: paramType, // TODO: Use string from generated definition files
                            returnType: returnType // TODO: Use string from generated definition files
                        };

                        portMethods.push({
                            name: methodName,
                            paramName: finalParamName,
                            paramType: paramType, // TODO: Use string from generated definition files
                            returnType: returnType // TODO: Use string from generated definition files
                        });
                    }
                    const portFileMethods: Array<OptionalKind<MethodSignatureStructure>> = [];
                    portMethods.forEach((method) => {
                        portFileMethods.push({
                            name: method.name,
                            parameters: [{
                                name: method.paramName,
                                type: method.paramType ?? "{}"
                            }, {
                                name: "callback",
                                type: `(err: any, result: ${method.paramType ?? "{}"}, rawResponse: any, soapHeader: any, rawRequest: any) => void`
                            }],
                            returnType: method.returnType
                        });
                    })

                    const portFinalName = camelCase(portName, { pascalCase: true });
                    const portFilePath = path.resolve(portsDir, `${portFinalName}.ts`);
                    const portFile = project.createSourceFile(portFilePath, "", { overwrite: true });

                    portFile.addImportDeclarations(Array.from(portImports).map<OptionalKind<ImportDeclarationStructure>>((imp) => ({
                        moduleSpecifier: `../definitions/${imp}`,
                        namedImports: [{ name: imp }]
                    })));
                    portFile.addStatements([
                        {
                            leadingTrivia: writer => writer.newLine(),
                            isExported: true,
                            kind: StructureKind.Interface,
                            name: portFinalName,
                            // NOTE: Could be optimized with Object.entries(port) above
                            methods: portFileMethods
                        }
                    ]);
                    portFile.saveSync();
                    portsExport.add(portFinalName);
                    console.debug(`Created Port file: ${path.join(portsDir, portFinalName)}`);
                } // End of Port cycle

                const finalServiceName = camelCase(serviceName);
                const serviceFilePath = path.resolve(servicesDir, `${finalServiceName}.ts`);
                const serviceFile = project.createSourceFile(serviceFilePath, "", { overwrite: true });

                serviceFile.addImportDeclarations(Array.from(portsExport).map<OptionalKind<ImportDeclarationStructure>>(imp => ({
                    moduleSpecifier: `../ports/${imp}`,
                    namedImports: [{ name: imp }]
                })));
                serviceFile.addStatements([
                    {
                        leadingTrivia: writer => writer.newLine(),
                        isExported: true,
                        kind: StructureKind.Interface,
                        name: finalServiceName,
                        properties: Array.from(portsExport).map<OptionalKind<PropertySignatureStructure>>(portImport => ({
                            name: portImport,
                            isReadonly: true,
                            type: portImport
                        }))
                    }
                ]);
                serviceFile.saveSync();
                servicesExports.add(finalServiceName);
                console.debug(`Created Service file: ${path.join(servicesDir, finalServiceName)}`);
            } // End of Service cycle

            // Generate client
            const clientFilePath = path.resolve(outDir, "Client.ts");
            const clientFile = project.createSourceFile(clientFilePath, "", { overwrite: true });

            clientFile.addImportDeclaration({
                moduleSpecifier: "soap",
                namedImports: [
                    { name: "Client", alias: "SoapClient" },
                    { name: "createClientAsync", alias: "soapCreateClientAsync" }
                ],
            });
            clientFile.addImportDeclarations(Array.from(allDefinitions).map<OptionalKind<ImportDeclarationStructure>>(imp => ({
                moduleSpecifier: `./definitions/${imp}`,
                namedImports: [{ name: imp }]
            })));
            clientFile.addImportDeclarations(Array.from(servicesExports).map<OptionalKind<ImportDeclarationStructure>>(imp => ({
                moduleSpecifier: `./services/${imp}`,
                namedImports: [{ name: imp }]
            })));
            clientFile.addStatements([
                {
                    leadingTrivia: writer => writer.newLine(),
                    isExported: true,
                    kind: StructureKind.Interface,
                    name: "IClient",
                    properties: Array.from(servicesExports).map<OptionalKind<PropertySignatureStructure>>(serviceName => ({
                        name: serviceName,
                        isReadonly: true,
                        type: serviceName
                    })),
                    methods: Object.entries(allMethods).map<OptionalKind<MethodSignatureStructure>>(([methodName, method]) => ({
                        name: `${methodName}Async`,
                        parameters: [{
                            name: method.paramName,
                            type: method.paramType ?? "{}"
                        }],
                        returnType: `Promise<${method.returnType ?? "unknown"}>`
                    }))
                }
            ]);
            const createClientDeclaration = clientFile.addFunction({
                name: "createClientAsync",
                isExported: true,
                parameters: [{
                    isRestParameter: true,
                    name: "args",
                    type: "Parameters<typeof soapCreateClientAsync>"
                }],
                returnType: "Promise<SoapClient & IClient>" // TODO: `any` keyword is very dangerous
            })
            createClientDeclaration.setBodyText("return soapCreateClientAsync(args[0], args[1], args[2]) as any;")
            clientFile.saveSync();
            console.debug(`Generatation time: ${timeElapsed(process.hrtime(timeGenerateStart))}ms`);
            console.debug(`Created Client file: ${path.join(outDir, "Client.ts")}`);
            return resolve();
        });

    });
}


export async function parseAndGenerate(wsdlPath: string, outDir: string): Promise<void> {
    const timeParseStart = process.hrtime();
    const parsedWsdl = await parseWsdl(wsdlPath);
    Logger.debug(`Parser time: ${timeElapsed(process.hrtime(timeParseStart))}ms`);

    const timeGenerateStart = process.hrtime();
    await generate(parsedWsdl, outDir);
    Logger.debug(`Generator time: ${timeElapsed(process.hrtime(timeGenerateStart))}ms`);

    Logger.info(`Generating finished: ${timeElapsed(process.hrtime(timeParseStart))}ms`);
}