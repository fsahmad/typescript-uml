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
     * Generate class diagram for uml program data
     *
     * @param {uml.Program} umlProgram Uml program data
     * @returns {string} Class diagram according to format
     *
     * @memberOf Formatter
     */
    public generateClassDiagram(umlProgram: uml.Program): string {
        return "";
    }
}
