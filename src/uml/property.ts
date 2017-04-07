import { Accessibility } from "./accessibility";

export abstract class Property {

    private _name: string;
    private _accessibility: Accessibility;
    private _static: boolean;

    public get name(): string {
        return this._name;
    }

    public set name(value: string) {
        this._name = value;
    }

    public get accessibility(): Accessibility {
        return this._accessibility;
    }

    public set accessibility(value: Accessibility) {
        this._accessibility = value;
    }

    constructor(name: string, accessibility: Accessibility) {
        this._name = name;
        this._accessibility = accessibility;
    }
}
