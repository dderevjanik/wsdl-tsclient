import path from "path";
import camelCase from "camelcase";
import { ImportDeclarationStructure, MethodSignatureStructure, OptionalKind, Project, PropertySignatureStructure, StructureKind } from "ts-morph";
import { Definition, Method, ParsedWsdl } from "./models/parsed-wsdl";

function createProperty(name: string, type: string, doc: string, isArray: boolean, optional = true): PropertySignatureStructure {
    return {
        kind: StructureKind.PropertySignature,
        name: camelCase(name),
        docs: [doc],
        hasQuestionToken: true,
        type: isArray ? `Array<${type}>` : type
    };
}

/**
 * @return definitionName (filename) of generated definition
 */
function generateDefinitionFile(project: Project, definition: Definition, defDir: string, stack: string[], generated: Set<Definition>): void {
    const defName = camelCase(definition.name, { pascalCase: true });
    const defFilePath = path.join(defDir, `${defName}.ts`);
    const defFile = project.createSourceFile(defFilePath, "", { overwrite: true });

    generated.add(definition);

    const definitionImports: OptionalKind<ImportDeclarationStructure>[] = [];
    const definitionProperties: PropertySignatureStructure[] = [];
    for (const prop of definition.properties) {
        if (prop.kind === "PRIMITIVE") { // e.g. string
            definitionProperties.push(createProperty(prop.name, prop.type, prop.description, prop.isArray));
        } else if (prop.kind === "REFERENCE") { // e.g. Items
            if (!generated.has(prop.ref)) {
                // Wasn't generated yet
                generateDefinitionFile(project, prop.ref, defDir, [...stack, prop.ref.name], generated);
            }
            definitionImports.push({ moduleSpecifier: `./${prop.ref.name}`, namedImports: [{ name: prop.ref.name }] });
            definitionProperties.push(createProperty(prop.name, prop.ref.name, prop.sourceName, prop.isArray));
        }
    }

    defFile.addImportDeclarations(definitionImports);
    defFile.addStatements([{
        leadingTrivia: writer => writer.newLine(),
        isExported: true,
        name: defName,
        kind: StructureKind.Interface,
        properties: definitionProperties
    }]);
    defFile.saveSync();
    console.debug(`Created Definition file: ${path.join(defDir, defName)}`);
}

export async function generate(parsedWsdl: ParsedWsdl, outDir: string): Promise<void> {
    const project = new Project();

    const portsDir = path.join(outDir, "ports");
    const servicesDir = path.join(outDir, "services");
    const defDir = path.join(outDir, "definitions");

    const allMethods: Method[] = [];
    const allDefintions = new Set<Definition>();

    const clientImports: Array<OptionalKind<ImportDeclarationStructure>> = [];
    const clientServices: Array<OptionalKind<PropertySignatureStructure>> = [];
    for (const service of parsedWsdl.services) {
        const serviceFilePath = path.join(servicesDir, `${service.name}.ts`);
        const serviceFile = project.createSourceFile(serviceFilePath, "", { overwrite: true });

        const serviceImports: Array<OptionalKind<ImportDeclarationStructure>> = [];
        const servicePorts: Array<OptionalKind<PropertySignatureStructure>> = [];
        for (const port of parsedWsdl.ports) {
            const portFilePath = path.join(portsDir, `${port.name}.ts`);
            const portFile = project.createSourceFile(portFilePath, "", { overwrite: true });

            const portImports: Array<OptionalKind<ImportDeclarationStructure>> = [];
            const portFileMethods: Array<OptionalKind<MethodSignatureStructure>> = [];
            for (const method of port.methods) {
                if (!allDefintions.has(method.paramDefinition)) {
                    generateDefinitionFile(project, method.paramDefinition, defDir, [method.paramDefinition.name], allDefintions);
                }
                if (!allDefintions.has(method.returnDefinition)) {
                    generateDefinitionFile(project, method.returnDefinition, defDir, [method.returnDefinition.name], allDefintions);
                }
                // TODO: Deduplicate PortMethods
                allMethods.push(method);
                // TODO: Deduplicate imports
                clientImports.push({ moduleSpecifier: `./definitions/${method.paramDefinition.name}`, namedImports: [{ name: method.paramDefinition.name }]});
                clientImports.push({ moduleSpecifier: `./definitions/${method.returnDefinition.name}`, namedImports: [{ name: method.returnDefinition.name }]});
                // TODO: Deduplicate imports
                portImports.push({ moduleSpecifier: path.join("..", defDir, method.paramDefinition.name), namedImports: [{ name: method.paramDefinition.name }] });
                portImports.push({ moduleSpecifier: path.join("..", defDir, method.returnDefinition.name), namedImports: [{ name: method.returnDefinition.name }] });
                portFileMethods.push({
                    name: method.paramName,
                    parameters: [{ name: method.paramName, type: method.paramDefinition.name }],
                    returnType: method.returnDefinition.name
                });
            } // End of PortMethod
            serviceImports.push({ moduleSpecifier: path.join("..", "ports", port.name), namedImports: [{ name: port.name }]});
            servicePorts.push({ name: port.name, isReadonly: true, type: port.name });
            portFile.addImportDeclarations(portImports);
            portFile.addStatements([
                {
                    leadingTrivia: writer => writer.newLine(),
                    isExported: true,
                    kind: StructureKind.Interface,
                    name: port.name,
                    methods: portFileMethods
                }
            ]);
            portFile.saveSync();
        } // End of Port

        clientImports.push({ moduleSpecifier: `./services/${service.name}`, namedImports: [{ name: service.name }]});
        clientServices.push({ name: service.name, type: service.name });

        serviceFile.addImportDeclarations(serviceImports);
        serviceFile.addStatements([
            {
                leadingTrivia: writer => writer.newLine(),
                isExported: true,
                kind: StructureKind.Interface,
                name: service.name,
                properties: servicePorts
            }
        ]);
        serviceFile.saveSync();
    } // End of Service

    const clientFilePath = path.join(outDir, "client.ts");
    const clientFile = project.createSourceFile(clientFilePath, "", { overwrite: true });
    clientFile.addImportDeclaration({
        moduleSpecifier: "soap",
        namedImports: [
            { name: "Client", alias: "SoapClient" },
            { name: "createClientAsync", alias: "soapCreateClientAsync" }
        ],
    });
    clientFile.addImportDeclarations(clientImports);
    clientFile.addStatements([
        {
            leadingTrivia: writer => writer.newLine(),
            isExported: true,
            kind: StructureKind.Interface,
            // docs: [`${parsedWsdl.name}Client`],
            name: `${parsedWsdl.name}Client`,
            properties: clientServices,
            methods: allMethods.map<OptionalKind<MethodSignatureStructure>>(method => ({
                name: `${method.name}Async`,
                parameters: [{
                    name: method.paramName,
                    type: method.paramDefinition.name
                }],
                returnType: `Promise<${method.returnDefinition.name}>`
            }))
        }
    ]);
    const createClientDeclaration = clientFile.addFunction({
        name: "createClientAsync",
        docs: [`Create ${parsedWsdl.name}Client`],
        isExported: true,
        parameters: [{
            isRestParameter: true,
            name: "args",
            type: "Parameters<typeof soapCreateClientAsync>"
        }],
        returnType: `Promise<SoapClient & ${parsedWsdl.name}Client>` // TODO: `any` keyword is very dangerous
    });
    createClientDeclaration.setBodyText("return soapCreateClientAsync(args[0], args[1], args[2]) as any;");
    clientFile.saveSync();
}