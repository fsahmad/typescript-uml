
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

    constructor() {
        this._fromName = null;
        this._toName = null;
    }
}
