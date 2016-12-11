import * as Collections from "typescript-collections";
import { UmlAssociation } from "./umlAssociation";
import { UmlClass } from "./umlClass";

// export type Collections.Dictionary<string, UmlClass> = Collections.Dictionary<string, UmlClass>;

export class UmlProgram {

    private _classes: Collections.Dictionary<string, UmlClass>;
    private _associations: UmlAssociation[];

    public get classes(): Collections.Dictionary<string, UmlClass> {
        return this._classes;
    }

    public set classes(value: Collections.Dictionary<string, UmlClass>) {
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
