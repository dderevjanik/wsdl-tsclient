import camelCase from "camelcase";
import * as path from "path";
import { open_wsdl } from "soap/lib/wsdl/index";
import { Definition, Method, ParsedWsdl, Port, Service } from "./models/parsed-wsdl";
import { timeElapsed } from "./utils/timer";

// TODO: Avoid this
type VisitedDefinition = { name: string; parts: object; definition: Definition; };

function findReferenceDefiniton(visited: Array<VisitedDefinition>, definitionParts: object) {
    return visited.find(def => def.parts === definitionParts);
}

// TODO: Use blacklist
const propertiesBlaclist = [
    "targetNSAlias",
    "targetNamespace"
];

/**
 * parse definition
 * @param parsedWsdl context of parsed wsdl
 * @param name name of definition
 * @param defParts definition's parts (its properties from wsdl)
 * @param stack definition stack (for deep objects) (immutable)
 * @param visitedDefs set of visited definition (mutable)
 */
function parseDefinition(parsedWsdl: ParsedWsdl, name: string, defParts: { [propNameType: string]: any }, stack: string[], visitedDefs: Array<VisitedDefinition>): Definition {
    const defName = camelCase(name, { pascalCase: true });

    const definition: Definition = {
        name: parsedWsdl.findNonCollisionDefinitionName(defName),
        sourceName: defName,
        properties: [],
        description: ""
    };
    visitedDefs.push({ name: definition.name, parts: defParts, definition }); // NOTE: cache reference to this defintion globally (for avoiding circular references)

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
                        definition.properties.push({ kind: "PRIMITIVE", name: stripedPropName, sourceName: propName, type: "string", isArray: true });
                    } else {
                        // With sub-type
                        const visited = findReferenceDefiniton(visitedDefs, type);
                        if (visited) {
                            // By referencing already declared definition, we will avoid circular references
                            definition.properties.push({ kind: "REFERENCE", name: stripedPropName, sourceName: propName, ref: visited.definition, isArray: true });
                        } else {
                            const subDefinition = parseDefinition(parsedWsdl, stripedPropName, type, [...stack, propName], visitedDefs);
                            definition.properties.push({ kind: "REFERENCE", name: stripedPropName, sourceName: propName, ref: subDefinition, isArray: true });
                        }
                    }
                } else {
                    if (typeof type === "string") {
                        // primitive type
                        definition.properties.push({ kind: "PRIMITIVE", name: propName, sourceName: propName, type: "string", isArray: false });
                    } else {
                        // With sub-type
                        const reference = findReferenceDefiniton(visitedDefs, type);
                        if (reference) {
                            // By referencing already declared definition, we will avoid circular references
                            definition.properties.push({ kind: "REFERENCE", name: propName, sourceName: propName, ref: reference.definition, isArray: false });
                        } else {
                            const subDefinition = parseDefinition(parsedWsdl, propName, type, [...stack, propName], visitedDefs);
                            definition.properties.push({ kind: "REFERENCE", name: propName, sourceName: propName, ref: subDefinition, isArray: false });
                        }
                    }
                }
            });
        }
    } else {
        // TODO: Doesn't have parts :(
    }

    parsedWsdl.definitions.push(definition);

    return definition;
}

// TODO: Add logs
// TODO: Add comments for services, ports, methods and client
export async function parseWsdl(name: string, wsdlPath: string, outDir: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const timeParseXml = process.hrtime();
        open_wsdl(wsdlPath, function (err, wsdl) {
            if (err) {
                return reject(err);
            }
            console.debug(`WSDL Parse Time: ${timeElapsed(process.hrtime(timeParseXml))}ms`);
            if (wsdl === undefined) {
                return reject(new Error("WSDL is undefined"));
            }

            wsdl.describeServices();

            const timeParseWsdl = process.hrtime();
            const parsedWsdl = new ParsedWsdl();

            const visitedDefinitions: Array<VisitedDefinition> = [];

            const allMethods: Method[] = [];
            const allPorts: Port[] = [];
            const services: Service[] = [];
            for (const [serviceName, service] of Object.entries(wsdl.definitions.services)) {
                const servicePorts: Port[] = []; // TODO: Convert to Array

                for (const [portName, port] of Object.entries(service.ports)) { // [SI_ManageOrder_O]
                    const portMethods: Method[] = [];

                    for (const [methodName, method] of Object.entries(port.binding.methods)) { // [O_CustomerChange]

                        // TODO: Deduplicate code below by refactoring it to external function. Is it possible ?
                        let paramName = "request";
                        let inputDefinition: Definition = null; // default
                        if (method.input) {
                            if (method.input.$name) {
                                paramName = method.input.$name;
                            }
                            const inputMessage = wsdl.definitions.messages[method.input.$name];
                            if (inputMessage.element) {
                                // TODO: if $type not defined, inline type into function declartion
                                const typeName = inputMessage.element.$type ?? inputMessage.element.$name;
                                console.log(inputMessage.element.$minOccurs);
                                console.log(inputMessage.element.$maxOccurs);
                                const type = parsedWsdl.findDefinition(inputMessage.element.$type ?? inputMessage.element.$name);
                                inputDefinition = type
                                    ? type
                                    : parseDefinition(parsedWsdl, typeName, inputMessage.parts, [typeName], visitedDefinitions);
                            }
                        }

                        let outputDefinition: Definition = null; // default type
                        if (method.output) {
                            const outputMessage = wsdl.definitions.messages[method.output.$name];
                            if (outputMessage.element) {
                                // TODO: if input doesn't have $type, use $name for definition file
                                const typeName = outputMessage.element.$type ?? outputMessage.element.$name;
                                console.log(outputMessage.element.$minOccurs);
                                console.log(outputMessage.element.$maxOccurs);
                                const type = parsedWsdl.findDefinition(typeName);
                                outputDefinition = type
                                    ? type
                                    : parseDefinition(parsedWsdl, typeName, outputMessage.parts, [typeName], visitedDefinitions);
                            }
                        }

                        const portMethod: Method = {
                            name: methodName,
                            paramName: camelCase(paramName),
                            paramDefinition: inputDefinition, // TODO: Use string from generated definition files
                            returnDefinition: outputDefinition // TODO: Use string from generated definition files
                        };
                        portMethods.push(portMethod);
                        allMethods.push(portMethod);
                    }

                    const servicePort: Port = {
                        name: camelCase(portName, { pascalCase: true }),
                        sourceName: portName,
                        methods: portMethods
                    };
                    servicePorts.push(servicePort);
                    allPorts.push(servicePort);
                } // End of Port cycle

                services.push({
                    name: camelCase(serviceName),
                    sourceName: serviceName,
                    ports: servicePorts
                });
            } // End of Service cycle
            parsedWsdl.services = services;
            parsedWsdl.ports = allPorts;
            console.debug(`Generatation time: ${timeElapsed(process.hrtime(timeParseWsdl))}ms`);
            console.debug(`Created Client file: ${path.join(outDir, "Client.ts")}`);
            return resolve();
        });

    });
}
