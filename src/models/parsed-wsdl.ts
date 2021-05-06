import sanitizeFilename from "sanitize-filename";

export type DefinitionProperty =
    | {
          name: string;
          sourceName: string;
          description?: string;
          kind: "PRIMITIVE";
          isArray?: boolean;
          type: string;
      }
    | {
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
    docs: string[];
    properties: Array<DefinitionProperty>;
}

export interface Method {
    name: string;
    paramName: string;
    paramDefinition: null | Definition;
    returnDefinition: null | Definition;
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

const MAX_STACK = 30;

export class ParsedWsdl {
    /**
     * Name is always uppercased filename of wsdl without an extension.
     * Used to generate client name of interface
     * @example "MyClient"
     */
    name: string;
    /** Original wsdl filename */
    wsdlFilename: string;
    /** Absolute basepath or url */
    wsdlPath: string;

    definitions: Array<Definition> = [];
    ports: Array<Port> = [];
    services: Array<Service> = [];

    /** Find definition by it's name */
    findDefinition(definitionName: string): Definition {
        return this.definitions.find((def) => def.name === definitionName);
    }

    /** To make every definition's name unique. If definition with same name exists, suffix it with incremented number */
    findNonCollisionDefinitionName(defName: string): string {
        const definitionName = sanitizeFilename(defName);
        if (!this.definitions.find((def) => def.name.toLowerCase() === definitionName.toLowerCase())) {
            return definitionName;
        }
        for (let i = 1; i < MAX_STACK; i++) {
            if (!this.definitions.find((def) => def.name.toLowerCase() === `${definitionName.toLowerCase()}${i}`)) {
                return `${definitionName}${i}`;
            }
        }
        throw new Error(`Out of stack (${MAX_STACK}) for "${definitionName}", there's probably cyclic definition`);
    }
}
