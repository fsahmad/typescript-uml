import * as Collections from "typescript-collections";
import { UmlAssociation } from "./umlAssociation";
import { UmlClass } from "./umlClass";
import { UmlGeneralization } from "./umlGeneralization";
import { UmlNode } from "./umlNode";

export type UmlNodeDict = Collections.Dictionary<string, UmlNode>;

export class UmlProgram {

    private _nodes: UmlNodeDict;
    private _associations: UmlAssociation[];
    private _generalizations: UmlGeneralization[];

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

    public get generalizations(): UmlGeneralization[] {
        return this._generalizations;
    }

    public set generalizations(value: UmlGeneralization[]) {
        this._generalizations = value;
    }

    constructor() {
        this._nodes = new Collections.Dictionary<string, UmlNode>();
        this._associations = [];
        this._generalizations = [];
    }
}
