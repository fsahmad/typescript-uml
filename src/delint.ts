import { readFileSync } from "fs";
import * as ts from "typescript";
import * as uuid from "uuid";
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
                this._delintClassDeclaration(node as ts.ClassDeclaration);
                break;
            case ts.SyntaxKind.InterfaceDeclaration:
                this._delintInterfaceDeclaration(node as ts.InterfaceDeclaration);
                break;
            default:
                break;
        }
        ts.forEachChild(node, (n) => { this._delintNode(n); });
    }

    private _delintClassDeclaration(node: ts.ClassDeclaration) {
        const umlClass = new uml.Class(node.name.getText());
        this._umlProgram.nodes.setValue(umlClass.name, umlClass);

        node.heritageClauses.forEach((h) => {
            switch (h.token) {
                case ts.SyntaxKind.ImplementsKeyword:
                    h.types.forEach((t) => {
                        const interfaceName = t.expression.getText();
                        // Add interface to program if not exists
                        if (!this._umlProgram.nodes.containsKey(interfaceName)) {
                            const umlInterface = new uml.Interface(interfaceName);
                            this._umlProgram.nodes.setValue(interfaceName, umlInterface);
                        }

                        const association = new uml.Association();
                        association.fromName = umlClass.name;
                        association.toName = interfaceName;
                        this._umlProgram.associations.push(association);
                    });
                    break;
                default:
                    break;
            }
        });
    }

    private _delintInterfaceDeclaration(node: ts.InterfaceDeclaration) {
        const umlInterface = new uml.Interface(node.name.getText());
        this._umlProgram.nodes.setValue(umlInterface.name, umlInterface);
    }

}
