import * as Collections from "typescript-collections";
import { Node } from "./node";
import { Stereotype } from "./stereotype";
import { VariableProperty } from "./variableProperty";

export class Class extends Node {

    private _variables: Collections.Dictionary<string, VariableProperty>;

    public get variables(): Collections.Dictionary<string, VariableProperty> {
        return this._variables;
    }

    public set variables(value: Collections.Dictionary<string, VariableProperty>) {
        this._variables = value;
    }

    constructor(name: string, stereotype: Stereotype = Stereotype.None) {
        super(name, stereotype);
        this._variables = new Collections.Dictionary<string, VariableProperty>();
    }
}
