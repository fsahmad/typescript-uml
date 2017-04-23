import * as Collections from "typescript-collections";
import { Association } from "./association";
import { Generalization } from "./generalization";
import { Node } from "./node";

export type NodeDict = Collections.Dictionary<string, Node>;

export class CodeModel {

    private _nodes: NodeDict;
    private _associations: Collections.Set<Association>;
    private _generalizations: Collections.Set<Generalization>;

    public get nodes(): NodeDict {
        return this._nodes;
    }

    public set nodes(value: NodeDict) {
        this._nodes = value;
    }

    public get associations(): Collections.Set<Association> {
        return this._associations;
    }

    public set associations(value: Collections.Set<Association>) {
        this._associations = value;
    }

    public get generalizations(): Collections.Set<Generalization> {
        return this._generalizations;
    }

    public set generalizations(value: Collections.Set<Generalization>) {
        this._generalizations = value;
    }

    constructor() {
        this._nodes = new Collections.Dictionary<string, Node>();
        this._associations = new Collections.Set<Association>();
        this._generalizations = new Collections.Set<Generalization>();
    }
}
