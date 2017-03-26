import { readFileSync } from "fs";
import * as ts from "typescript";
import * as uuid from "uuid";
import * as uml from "./uml/index";

export class Delinter {

    private _umlCodeModel: uml.CodeModel;

    /**
     * Uml code model description filled by the parse method(s)
     *
     * @readonly
     * @type {uml.CodeModel}
     * @memberOf Delinter
     */
    public get umlCodeModel(): uml.CodeModel {
        return this._umlCodeModel;
    }

    constructor() {
        this._umlCodeModel = new uml.CodeModel();
    }

    /**
     * Delint a TypeScript source file, adding the parsed elements to umlCodeModel.
     *
     * @param {ts.SourceFile} file TypeScript source file
     *
     * @memberOf Delinter
     */
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
        this._umlCodeModel.nodes.setValue(umlClass.name, umlClass);

        if (node.heritageClauses) {
            node.heritageClauses.forEach((h) => {
                switch (h.token) {
                    case ts.SyntaxKind.ImplementsKeyword:
                        h.types.forEach((t) => {
                            const interfaceName = t.expression.getText();
                            // Add interface to CodeModel if not exists
                            if (!this._umlCodeModel.nodes.containsKey(interfaceName)) {
                                const umlInterface = new uml.Class(interfaceName, uml.Stereotype.Interface);
                                this._umlCodeModel.nodes.setValue(interfaceName, umlInterface);
                            }

                            const generalization = new uml.Generalization(umlClass.name, interfaceName);
                            this._umlCodeModel.generalizations.push(generalization);
                        });
                        break;
                    case ts.SyntaxKind.ExtendsKeyword:
                        h.types.forEach((t) => {
                            const parentClassName = t.expression.getText();
                            // Add interface to CodeModel if not exists
                            if (!this._umlCodeModel.nodes.containsKey(parentClassName)) {
                                const umlParentClass = new uml.Class(parentClassName);
                                this._umlCodeModel.nodes.setValue(parentClassName, umlParentClass);
                            }

                            const generalization = new uml.Generalization(umlClass.name, parentClassName);
                            this._umlCodeModel.generalizations.push(generalization);
                        });
                        break;
                    /* istanbul ignore next: default case never reached */
                    default:
                        break;
                }
            });
        }
    }

    private _delintInterfaceDeclaration(node: ts.InterfaceDeclaration) {
        const umlInterface = new uml.Class(node.name.getText(), uml.Stereotype.Interface);
        this._umlCodeModel.nodes.setValue(umlInterface.name, umlInterface);
    }

}
