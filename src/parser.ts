import * as path from "path";
import { ComplexTypeElement, OperationElement } from "soap/lib/wsdl/elements";
import { WSDL, open_wsdl } from "soap/lib/wsdl/index";
import { Definition, Method, ParsedWsdl, Port, Service } from "./models/parsed-wsdl";
import { changeCase } from "./utils/change-case";
import { stripExtension } from "./utils/file";
import { reservedKeywords } from "./utils/javascript";
import { Logger } from "./utils/logger";

interface ParserOptions {
    modelNamePreffix: string;
    modelNameSuffix: string;
    maxRecursiveDefinitionName: number;
    caseInsensitiveNames: boolean;
}

const defaultOptions: ParserOptions = {
    modelNamePreffix: "",
    modelNameSuffix: "",
    maxRecursiveDefinitionName: 64,
    caseInsensitiveNames: false,
};

type VisitedDefinition = {
    name: string;
    parts: object;
    definition: Definition;
};

function findReferenceDefiniton(visited: Array<VisitedDefinition>, definitionParts: object) {
    return visited.find((def) => def.parts === definitionParts);
}

const NODE_SOAP_PARSED_TYPES: { [type: string]: string } = {
    int: "number",
    integer: "number",
    short: "number",
    long: "number",
    double: "number",
    float: "number",
    decimal: "number",
    bool: "boolean",
    boolean: "boolean",
    dateTime: "Date",
    date: "Date",
};

function toPrimitiveType(type: string): string {
    const index = type.indexOf(":");
    if (index >= 0) {
        type = type.substring(index + 1);
    }
    return NODE_SOAP_PARSED_TYPES[type] || "string";
}

/**
 * parse definition
 * @param parsedWsdl context of parsed wsdl
 * @param name name of definition, will be used as name of interface
 * @param defParts definition's parts - its properties
 * @param stack definitions stack of path to current subdefinition (immutable)
 * @param visitedDefs set of globally visited definitions to avoid circular definitions
 */
