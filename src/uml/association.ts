import { Link } from "./link";

export class Association extends Link {

    constructor(fromName: string, toName: string) {
        super(fromName, toName);
    }

    public reverse(): Association {
        return new Association(this.toName, this.fromName);
    }

    public toString(): string {
        return `Association(${super.toString()})`;
    }
}
