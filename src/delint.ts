import { readFileSync } from "fs";
import * as ts from "typescript";
import * as uml from "./uml/index";

export class Delinter {

    private _umlProgram: uml.Program;

    public get umlProgram(): uml.Program {
        return this._umlProgram;
    }

    constructor() {
        this._umlProgram = new uml.Program();
    }

    public parse(file: ts.SourceFile) {
        this._delintNode(file);
    }

    private _delintNode(node: ts.Node) {
        switch (node.kind) {
            case ts.SyntaxKind.ClassDeclaration:
                const classNode = node as ts.ClassDeclaration;
                const umlClass = new uml.Class();
                umlClass.name = classNode.name.getText();
                this._umlProgram.classes.setValue(umlClass.name, umlClass);
                break;
            default:
                break;
        }
        ts.forEachChild(node, (n) => { this._delintNode(n); });
    }
}
