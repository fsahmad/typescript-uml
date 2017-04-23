
export class Link {
    private _fromName: string;
    private _toName: string;

    public get fromName(): string {
        return this._fromName;
    }

    public set fromName(value: string) {
        this._fromName = value;
    }

    public get toName(): string {
        return this._toName;
    }

    public set toName(value: string) {
        this._toName = value;
    }

    constructor(fromName: string, toName: string) {
        this._fromName = fromName;
        this._toName = toName;
    }

    public toString(): string {
        return `${this.fromName}->${this.toName}`;
    }
}
