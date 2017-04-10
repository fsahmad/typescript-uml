
/**
 * Parser options
 *
 * @export
 * @interface IParseOptions
 */
export interface IParseOptions {
    /**
     * Include patterns. If defined, overrides the tsconfig's include property.
     *
     * @type {string[]}
     * @memberOf IParseOptions
     */
    include?: string[];

    /**
     * Exclude patterns. If defined, adds to the tsconfig's exclude property.
     *
     * @type {string[]}
     * @memberOf IParseOptions
     */
    exclude?: string[];

    /**
     * Path to typescript config (if not specified, searches for tsconfig.json)
     *
     * @type {string}
     * @memberOf IParseOptions
     */
    tsconfig?: string;
}
