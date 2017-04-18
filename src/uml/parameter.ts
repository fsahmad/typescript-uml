import { Type } from "./type";

export class Parameter {
    private _identifier: string;
    private _type: Type;
    private _optional: boolean;
    private _defaultInitializer: string;

    public get identifier(): string {
        return this._identifier;
    }

    public set identifier(value: string) {
        this._identifier = value;
    }

    public get type(): Type {
        return this._type;
    }

    public set type(value: Type) {
        this._type = value;
    }

    public get optional(): boolean {
        return this._optional;
    }

    public set optional(value: boolean) {
        this._optional = value;
    }

    public get defaultInitializer(): string {
        return this._defaultInitializer;
    }

    public set defaultInitializer(value: string) {
        this._defaultInitializer = value;
    }

    constructor(identifier: string) {
        this._identifier = identifier;
        this._type = null;
        this._optional = false;
        this._defaultInitializer = null;
    }
}
