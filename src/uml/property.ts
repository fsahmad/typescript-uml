import { Accessibility } from "./accessibility";

export abstract class Property {

    private _identifier: string;
    private _accessibility: Accessibility;
    private _static: boolean;

    public get identifier(): string {
        return this._identifier;
    }

    public set identifier(value: string) {
        this._identifier = value;
    }

    public get accessibility(): Accessibility {
        return this._accessibility;
    }

    public set accessibility(value: Accessibility) {
        this._accessibility = value;
    }

    constructor(identifier: string, accessibility: Accessibility) {
        this._identifier = identifier;
        this._accessibility = accessibility;
    }
}
