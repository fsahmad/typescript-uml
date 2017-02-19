import { readFileSync } from "fs";
import * as ts from "typescript";
import { Delinter } from "./delint";
import * as formatter from "./formatter/index";
import * as uml from "./uml/index";

export interface ITypeScriptUmlOptions {
    formatter?: "yuml";
}

export class TypeScriptUml {

    public static parseUmlProgram(
        filenames: string[],
        scriptTarget: ts.ScriptTarget = ts.ScriptTarget.ES5): uml.Program {

        const delinter = new Delinter();

        for (const f of filenames) {
            const sourceFile = ts.createSourceFile(f, readFileSync(f).toString(),
                scriptTarget, /*setParentNodes */ true);

            delinter.parse(sourceFile);
        }

        return delinter.umlProgram;
    }

    public static generateClassDiagram(program: uml.Program, options?: ITypeScriptUmlOptions): string {
        let _formatter: formatter.AbstractFormatter = null;
        const defaultOptions: ITypeScriptUmlOptions = {
            formatter: "yuml",
        };

        if (!options) {
            options = {};
        }

        if (!options.hasOwnProperty("formatter")) {
            options.formatter = defaultOptions.formatter;
        }

        switch (options.formatter) {
            case "yuml":
                _formatter = new formatter.YumlFormatter();
                break;
            default:
                throw new Error(`Unknown formatter ${options.formatter}`);
        }
        return _formatter.generateClassDiagram(program);
    }

    private constructor() {
        // Static class, don't allow instantiation
    }
}
