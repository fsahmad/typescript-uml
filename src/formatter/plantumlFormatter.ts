import * as uml from "../uml/index";
import { AbstractFormatter } from "./formatter";

/**
 * PlantUML Formatter
 *
 * http://plantuml.com
 *
 * @export
 * @class Formatter
 * @extends {AbstractFormatter}
 */
export class Formatter extends AbstractFormatter {

    public generateClassDiagram(umlCodeModel: uml.CodeModel): string {
        let content: string;
        content = this._formatNodes(umlCodeModel);
        content += "\n";
        content += this._formatLinks(umlCodeModel);
        if (this.options.plantuml.diagramTags) {
            return `@startuml\n${content}\n@enduml\n`;
        } else {
            return content;
        }
    }

    private _formatNodes(umlCodeModel: uml.CodeModel): string {
        const content: string[] = [];
        umlCodeModel.nodes.forEach((key, node) => {
            if (node instanceof uml.Class) {
                const properties = this._formatProperties(node);

                switch (node.stereotype) {
                    case uml.Stereotype.Interface:
                        content.push(`interface ${node.identifier}{\n${properties}\n}\n`);
                        break;
                    case uml.Stereotype.None:
                    default:
                        content.push(`class ${node.identifier}{\n${properties}\n}\n`);
                        break;
                }
            }
        });

        return content.join("\n");
    }

    private _formatProperties(node: uml.Class): string {
        const properties: string[] = [];
        node.variables.forEach((key, variable) => {
            properties.push(this._formatVariable(variable));
        });
        node.methods.forEach((key, method) => {
            properties.push(this._formatMethod(method));
        });
        return properties.join("\n");
    }

    private _formatVariable(variable: uml.VariableProperty): string {
        const accessibility = this._formatAccessibility(variable.accessibility);
        return `  ${accessibility}${variable.identifier} : ${variable.type.text}`;
    }

    private _formatMethod(method: uml.FunctionProperty): string {
        const accessibility = this._formatAccessibility(method.accessibility);
        let returns = "";
        if (method.returnType) {
            returns = `: ${method.returnType.text}`;
        }
        const parameters = method.parameters.map((p) => {
            let type = "";
            let initializer = "";
            let questionMark = "";
            if (p.type) {
                type = `: ${p.type.text}`;
            }
            if (p.defaultInitializer) {
                initializer = ` = ${p.defaultInitializer}`;
            } else if (p.optional) {
                questionMark = "?";
            }
            return `${p.identifier}${questionMark}${type}${initializer}`;
        });
        return `  ${accessibility}${method.identifier}(${parameters.join(", ")})${returns}`;
    }

    private _formatLinks(umlCodeModel: uml.CodeModel): string {
        const content: string[] = [];
        umlCodeModel.associations.forEach((link) => {
            const reverse = link.reverse();
            if (umlCodeModel.associations.contains(reverse)) {
                if (link.toString().localeCompare(reverse.toString()) < 0) {
                    content.push(`${link.fromName} -- ${link.toName}`);
                }
            } else {
                content.push(`${link.fromName} --> ${link.toName}`);
            }
        });

        umlCodeModel.generalizations.forEach((link) => {
            content.push(`${link.toName} <|-- ${link.fromName}`);
        });

        return content.join("\n");
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
}
