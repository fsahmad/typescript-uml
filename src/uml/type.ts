
/**
 * Abstract type specification class
 *
 * @export
 * @abstract
 * @class Type
 */
export abstract class Type {
    private _text: string;

    /**
     * Type element full text
     *
     * @type {string}
     * @memberOf Type
     */
    public get text(): string {
        return this._text;
    }

    public set text(value: string) {
        this._text = value;
    }

    /**
     * Creates an instance of Type.
     * @param {string} text Type element full text
     *
     * @memberOf Type
     */
    protected constructor(text: string) {
        this._text = text;
    }
}
