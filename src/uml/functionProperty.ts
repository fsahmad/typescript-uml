import { Accessibility } from "./accessibility";
import { Property } from "./property";
import { Stereotype } from "./stereotype";

export class FunctionProperty extends Property {

    private _stereotype: Stereotype;

    constructor(name: string, accessibility: Accessibility, stereotype: Stereotype = Stereotype.None) {
        super(name, accessibility);
        this._stereotype = stereotype;
    }
}
