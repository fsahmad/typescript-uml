import * as Collections from "typescript-collections";
import { Node } from "./node";
import { Stereotype } from "./stereotype";

export class Class extends Node {

    private _properties: Collections.Dictionary<string, string>;

    public get properties(): Collections.Dictionary<string, string> {
        return this._properties;
    }

    public set properties(value: Collections.Dictionary<string, string>) {
        this._properties = value;
    }

    constructor(name: string, stereotype: Stereotype = Stereotype.None) {
        super(name, stereotype);
        this._properties = new Collections.Dictionary<string, string>();
    }
}
