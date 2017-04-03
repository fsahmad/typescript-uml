import { readFileSync } from "fs";
import * as ts from "typescript";
import * as uuid from "uuid";
import * as winston from "winston";

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
        winston.log("debug", "delintNode", { "node.kind": node.kind, "ts.SyntaxKind": ts.SyntaxKind[node.kind] });
        switch (node.kind) {
            case ts.SyntaxKind.ClassDeclaration:
                this._delintClass(node as ts.ClassDeclaration);
                break;
            case ts.SyntaxKind.InterfaceDeclaration:
                this._delintInterface(node as ts.InterfaceDeclaration);
                break;
            default:
                ts.forEachChild(node, (n) => { this._delintNode(n); });
                break;
        }
    }

    private _delintClassNode(node: ts.Node, umlClass: uml.Class) {
        winston.log("debug", "delintClassNode", { "node.kind": node.kind, "ts.SyntaxKind": ts.SyntaxKind[node.kind] });
        switch (node.kind) {
            case ts.SyntaxKind.PropertyDeclaration:
                this._delintClassProperty(node as ts.PropertyDeclaration, umlClass);
            default:
                ts.forEachChild(node, (n) => { this._delintClassNode(n, umlClass); });
                break;
        }
    }

    private _delintClass(node: ts.ClassDeclaration) {
        const umlClass = new uml.Class(node.name.getText());
        this._umlCodeModel.nodes.setValue(umlClass.name, umlClass);

        this._delintHeritageClauses(node.heritageClauses, umlClass);

        ts.forEachChild(node, (n) => { this._delintClassNode(n, umlClass); });
    }

    private _delintInterface(node: ts.InterfaceDeclaration) {
        const umlInterface = new uml.Class(node.name.getText(), uml.Stereotype.Interface);
        this._umlCodeModel.nodes.setValue(umlInterface.name, umlInterface);

        this._delintHeritageClauses(node.heritageClauses, umlInterface);

        ts.forEachChild(node, (n) => { this._delintClassNode(n, umlInterface); });
    }

    private _delintHeritageClauses(heritageClauses: ts.HeritageClause[], umlClass: uml.Class) {
        if (heritageClauses) {
            heritageClauses.forEach((h) => {
                winston.log("debug", "delintHeritageClauses",
                    { "h.token": h.token, "ts.SyntaxKind": ts.SyntaxKind[h.token] });

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

    private _delintClassProperty(property: ts.PropertyDeclaration, umlClass: uml.Class) {
        const identifier = property.name.getText();
        const type = property.type.getText();

        umlClass.properties.setValue(identifier, type);
    }
}
