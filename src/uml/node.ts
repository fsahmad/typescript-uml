import { Association } from "./association";
import { Stereotype } from "./stereotype";

export class Node {
    private _identifier: string;
    private _stereotype: Stereotype;

    public get identifier(): string {
        return this._identifier;
    }

    public set identifier(value: string) {
        this._identifier = value;
    }

    public get stereotype(): Stereotype {
        return this._stereotype;
    }

    public set stereotype(value: Stereotype) {
        this._stereotype = value;
    }

    constructor(identifier: string, stereotype: Stereotype = Stereotype.None) {
        this._identifier = identifier;
        this._stereotype = stereotype;
    }
}
