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
                this._delintClass(node as ts.ClassDeclaration, this._delintClassNode.bind(this));
                break;
            case ts.SyntaxKind.InterfaceDeclaration:
                this._delintClass(node as ts.InterfaceDeclaration, this._delintInterfaceNode.bind(this));
                break;
            default:
                ts.forEachChild(node, (n) => { this._delintNode(n); });
                break;
        }
    }

    private _delintClass(
        node: ts.ClassDeclaration | ts.InterfaceDeclaration,
        delintChild: (child: ts.Node, umlClass: uml.Class) => void,
    ) {
        let stereotype = uml.Stereotype.None;
        if (node.kind === ts.SyntaxKind.InterfaceDeclaration) {
            stereotype = uml.Stereotype.Interface;
        }
        const umlClass = new uml.Class(node.name.getText(), stereotype);

        this._umlCodeModel.nodes.setValue(umlClass.identifier, umlClass);

        this._delintHeritageClauses(node.heritageClauses, umlClass);

        ts.forEachChild(node, (n) => { delintChild(n, umlClass); });
    }

    private _delintClassNode(node: ts.Node, umlClass: uml.Class) {
        switch (node.kind) {
            case ts.SyntaxKind.PropertyDeclaration:
                this._delintProperty(node as ts.PropertyDeclaration, umlClass);
                break;
            case ts.SyntaxKind.GetAccessor:
            case ts.SyntaxKind.SetAccessor:
                this._delintClassGetterSetter(node as ts.GetAccessorDeclaration | ts.SetAccessorDeclaration, umlClass);
                break;
            case ts.SyntaxKind.MethodDeclaration:
                this._delintMethod(node as ts.MethodDeclaration, umlClass);
                break;
            default:
                ts.forEachChild(node, (n) => { this._delintClassNode(n, umlClass); });
                break;
        }
    }

    private _delintInterfaceNode(node: ts.Node, umlClass: uml.Class) {
        switch (node.kind) {
            case ts.SyntaxKind.PropertySignature:
                this._delintProperty(node as ts.PropertySignature, umlClass);
                break;
            case ts.SyntaxKind.MethodSignature:
                this._delintMethod(node as ts.MethodDeclaration, umlClass);
                break;
            default:
                ts.forEachChild(node, (n) => { this._delintClassNode(n, umlClass); });
                break;
        }
    }

    private _delintHeritageClauses(heritageClauses: ts.HeritageClause[], umlClass: uml.Class) {
        if (heritageClauses) {
            heritageClauses.forEach((h) => {
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
                            this._umlCodeModel.generalizations.add(generalization);
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
                            this._umlCodeModel.generalizations.add(generalization);
                        });
                        break;
                    /* istanbul ignore next: default case never reached */
                    default:
                        break;
                }
            });
        }
    }

    private _delintMethod(methodDeclaration: ts.MethodDeclaration | ts.MethodSignature, umlClass: uml.Class) {
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

        method.optional = methodDeclaration.questionToken !== undefined;

        umlClass.methods.setValue(identifier, method);
    }

    private _delintClassGetterSetter(node: ts.GetAccessorDeclaration | ts.SetAccessorDeclaration, umlClass: uml.Class) {
        const identifier = node.name.getText();

        // Default to public accessibility
        const accessibility = this._delintAccessibilityModifiers(node.modifiers);

        let type: uml.Type;
        if (node.kind === ts.SyntaxKind.GetAccessor) {
            type = this._delintType(node.type);
        } else {
            if (node.parameters.length > 0) {
                type = this._delintType(node.parameters[0].type);
            }
        }

        const variable = new uml.VariableProperty(identifier, accessibility, type);

        // Set stereotype based on kind
        const existingVariable = umlClass.variables.getValue(identifier);
        let stereotype: uml.Stereotype;
        if (node.kind === ts.SyntaxKind.GetAccessor) {
            // If a setter already exists, use stereotype GetSet
            stereotype = (existingVariable && existingVariable.stereotype === uml.Stereotype.Set) ?
                uml.Stereotype.GetSet :
                stereotype = uml.Stereotype.Get;
        } else {
            // If a setter already exists, use stereotype GetSet
            stereotype = (existingVariable && existingVariable.stereotype === uml.Stereotype.Get) ?
                uml.Stereotype.GetSet :
                uml.Stereotype.Set;
        }

        variable.stereotype = stereotype;

        umlClass.variables.setValue(identifier, variable);

        this._typeAssociations(umlClass.identifier, type).forEach((a) => {
            this.umlCodeModel.associations.add(a);
        });
    }

    private _delintProperty(property: ts.PropertyDeclaration | ts.PropertySignature, umlInterface: uml.Class) {
        const identifier = property.name.getText();

        // Default to public accessibility
        const accessibility = this._delintAccessibilityModifiers(property.modifiers);

        const type = this._delintType(property.type);

        const variable = new uml.VariableProperty(identifier, accessibility, type);

        variable.optional = property.questionToken !== undefined;

        umlInterface.variables.setValue(identifier, variable);

        this._typeAssociations(umlInterface.identifier, type).forEach((a) => {
            this.umlCodeModel.associations.add(a);
        });
    }

    private _delintAccessibilityModifiers(modifiers: ts.NodeArray<ts.Modifier>) {
        let accessibility = uml.Accessibility.Public;
        if (modifiers) {
            modifiers.forEach((m) => {
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
                const typeReference = typeNode as ts.TypeReferenceNode;
                type = new uml.PrimaryType(typeReference.getText(), uml.PrimaryTypeKind.TypeReference);
                type.name = typeReference.typeName.getText();
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

    private _typeAssociations(from: string, type: uml.Type): uml.Association[] {
        // Add association to type
        let associations: uml.Association[] = [];
        if (type) {
            if (type instanceof uml.PrimaryType || type instanceof uml.UnionOrIntersectionType) {
                switch (type.kind) {
                    case uml.PrimaryTypeKind.TypeReference:
                        associations = [new uml.Association(from, type.name)];
                    // Fall through to process potential (generic) type arguments
                    case uml.PrimaryTypeKind.ArrayType:
                    case uml.PrimaryTypeKind.TupleType:
                        (type as uml.PrimaryType).typeArguments.forEach((t) => {
                            associations = associations.concat(this._typeAssociations(from, t));
                        });
                        break;
                    case uml.UnionOrIntersectionTypeKind.Union:
                    case uml.UnionOrIntersectionTypeKind.Intersection:
                        (type as uml.UnionOrIntersectionType).types.forEach((t) => {
                            associations = associations.concat(this._typeAssociations(from, t));
                        });
                        break;
                    default:
                        // Do not produce associations
                        break;
                }
            }
        }
        return associations;
    }
}