function parseDefinition(
    parsedWsdl: ParsedWsdl,
    options: ParserOptions,
    name: string,
    defParts: { [propNameType: string]: any },
    stack: string[],
    visitedDefs: Array<VisitedDefinition>
): Definition {
    const defName = changeCase(name, { pascalCase: true });

    Logger.debug(`Parsing Definition ${stack.join(".")}.${name}`);

    let nonCollisionDefName: string;
    try {
        nonCollisionDefName = parsedWsdl.findNonCollisionDefinitionName(defName);
    } catch (err) {
        const e = new Error(`Error for finding non-collision definition name for ${stack.join(".")}.${name}`);
        throw e;
    }
    const definition: Definition = {
        name: `${options.modelNamePreffix}${changeCase(nonCollisionDefName, { pascalCase: true })}${
            options.modelNameSuffix
        }`,
        sourceName: name,
        docs: [name],
        properties: [],
        description: "",
    };

    parsedWsdl.definitions.push(definition); // Must be here to avoid name collision with `findNonCollisionDefinitionName` if sub-definition has same name
    visitedDefs.push({ name: definition.name, parts: defParts, definition }); // NOTE: cache reference to this defintion globally (for avoiding circular references)
    if (defParts) {
        // NOTE: `node-soap` has sometimes problem with parsing wsdl files, it includes `defParts.undefined = undefined`
        if ("undefined" in defParts && defParts.undefined === undefined) {
            // TODO: problem while parsing WSDL, maybe report to node-soap
            // TODO: add flag --FailOnWsdlError
            Logger.error({
                message: "Problem while generating a definition file",
                path: stack.join("."),
                parts: defParts,
            });
        } else {
            Object.entries(defParts).forEach(([propName, type]) => {
                if (propName === "targetNSAlias") {
                    definition.docs.push(`@targetNSAlias \`${type}\``);
                } else if (propName === "targetNamespace") {
                    definition.docs.push(`@targetNamespace \`${type}\``);
                } else if (propName.endsWith("[]")) {
                    const stripedPropName = propName.substring(0, propName.length - 2);
                    // Array of
                    if (typeof type === "string") {
                        // primitive type
                        definition.properties.push({
                            kind: "PRIMITIVE",
                            name: stripedPropName,
                            sourceName: propName,
                            description: type,
                            type: toPrimitiveType(type),
                            isArray: true,
                        });
                    } else if (type instanceof ComplexTypeElement) {
                        // TODO: Finish complex type parsing by updating node-soap
                        definition.properties.push({
                            kind: "PRIMITIVE",
                            name: stripedPropName,
                            sourceName: propName,
                            description: "ComplexType are not supported yet",
                            type: "any",
                            isArray: true,
                        });
                        Logger.warn(`Cannot parse ComplexType '${stack.join(".")}.${name}' - using 'any' type`);
                    } else {
                        // With sub-type
                        const visited = findReferenceDefiniton(visitedDefs, type);
                        if (visited) {
                            // By referencing already declared definition, we will avoid circular references
                            definition.properties.push({
                                kind: "REFERENCE",
                                name: stripedPropName,
                                sourceName: propName,
                                ref: visited.definition,
                                isArray: true,
                            });
                        } else {
                            try {
                                const subDefinition = parseDefinition(
                                    parsedWsdl,
                                    options,
                                    stripedPropName,
                                    type,
                                    [...stack, propName],
                                    visitedDefs
                                );
                                definition.properties.push({
                                    kind: "REFERENCE",
                                    name: stripedPropName,
                                    sourceName: propName,
                                    ref: subDefinition,
                                    isArray: true,
                                });
                            } catch (err) {
                                const e = new Error(
                                    `Error while parsing Subdefinition for '${stack.join(".")}.${name}'`
                                );
                                throw e;
                            }
                        }
                    }
                } else if (typeof type === "string") {
                    // primitive type
                    definition.properties.push({
                        kind: "PRIMITIVE",
                        name: propName,
                        sourceName: propName,
                        description: type,
                        type: toPrimitiveType(type),
                        isArray: false,
                    });
                } else if (type instanceof ComplexTypeElement) {
                    // TODO: Finish complex type parsing by updating node-soap
                    definition.properties.push({
                        kind: "PRIMITIVE",
                        name: propName,
                        sourceName: propName,
                        description: "ComplexType are not supported yet",
                        type: "any",
                        isArray: false,
                    });
                    Logger.warn(`Cannot parse ComplexType '${stack.join(".")}.${name}' - using 'any' type`);
                } else {
                    // With sub-type
                    const reference = findReferenceDefiniton(visitedDefs, type);
                    if (reference) {
                        // By referencing already declared definition, we will avoid circular references
                        definition.properties.push({
                            kind: "REFERENCE",
                            name: propName,
                            sourceName: propName,
                            description: "",
                            ref: reference.definition,
                            isArray: false,
                        });
                    } else {
                        try {
                            const subDefinition = parseDefinition(
                                parsedWsdl,
                                options,
                                propName,
                                type,
                                [...stack, propName],
                                visitedDefs
                            );
                            definition.properties.push({
                                kind: "REFERENCE",
                                name: propName,
                                sourceName: propName,
                                ref: subDefinition,
                                isArray: false,
                            });
                        } catch (err) {
                            const e = new Error(`Error while parsing Subdefinition for ${stack.join(".")}.${name}`);
                            throw e;
                        }
                    }
                }
            });
        }
    } else {
        // Empty
    }

    return definition;
}

// TODO: Add logs
// TODO: Add comments for services, ports, methods and client
/**
 * Parse WSDL to domain model `ParsedWsdl`
 * @param wsdlPath - path or url to wsdl file
 */
