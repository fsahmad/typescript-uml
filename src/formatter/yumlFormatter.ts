import * as Collections from "typescript-collections";
import { IClassDiagramOptions } from "../classDiagramOptions";
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

    private _outputtedNodes: Collections.Set<string>;

    constructor(options: IClassDiagramOptions) {
        super(options);
        this._outputtedNodes = new Collections.Set<string>();
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

        umlCodeModel.associations.forEach((link) => {
            const reverse = link.reverse();
            let formattedAssociation: string = null;
            if (umlCodeModel.associations.contains(reverse)) {
                if (link.toString().localeCompare(reverse.toString()) < 0) {
                    formattedAssociation = this._formatNode(umlCodeModel.nodes.getValue(link.fromName));
                    formattedAssociation += "-" + this._formatNode(umlCodeModel.nodes.getValue(link.toName)) + "\n";
                }
            } else {
                formattedAssociation = this._formatNode(umlCodeModel.nodes.getValue(link.fromName));
                formattedAssociation += "->" + this._formatNode(umlCodeModel.nodes.getValue(link.toName)) + "\n";
            }

            if (formattedAssociation) {
                yuml += formattedAssociation;
                this._outputtedNodes.add(link.fromName);
                this._outputtedNodes.add(link.toName);
            }
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
            const properties = this._formatProperties(node);
            switch (node.stereotype) {
                case uml.Stereotype.Interface:
                    return `[<<${node.identifier}>>|${properties}]`;
                case uml.Stereotype.Abstract:
                    return `[<<abstract>>;${node.identifier}|${properties}]`;
                default:
                    return `[${node.identifier}|${properties}]`;
            }
        }
    }
    private _formatProperties(node: uml.Class): string {
        const variables = node.variables.values().map((variable) => {
            return this._formatVariable(variable);
        }).join(";");
        const methods = node.methods.values().map((method) => {
            return this._formatMethod(method);
        }).join(";");

        return this._replaceSpecialCharacters(`${variables}|${methods}`);
    }

    private _formatVariable(variable: uml.VariableProperty): string {
        const accessibility = this._formatAccessibility(variable.accessibility);
        let stereotype = "";
        switch (variable.stereotype) {
            case uml.Stereotype.Set:
                stereotype = "<<writeonly>>";
                break;
            case uml.Stereotype.Get:
                stereotype = "<<readonly>>";
                break;
            default:
                break;
        }
        return `${accessibility}${stereotype}${variable.identifier}:${variable.type.text}`;
    }

    private _formatMethod(method: uml.FunctionProperty): string {
        const accessibility = this._formatAccessibility(method.accessibility);
        let returns = "";
        if (method.returnType) {
            returns = `:${method.returnType.text}`;
        }
        const parameters = method.parameters.map((p) => {
            let type = "";
            let initializer = "";
            let questionMark = "";
            if (p.type) {
                type = `:${p.type.text}`;
            }
            if (p.defaultInitializer) {
                initializer = `=${p.defaultInitializer}`;
            } else if (p.optional) {
                questionMark = "?";
            }
            return `${p.identifier}${questionMark}${type}${initializer}`;
        });
        return `${accessibility}${method.identifier}(${parameters.join(",")})${returns}`;
    }

    private _formatAccessibility(accessibility: uml.Accessibility) {
        let result = "";
        switch (accessibility) {
            default:
            case uml.Accessibility.Public:
                result = "+";
                break;
            case uml.Accessibility.Protected:
                result = "#";
                break;
            case uml.Accessibility.Private:
                result = "-";
                break;
        }
        return result;
    }

    private _replaceSpecialCharacters(value: string): string {
        return value
            .replace(/\[/g, "［")
            .replace(/\]/g, "］");
    }
}
