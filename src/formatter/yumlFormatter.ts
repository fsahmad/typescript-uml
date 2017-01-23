import * as uml from "../uml/index";
import {AbstractFormatter} from "./formatter";

export class Formatter extends AbstractFormatter {

    constructor() {
        super();
    }

    public generateClassDiagram(umlProgram: uml.Program): string {
        return "";
    }

}
