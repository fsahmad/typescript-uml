import { Link } from "./link";

export class Association extends Link {

    constructor(fromName: string, toName: string) {
        super(fromName, toName);
    }
}
