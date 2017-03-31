import * as uml from "../uml/index";

/**
 * Abstract uml file formatter
 *
 * @export
 * @class AbstractFormatter
 */
export abstract class AbstractFormatter {

    /**
     * Generate class diagram for uml code model data
     *
     * @param {uml.CodeModel} umlCodeModel Uml code model data
     * @returns {string} Class diagram according to format
     *
     * @memberOf Formatter
     */
    public abstract generateClassDiagram(umlCodeModel: uml.CodeModel): string;
}
