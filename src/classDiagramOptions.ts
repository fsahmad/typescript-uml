
/**
 * Class diagram generator options
 *
 * @export
 * @interface IClassDiagramOptions
 */
export interface IClassDiagramOptions {
    /**
     * Formatter to use to generate diagram
     *
     * @type {"yuml"}
     * @memberOf IClassDiagramOptions
     */
    formatter?: "yuml" | "plantuml";

    /**
     * Options for nodes
     *
     * @type {{
     *         include?: string[];
     *         exclude?: string[];
     *     }}
     * @memberOf IClassDiagramOptions
     */
    nodes?: {
        /**
         * Nodes to exclude.
         *
         * If specified, nodes matching the exclude will not be added to the diagram, nor will
         * nodes linked to them be added (unless linked to a non-excluded node).
         *
         * @type {string[]}
         */
        exclude?: string[];

        /**
         * Nodes to include.
         *
         * If specified, only the nodes matching the include will be used as starting points
         * to search for the nodes to add to the diagram.
         *
         * @type {string[]}
         */
        include?: string[];

        // depth?: number;
    };

    /**
     * PlantUML specific options, only used when formatter is set to plantuml
     *
     * @memberof IClassDiagramOptions
     */
    plantuml?: {

        /**
         * Output @startuml/@enduml diagram tags?
         *
         * @type {boolean}
         */
        diagramTags?: boolean;
    };
}
