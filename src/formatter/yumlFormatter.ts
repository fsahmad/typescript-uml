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
            return `[${node.name}]`;
        } else if (node instanceof uml.Interface) {
            return `[<<${node.name}>>]`;
        }
    }
}
