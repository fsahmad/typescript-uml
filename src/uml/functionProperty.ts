import { Accessibility } from "./accessibility";
import { Parameter } from "./parameter";
import { Property } from "./property";
import { Stereotype } from "./Stereotype";
import { Type } from "./type";

export class FunctionProperty extends Property {

    private _parameters: Parameter[];
    private _returnType: Type;

    public get parameters(): Parameter[] {
        return this._parameters;
    }

    public set parameters(value: Parameter[]) {
        this._parameters = value;
    }

    public get returnType(): Type {
        return this._returnType;
    }

    public set returnType(value: Type) {
        this._returnType = value;
    }

    constructor(identifier: string, accessibility: Accessibility, stereotype: Stereotype = Stereotype.None) {
        super(identifier, accessibility, stereotype);
        this._parameters = [];
        this._returnType = null;
    }
}
