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

    constructor() {
        super();
    }

    public generateClassDiagram(umlProgram: uml.Program): string {
        let yuml = "// {type:class}\n";
        umlProgram.nodes.forEach((key, value) => {
            if (value instanceof uml.Class) {
                yuml += `[${value.name}]\n`;
            } else if (value instanceof uml.Interface) {
                yuml += `[<<${value.name}>>]\n`;
            }
        });
        return yuml;
    }

}