export async function parseWsdl(wsdlPath: string, options: Partial<ParserOptions>): Promise<ParsedWsdl> {
    const mergedOptions: ParserOptions = {
        ...defaultOptions,
        ...options,
    };
    return new Promise((resolve, reject) => {
        open_wsdl(
            wsdlPath,
            { namespaceArrayElements: false, ignoredNamespaces: ["tns", "targetNamespace", "typeNamespace"] },
            function (err, wsdl) {
                if (err) {
                    return reject(err);
                }
                if (wsdl === undefined) {
                    return reject(new Error("WSDL is undefined"));
                }

                const parsedWsdl = new ParsedWsdl({
                    maxStack: options.maxRecursiveDefinitionName,
                    caseInsensitiveNames: options.caseInsensitiveNames,
                    modelNamePreffix: options.modelNamePreffix,
                    modelNameSuffix: options.modelNameSuffix,
                });
                const filename = path.basename(wsdlPath);
                parsedWsdl.name = changeCase(stripExtension(filename), {
                    pascalCase: true,
                });
                parsedWsdl.wsdlFilename = path.basename(filename);
                parsedWsdl.wsdlPath = path.resolve(wsdlPath);

                const visitedDefinitions: Array<VisitedDefinition> = [];

                const allPorts: Port[] = [];
                const services: Service[] = [];
                for (const [serviceName, service] of Object.entries(wsdl.definitions.services)) {
                    Logger.debug(`Parsing Service ${serviceName}`);
                    const servicePorts: Port[] = []; // TODO: Convert to Array

                    for (const [portName, port] of Object.entries(service.ports)) {
                        Logger.debug(`Parsing Port ${portName}`);
                        const portMethods: Method[] = [];

                        for (const [methodName, method] of Object.entries(port.binding.methods)) {
                            Logger.debug(`Parsing Method ${methodName}`);
                            const methodPath = `${serviceName}.${portName}.${methodName}`;

                            let inputDefinition: Definition | null = null; // default type

                            if (method.input) {
                                const methodInputName = method.input.$name;
                                if (!methodInputName) {
                                    throw new Error(`Method '${methodPath}' doesn't have an input name`);
                                }
                                inputDefinition = createMethodInputDefinition({
                                    methodInputName,
                                    wsdl,
                                    parsedWsdl,
                                    mergedOptions,
                                    visitedDefinitions,
                                });
                                if (!inputDefinition) {
                                    Logger.debug(`Method '${methodPath}' doesn't have any input defined`);
                                }
                            }

                            let outputDefinition: Definition | null = null;

                            if (method.output) {
                                const methodOutputName = method.output.$name;
                                if (!methodOutputName) {
                                    throw new Error(`Method '${methodPath}' doesn't have output name`);
                                }
                                outputDefinition = createMethodOutputDefinition({
                                    methodOutputName,
                                    wsdl,
                                    parsedWsdl,
                                    mergedOptions,
                                    visitedDefinitions,
                                });
                            }

                            const requestParamName = method.input?.$name ?? "request";
                            const camelParamName = changeCase(requestParamName);
                            const portMethod: Method = {
                                name: methodName,
                                paramName: reservedKeywords.includes(camelParamName)
                                    ? `${camelParamName}Param`
                                    : camelParamName,
                                paramDefinition: inputDefinition, // TODO: Use string from generated definition files
                                returnDefinition: outputDefinition, // TODO: Use string from generated definition files
                            };
                            portMethods.push(portMethod);
                        }

                        const servicePort: Port = {
                            name: changeCase(portName, { pascalCase: true }),
                            sourceName: portName,
                            methods: portMethods,
                        };
                        servicePorts.push(servicePort);
                        allPorts.push(servicePort);
                    } // End of Port cycle

                    services.push({
                        name: changeCase(serviceName, { pascalCase: true }),
                        sourceName: serviceName,
                        ports: servicePorts,
                    });
                } // End of Service cycle

                parsedWsdl.services = services;
                parsedWsdl.ports = allPorts;

                return resolve(parsedWsdl);
            }
        );
    });
}

function createMethodInputDefinition(opts: {
    methodInputName: string;
    wsdl: WSDL;
    parsedWsdl: ParsedWsdl;
    mergedOptions: ParserOptions;
    visitedDefinitions: VisitedDefinition[];
}): Definition | null {
    const { methodInputName, wsdl, parsedWsdl, mergedOptions, visitedDefinitions } = opts;
    const inputMessage = wsdl.definitions.messages[methodInputName];
    if (inputMessage.element) {
        // TODO: if `$type` not defined, inline type into function declartion (do not create definition file) - wsimport
        const typeName = inputMessage.element.$type ?? inputMessage.element.$name;
        const type = parsedWsdl.findDefinition(inputMessage.element.$type ?? inputMessage.element.$name);
        return (
            type ??
            parseDefinition(parsedWsdl, mergedOptions, typeName, inputMessage.parts, [typeName], visitedDefinitions)
        );
    } else if (inputMessage.parts) {
        const type = parsedWsdl.findDefinition(methodInputName);
        return (
            type ??
            parseDefinition(
                parsedWsdl,
                mergedOptions,
                methodInputName,
                inputMessage.parts,
                [methodInputName],
                visitedDefinitions
            )
        );
    } else {
        return null;
    }
}

function createMethodOutputDefinition(opts: {
    methodOutputName: string;
    wsdl: WSDL;
    parsedWsdl: ParsedWsdl;
    mergedOptions: ParserOptions;
    visitedDefinitions: VisitedDefinition[];
}): Definition {
    const { methodOutputName, wsdl, parsedWsdl, mergedOptions, visitedDefinitions } = opts;
    const outputMessage = wsdl.definitions.messages[methodOutputName];
    if (outputMessage.element) {
        // TODO: if `$type` not defined, inline type into function declartion (do not create definition file) - wsimport
        const typeName = outputMessage.element.$type ?? outputMessage.element.$name;
        const type = parsedWsdl.findDefinition(typeName);
        return (
            type ??
            parseDefinition(parsedWsdl, mergedOptions, typeName, outputMessage.parts, [typeName], visitedDefinitions)
        );
    } else {
        const type = parsedWsdl.findDefinition(methodOutputName);
        return (
            type ??
            parseDefinition(
                parsedWsdl,
                mergedOptions,
                methodOutputName,
                outputMessage.parts,
                [methodOutputName],
                visitedDefinitions
            )
        );
    }
}
