import { Accessibility } from "./accessibility";
import { Stereotype } from "./stereotype";

export abstract class Property {

    private _identifier: string;
    private _accessibility: Accessibility;
    private _static: boolean;
    private _stereotype: Stereotype;

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

    public get static(): boolean {
        return this._static;
    }

    public set static(value: boolean) {
        this._static = value;
    }

    public get stereotype(): Stereotype {
        return this._stereotype;
    }

    public set stereotype(value: Stereotype) {
        this._stereotype = value;
    }

    constructor(identifier: string, accessibility: Accessibility, stereotype: Stereotype = Stereotype.None) {
        this._identifier = identifier;
        this._accessibility = accessibility;
        this._stereotype = stereotype;
        this._static = false;
    }
}
