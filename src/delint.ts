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
                break;
            case ts.SyntaxKind.MethodDeclaration:
                this._delintClassMethod(node as ts.MethodDeclaration, umlClass);
                break;
            default:
                ts.forEachChild(node, (n) => { this._delintClassNode(n, umlClass); });
                break;
        }
    }

    private _delintClass(node: ts.ClassDeclaration) {
        const umlClass = new uml.Class(node.name.getText());
        this._umlCodeModel.nodes.setValue(umlClass.identifier, umlClass);

        this._delintHeritageClauses(node.heritageClauses, umlClass);

        ts.forEachChild(node, (n) => { this._delintClassNode(n, umlClass); });
    }

    private _delintInterface(node: ts.InterfaceDeclaration) {
        const umlInterface = new uml.Class(node.name.getText(), uml.Stereotype.Interface);
        this._umlCodeModel.nodes.setValue(umlInterface.identifier, umlInterface);

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

                            const generalization = new uml.Generalization(umlClass.identifier, interfaceName);
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

                            const generalization = new uml.Generalization(umlClass.identifier, parentClassName);
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

    private _delintClassMethod(methodDeclaration: ts.MethodDeclaration, umlClass: uml.Class) {
        const identifier = methodDeclaration.name.getText();

        // Default to public accessibility
        const accessibility = this._delintAccessibilityModifiers(methodDeclaration.modifiers);

        const method = new uml.FunctionProperty(identifier, accessibility);

        if (methodDeclaration.type) {
            method.returnType = this._delintType(methodDeclaration.type);
        }

        methodDeclaration.parameters.forEach((p) => {
            const parameter = new uml.Parameter(p.name.getText());
            parameter.type = this._delintType(p.type);

            if (p.initializer) {
                parameter.defaultInitializer = p.initializer.getText();
                parameter.optional = true;
            }
            if (p.questionToken) {
                parameter.optional = true;
            }

            method.parameters.push(parameter);
        });

        umlClass.methods.setValue(identifier, method);
    }

    private _delintClassProperty(property: ts.PropertyDeclaration, umlClass: uml.Class) {
        const identifier = property.name.getText();

        // Default to public accessibility
        const accessibility = this._delintAccessibilityModifiers(property.modifiers);

        const type = this._delintType(property.type);

        const variable = new uml.VariableProperty(identifier, accessibility, type);

        umlClass.variables.setValue(identifier, variable);
    }

    private _delintAccessibilityModifiers(modifiers: ts.NodeArray<ts.Modifier>) {
        let accessibility = uml.Accessibility.Public;
        if (modifiers) {
            modifiers.forEach((m) => {
                winston.log("debug", "delintClassProperty",
                    { "m.kind": m.kind, "ts.SyntaxKind": ts.SyntaxKind[m.kind] });

                switch (m.kind) {
                    case ts.SyntaxKind.PrivateKeyword:
                        accessibility = uml.Accessibility.Private;
                        break;
                    case ts.SyntaxKind.ProtectedKeyword:
                        accessibility = uml.Accessibility.Protected;
                        break;
                    case ts.SyntaxKind.PublicKeyword:
                        accessibility = uml.Accessibility.Public;
                        break;
                }
            });
        }
        return accessibility;
    }

    private _delintType(typeNode: ts.TypeNode): uml.PrimaryType | uml.UnionOrIntersectionType {
        let type: uml.PrimaryType | uml.UnionOrIntersectionType = null;
        const kind = typeNode ? typeNode.kind : null;

        switch (kind) {
            case ts.SyntaxKind.AnyKeyword:
            case ts.SyntaxKind.NumberKeyword:
            case ts.SyntaxKind.BooleanKeyword:
            case ts.SyntaxKind.StringKeyword:
            case ts.SyntaxKind.SymbolKeyword:
            case ts.SyntaxKind.VoidKeyword:
                type = new uml.PrimaryType(typeNode.getText(), uml.PrimaryTypeKind.PredefinedType);
                break;
            case ts.SyntaxKind.TypeReference:
                type = new uml.PrimaryType(typeNode.getText(), uml.PrimaryTypeKind.TypeReference);
                const typeRef = (typeNode as any) as ts.TypeReference;
                type.typeArguments = this._delintTypeArguments((typeRef.typeArguments as any) as ts.TypeNode[]);
                break;
            case ts.SyntaxKind.TypeLiteral:
                type = new uml.PrimaryType("TypeLiteral", uml.PrimaryTypeKind.ObjectType);
                break;
            case ts.SyntaxKind.TupleType:
                type = new uml.PrimaryType(typeNode.getText(), uml.PrimaryTypeKind.TupleType);
                const tupleType = typeNode as ts.TupleTypeNode;
                type.typeArguments = this._delintTypeArguments(tupleType.elementTypes);
                break;
            case ts.SyntaxKind.ArrayType:
                type = new uml.PrimaryType(typeNode.getText(), uml.PrimaryTypeKind.ArrayType);
                break;
            case ts.SyntaxKind.TypeQuery:
                type = new uml.PrimaryType(typeNode.getText(), uml.PrimaryTypeKind.TypeQuery);
                break;
            case ts.SyntaxKind.ThisType:
                type = new uml.PrimaryType(typeNode.getText(), uml.PrimaryTypeKind.ThisType);
                break;
            case ts.SyntaxKind.UnionType:
                type = new uml.UnionOrIntersectionType(typeNode.getText(), uml.UnionOrIntersectionTypeKind.Union);
                const union = typeNode as ts.UnionOrIntersectionTypeNode;
                type.types = this._delintTypeArguments(union.types);
                break;
            case ts.SyntaxKind.IntersectionType:
                type = new uml.UnionOrIntersectionType(typeNode.getText(),
                    uml.UnionOrIntersectionTypeKind.Intersection);
                const intersection = typeNode as ts.UnionOrIntersectionTypeNode;
                type.types = this._delintTypeArguments(intersection.types);
                break;
            default:
                type = new uml.PrimaryType("any", uml.PrimaryTypeKind.ImplicitAny);
                break;
        }

        return type;
    }

    private _delintTypeArguments(typeArguments: ts.TypeNode[]): uml.Type[] {
        let delintedTypes: uml.Type[] = [];
        if (typeArguments) {
            delintedTypes = typeArguments.map((value) => {
                return this._delintType(value);
            });
        }
        return delintedTypes;
    }
}
