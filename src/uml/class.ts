import * as Collections from "typescript-collections";
import { FunctionProperty } from "./functionProperty";
import { Node } from "./node";
import { Stereotype } from "./stereotype";
import { VariableProperty } from "./variableProperty";

export class Class extends Node {

    private _methods: Collections.Dictionary<string, FunctionProperty>;
    private _variables: Collections.Dictionary<string, VariableProperty>;

    public get methods(): Collections.Dictionary<string, FunctionProperty> {
        return this._methods;
    }

    public set methods(value: Collections.Dictionary<string, FunctionProperty>) {
        this._methods = value;
    }

    public get variables(): Collections.Dictionary<string, VariableProperty> {
        return this._variables;
    }

    public set variables(value: Collections.Dictionary<string, VariableProperty>) {
        this._variables = value;
    }

    constructor(name: string, stereotype: Stereotype = Stereotype.None) {
        super(name, stereotype);
        this._methods = new Collections.Dictionary<string, FunctionProperty>();
        this._variables = new Collections.Dictionary<string, VariableProperty>();
    }
}
