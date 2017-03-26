import { Association } from "./association";
import { Stereotype } from "./stereotype";

export class Node {
    private _name: string;
    private _stereotype: Stereotype;

    public get name(): string {
        return this._name;
    }

    public set name(value: string) {
        this._name = value;
    }

    public get stereotype(): Stereotype {
        return this._stereotype;
    }

    public set stereotype(value: Stereotype) {
        this._stereotype = value;
    }

    constructor(name: string, stereotype: Stereotype = Stereotype.None) {
        this._name = name;
        this._stereotype = stereotype;
    }
}
