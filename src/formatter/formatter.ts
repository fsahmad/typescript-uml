import * as uml from "../uml/index";

/**
 * Abstract uml file formatter
 *
 * @export
 * @class AbstractFormatter
 */
export class AbstractFormatter {

    constructor() {
        // Constructor
    }

    /**
     * Generate class diagram for uml code model data
     *
     * @param {uml.CodeModel} umlCodeModel Uml code model data
     * @returns {string} Class diagram according to format
     *
     * @memberOf Formatter
     */
    public generateClassDiagram(umlCodeModel: uml.CodeModel): string {
        return "";
    }
}
