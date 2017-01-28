import * as uml from "../uml/index";
import {AbstractFormatter} from "./formatter";

export class Formatter extends AbstractFormatter {

    constructor() {
        super();
    }

    public generateClassDiagram(umlProgram: uml.Program): string {
        let yuml = "// {type:class}\n";
        umlProgram.classes.forEach((key, value) => {
            yuml += `[${value.name}]\n`;
        });
        return yuml;
    }

}
