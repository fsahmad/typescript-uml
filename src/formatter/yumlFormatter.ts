import { Set } from "typescript-collections";
import * as uml from "../uml/index";
import { AbstractFormatter } from "./formatter";

/**
 * yUML Formatter
 *
 * https://yuml.me/diagram/scruffy/class/samples
 *
 * @export
 * @class Formatter
 * @extends {AbstractFormatter}
 */
export class Formatter extends AbstractFormatter {

    private _outputtedNodes: Set<string>;

    constructor() {
        super();
        this._outputtedNodes = new Set<string>();
    }

    public generateClassDiagram(umlCodeModel: uml.CodeModel): string {
        let yuml = "// {type:class}\n";
        this._outputtedNodes.clear();

        umlCodeModel.generalizations.forEach((value) => {
            yuml += this._formatNode(umlCodeModel.nodes.getValue(value.toName));
            yuml += "^" + this._formatNode(umlCodeModel.nodes.getValue(value.fromName)) + "\n";
            this._outputtedNodes.add(value.fromName);
            this._outputtedNodes.add(value.toName);
        });

        umlCodeModel.nodes.forEach((key, value) => {
            if (!this._outputtedNodes.contains(key)) {
                yuml += this._formatNode(value) + "\n";
            }
        });
        return yuml;
    }

    private _formatNode(node: uml.Node): string {

        if (node instanceof uml.Class) {
            let properties = this._formatProperties(node);
            if (properties !== "") {
                properties = "|" + properties;
            }
            switch (node.stereotype) {
                case uml.Stereotype.Interface:
                    return `[<<${node.name}>>${properties}]`;
                default:
                    return `[${node.name}${properties}]`;
            }
        }
    }

    private _formatProperties(node: uml.Class): string {
        const properties: string[] = [];
        node.variables.forEach((identifier, variable) => {
            const escapedType = this._replaceSpecialCharacters(variable.type.text);
            properties.push(`${identifier}:${escapedType}`);
        });
        return properties.join(";");
    }

    private _replaceSpecialCharacters(value: string): string {
        return value
            .replace(/\[/g, "［")
            .replace(/\]/g, "］");
    }
}
