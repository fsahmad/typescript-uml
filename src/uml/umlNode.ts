
export class UmlNode {
    private _name: string;

    public get name(): string {
        return this._name;
    }

    public set name(value: string) {
        this._name = value;
    }

    constructor(name: string) {
        this._name = name;
    }
}
