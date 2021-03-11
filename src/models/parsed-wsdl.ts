export type DefinitionProperty = {
    name: string;
    sourceName: string;
    description?: string;
    kind: "PRIMITIVE";
    isArray?: boolean;
    type: string;
} | {
    name: string;
    sourceName: string;
    description?: string;
    /**
     * This is very information to know, because
     * you can avoid circular references with this
     */
    kind: "REFERENCE";
    isArray?: boolean;
    ref: Definition;
};

export interface Definition {
    name: string;
    sourceName: string;
    description?: string;
    properties: Array<DefinitionProperty>;
}

export interface Method {
    name: string;
    paramName: string;
    paramDefinition: Definition;
    returnDefinition: Definition;
}

export interface Port {
    name: string;
    sourceName: string;
    description?: string;
    methods: Array<Method>;
}

export interface Service {
    name: string;
    sourceName: string;
    description?: string;
    ports: Array<Port>;
}

export class ParsedWsdl {
    wsdlFilename: string;
    wsdlPath: string;

    definitions: Array<Definition> = [];
    ports: Array<Port> = [];
    services: Array<Service> = [];

    findDefinition(definitionName: string): Definition {
        return this.definitions.find((def) => def.name === definitionName);
    }

    findNonCollisionDefinitionName(definitionName: string): string {
        if (!this.definitions.find(def => def.name === definitionName)) {
            return definitionName;
        }
        for (let i = 1; i < 20; i++) { // TODO: Unhardcode `20`
            if (!this.definitions.find(def => def.name === `${definitionName}${i}`)) {
                return `${definitionName}${i}`;
            }
        }
        throw new Error(`Out of stack for "${definitionName}", there's probably cyclic definition`);
    }

}