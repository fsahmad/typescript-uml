import { Accessibility } from "./accessibility";
import { Property } from "./property";
import { Stereotype } from "./Stereotype";
import { Type } from "./type";

/**
 * Member variable property declaration
 *
 * @export
 * @class VariableProperty
 * @extends {Property}
 */
export class VariableProperty extends Property {

    private _type: Type;

    /**
     * Type of the variable
     *
     * @type {Type}
     * @memberOf VariableProperty
     */
    public get type(): Type {
        return this._type;
    }

    public set type(value: Type) {
        this._type = value;
    }

    /**
     * Creates an instance of VariableProperty.
     * @param {string} identifier Variable identifier
     * @param {Accessibility} accessibility Member accessibility
     * @param {Type} type Type of the variableÎ
     *
     * @memberOf VariableProperty
     */
    constructor(
        identifier: string,
        accessibility: Accessibility,
        type: Type,
        stereotype: Stereotype = Stereotype.None,
    ) {
        super(identifier, accessibility, stereotype);
        this._type = type;
    }
}
