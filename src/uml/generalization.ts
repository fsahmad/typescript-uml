import { Link } from "./link";

export class Generalization extends Link {

    constructor(fromName: string, toName: string) {
        super(fromName, toName);
    }

    public toString(): string {
        return `Generalization(${super.toString()})`;
    }
}
