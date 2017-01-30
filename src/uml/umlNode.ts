
export class UmlNode {
    private _name: string;
    private _uuid: string;

    public get name(): string {
        return this._name;
    }

    public set name(value: string) {
        this._name = value;
    }

    public get uuid(): string {
        return this._uuid;
    }

    constructor(uuid: string, name: string) {
        this._uuid = uuid;
        this._name = name;
    }
}
