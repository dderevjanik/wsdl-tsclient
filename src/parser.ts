import camelCase from "camelcase";
import * as path from "path";
import { ComplexTypeElement } from "soap/lib/wsdl/elements";
import { open_wsdl } from "soap/lib/wsdl/index";
import { Definition, Method, ParsedWsdl, Port, Service } from "./models/parsed-wsdl";
import { stripExtension } from "./utils/file";
import { reservedKeywords } from "./utils/javascript";
import { Logger } from "./utils/logger";

interface ParserOptions {
    modelNamePreffix: string;
    modelNameSuffix: string;
}

const defaultOptions: ParserOptions = {
    modelNamePreffix: "",
    modelNameSuffix: ""
};

type VisitedDefinition = {
    name: string;
    parts: object;
    definition: Definition;
};

function findReferenceDefiniton(visited: Array<VisitedDefinition>, definitionParts: object) {
    return visited.find((def) => def.parts === definitionParts);
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
    const defName = camelCase(name, { pascalCase: true });
    Logger.debug(`Parsing Definition ${stack.join(".")}.${name}`);

    let nonCollisionDefName: string;
    try {
        nonCollisionDefName = parsedWsdl.findNonCollisionDefinitionName(defName);
    } catch (err) {
        const e = new Error(`Error for finding non-collision definition name for ${stack.join(".")}.${name}`);
        e.stack.split('\n').slice(0,2).join('\n') + '\n' + err.stack;
        throw e;
    }
    const definition: Definition = {
        name: `${options.modelNamePreffix}${camelCase(nonCollisionDefName, { pascalCase: true })}${options.modelNameSuffix}`,
        sourceName: name,
        docs: [name],
        properties: [],
        description: "",
    };
    visitedDefs.push({ name: definition.name, parts: defParts, definition }); // NOTE: cache reference to this defintion globally (for avoiding circular references)
    if (defParts) {
        // NOTE: `node-soap` has sometimes problem with parsing wsdl files, it includes `defParts.undefined = undefined`
        if (("undefined" in defParts) && (defParts.undefined === undefined)) {
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
                            type: "string",
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
                            isArray: true
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
                                const e = new Error(`Error while parsing Subdefinition for '${stack.join(".")}.${name}'`);
                                e.stack.split('\n').slice(0,2).join('\n') + '\n' + err.stack;
                                throw e;
                            }
                        }
                    }
                } else {
                    if (typeof type === "string") {
                        // primitive type
                        definition.properties.push({
                            kind: "PRIMITIVE",
                            name: propName,
                            sourceName: propName,
                            description: type,
                            type: "string",
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
                            isArray: false
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
                                e.stack.split('\n').slice(0,2).join('\n') + '\n' + err.stack;
                                throw e;
                            }
                        }
                    }
                }
            });
        }
    } else {
    }

    parsedWsdl.definitions.push(definition);

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
        ...options
    };
    return new Promise((resolve, reject) => {
        open_wsdl(wsdlPath, function (err, wsdl) {
            if (err) {
                return reject(err);
            }
            if (wsdl === undefined) {
                return reject(new Error("WSDL is undefined"));
            }

            const parsedWsdl = new ParsedWsdl();
            const filename = path.basename(wsdlPath);
            parsedWsdl.name = camelCase(stripExtension(filename), {
                pascalCase: true,
            });
            parsedWsdl.wsdlFilename = path.basename(filename);
            parsedWsdl.wsdlPath = path.resolve(wsdlPath);

            const visitedDefinitions: Array<VisitedDefinition> = [];

            const allMethods: Method[] = [];
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

                        // TODO: Deduplicate code below by refactoring it to external function. Is it even possible ?
                        let paramName = "request";
                        let inputDefinition: Definition = null; // default type
                        if (method.input) {
                            if (method.input.$name) {
                                paramName = method.input.$name;
                            }
                            const inputMessage = wsdl.definitions.messages[method.input.$name];
                            if (inputMessage.element) {
                                // TODO: if `$type` not defined, inline type into function declartion (do not create definition file) - wsimport
                                const typeName = inputMessage.element.$type ?? inputMessage.element.$name;
                                const type = parsedWsdl.findDefinition(
                                    inputMessage.element.$type ?? inputMessage.element.$name
                                );
                                inputDefinition = type
                                    ? type
                                    : parseDefinition(
                                          parsedWsdl,
                                          mergedOptions,
                                          typeName,
                                          inputMessage.parts,
                                          [typeName],
                                          visitedDefinitions
                                      );
                            } else if (inputMessage.parts) {
                                const type = parsedWsdl.findDefinition(paramName);
                                inputDefinition = type
                                    ? type
                                    : parseDefinition(
                                          parsedWsdl,
                                          mergedOptions,
                                          paramName,
                                          inputMessage.parts,
                                          [paramName],
                                          visitedDefinitions
                                      );
                            } else {
                                Logger.debug(`Method '${serviceName}.${portName}.${methodName}' doesn't have any input defined`);
                            }
                        }

                        let outputDefinition: Definition = null; // default type, `{}` or `unknown` ?
                        if (method.output) {
                            const outputMessage = wsdl.definitions.messages[method.output.$name];
                            if (outputMessage.element) {
                                // TODO: if `$type` not defined, inline type into function declartion (do not create definition file) - wsimport
                                const typeName = outputMessage.element.$type ?? outputMessage.element.$name;
                                const type = parsedWsdl.findDefinition(typeName);
                                outputDefinition = type
                                    ? type
                                    : parseDefinition(
                                          parsedWsdl,
                                          mergedOptions,
                                          typeName,
                                          outputMessage.parts,
                                          [typeName],
                                          visitedDefinitions
                                      );
                            } else {
                                const type = parsedWsdl.findDefinition(paramName);
                                outputDefinition = type
                                    ? type
                                    : parseDefinition(
                                          parsedWsdl,
                                          mergedOptions,
                                          paramName,
                                          outputMessage.parts,
                                          [paramName],
                                          visitedDefinitions
                                      );
                            }
                        }

                        const camelParamName = camelCase(paramName);
                        const portMethod: Method = {
                            name: methodName,
                            paramName: reservedKeywords.includes(camelParamName)
                                ? `${camelParamName}Param`
                                : camelParamName,
                            paramDefinition: inputDefinition, // TODO: Use string from generated definition files
                            returnDefinition: outputDefinition, // TODO: Use string from generated definition files
                        };
                        portMethods.push(portMethod);
                        allMethods.push(portMethod);
                    }

                    const servicePort: Port = {
                        name: camelCase(portName, { pascalCase: true }),
                        sourceName: portName,
                        methods: portMethods,
                    };
                    servicePorts.push(servicePort);
                    allPorts.push(servicePort);
                } // End of Port cycle

                services.push({
                    name: camelCase(serviceName, { pascalCase: true }),
                    sourceName: serviceName,
                    ports: servicePorts,
                });
            } // End of Service cycle

            parsedWsdl.services = services;
            parsedWsdl.ports = allPorts;

            return resolve(parsedWsdl);
        });
    });
}
