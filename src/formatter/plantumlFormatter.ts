import { Set } from "typescript-collections";
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
        return `@startuml\n${content}\n@enduml\n`;
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
            let accessibility = "";
            switch (variable.accessibility) {
                default:
                case uml.Accessibility.Public:
                    accessibility = "+";
                    break;
                case uml.Accessibility.Protected:
                    accessibility = "#";
                    break;
                case uml.Accessibility.Private:
                    accessibility = "-";
                    break;
            }
            properties.push(`  ${accessibility}${variable.identifier} : ${variable.type.text}`);
        });
        return properties.join("\n");
    }

    private _formatLinks(umlCodeModel: uml.CodeModel): string {
        const content: string[] = [];
        umlCodeModel.generalizations.forEach((link) => {
            content.push(`${link.toName} <|-- ${link.fromName}`);
        });

        return content.join("\n");
    }
}
