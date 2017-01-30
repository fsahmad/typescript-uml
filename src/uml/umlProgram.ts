import * as Collections from "typescript-collections";
import { UmlAssociation } from "./umlAssociation";
import { UmlClass } from "./umlClass";
import { UmlNode } from "./umlNode";

export type UmlNodeDict = Collections.Dictionary<string, UmlNode>;

export class UmlProgram {

    private _nodes: UmlNodeDict;
    private _associations: UmlAssociation[];

    public get nodes(): UmlNodeDict {
        return this._nodes;
    }

    public set nodes(value: UmlNodeDict) {
        this._nodes = value;
    }

    public get associations(): UmlAssociation[] {
        return this._associations;
    }

    public set associations(value: UmlAssociation[]) {
        this._associations = value;
    }

    constructor() {
        this._nodes = new Collections.Dictionary<string, UmlNode>();
        this._associations = [];
    }
}
