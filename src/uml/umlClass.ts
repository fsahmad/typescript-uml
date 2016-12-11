
export class UmlClass {

    private _name: string;

    public get name(): string {
        return this._name;
    }

    public set name(value: string) {
        this._name = value;
    }

    constructor() {
        // constructor
        this._name = "";
    }
}
