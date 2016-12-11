import { readFileSync } from "fs";
import * as ts from "typescript";
import { Delinter } from "./delint";
import * as uml from "./uml/index";

export class TypeScriptUml {

    public static parseUmlProgram(
        filenames: string[],
        scriptTarget: ts.ScriptTarget = ts.ScriptTarget.ES5): uml.Program {

        let delinter = new Delinter();

        for (let f of filenames) {
            let sourceFile = ts.createSourceFile(f, readFileSync(f).toString(),
                scriptTarget, /*setParentNodes */ true);

            delinter.parse(sourceFile);
        }

        return delinter.umlProgram;
    }

    private constructor() {
        // Static class, don't allow instantiation
    }
}
