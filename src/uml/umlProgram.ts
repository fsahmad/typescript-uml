import * as Collections from "typescript-collections";
import { UmlAssociation } from "./umlAssociation";
import { UmlClass } from "./umlClass";

export type UmlClassDict = Collections.Dictionary<string, UmlClass>;

export class UmlProgram {

    private _classes: UmlClassDict;
    private _associations: UmlAssociation[];

    public get classes(): UmlClassDict {
        return this._classes;
    }

    public set classes(value: UmlClassDict) {
        this._classes = value;
    }

    public get associations(): UmlAssociation[] {
        return this._associations;
    }

    public set associations(value: UmlAssociation[]) {
        this._associations = value;
    }

    constructor() {
        this._classes = new Collections.Dictionary<string, UmlClass>();
        this._associations = [];
    }
}
