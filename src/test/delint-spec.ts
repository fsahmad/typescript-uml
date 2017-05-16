import * as chai from "chai";
import { readFileSync } from "fs";
import "mocha";
import * as sinon from "sinon";
import * as ts from "typescript";

import { Delinter } from "../delint";
import * as uml from "../uml";

const expect = chai.expect;

describe("Delinter", () => {
    let sourceFile: ts.SourceFile;
    let delinter: Delinter;

    function getSourceFile(filename: string) {
        return ts.createCompilerHost({
            allowUnreachableCode: true,
            alwaysStrict: false,
            module: ts.ModuleKind.CommonJS,
            moduleResolution: ts.ModuleResolutionKind.NodeJs,
            noEmitOnError: false,
            noImplicitAny: false,
        }, true).getSourceFile(filename,
            ts.ScriptTarget.ES5,
            (message) => {
                // tslint:disable-next-line:no-console
                console.log(message);
            });
    }

    describe("#parse", () => {
        const TEST_FILE_CLASS = "testInput/delint/class.test.ts";
        const TEST_FILE_CLASS_ASSOCIATION = "testInput/delint/classAssociation.test.ts";
        const TEST_FILE_CLASS_HERITAGE = "testInput/delint/classHeritage.test.ts";
        const TEST_FILE_CLASS_MEMBER_VARIABLES = "testInput/delint/classMemberVariables.test.ts";
        const TEST_FILE_CLASS_MEMBER_FUNCTIONS = "testInput/delint/classMemberFunctions.test.ts";
        const TEST_FILE_INTERFACE = "testInput/delint/interface.test.ts";

        describe("given class.test.ts", () => {
            before(() => {
                sourceFile = getSourceFile(TEST_FILE_CLASS);
            });

            beforeEach(() => {
                delinter = new Delinter();
            });

            it("should add class to uml code model", () => {
                delinter.parse(sourceFile);
                expect(delinter.umlCodeModel.nodes.containsKey("Foo")).to.be.true;
                expect(delinter.umlCodeModel.nodes.getValue("Foo")).to.be.instanceof(uml.Class);
            });

            it("should replace existing definition of same class", () => {
                const classBar = new uml.Class("Foo");
                delinter.umlCodeModel.nodes.setValue("Foo", classBar);

                delinter.parse(sourceFile);
                expect(delinter.umlCodeModel.nodes.getValue("Foo")).not.to.equal(classBar);
            });
        });

        describe("given classHeritage.test.ts", () => {
            before(() => {
                sourceFile = getSourceFile(TEST_FILE_CLASS_HERITAGE);
            });

            beforeEach(() => {
                delinter = new Delinter();
            });

            it("should add class to uml code model", () => {
                delinter.parse(sourceFile);
                expect(delinter.umlCodeModel.nodes.containsKey("Foo")).to.be.true;
                expect(delinter.umlCodeModel.nodes.getValue("Foo")).to.be.instanceof(uml.Class);
            });

            it("should add interfaces to uml code model", () => {
                delinter.parse(sourceFile);
                expect(delinter.umlCodeModel.nodes.containsKey("IBar")).to.be.true;
                expect(delinter.umlCodeModel.nodes.containsKey("IFoo")).to.be.true;
                expect(delinter.umlCodeModel.nodes.getValue("IBar")).to.be.instanceof(uml.Class);
                expect(delinter.umlCodeModel.nodes.getValue("IBar").stereotype).to.equal(uml.Stereotype.Interface);
                expect(delinter.umlCodeModel.nodes.getValue("IFoo")).to.be.instanceof(uml.Class);
                expect(delinter.umlCodeModel.nodes.getValue("IFoo").stereotype).to.equal(uml.Stereotype.Interface);
            });

            it("should not replace existing interfaces", () => {
                const interfaceIBar = new uml.Class("IBar", uml.Stereotype.Interface);
                delinter.umlCodeModel.nodes.setValue("IBar", interfaceIBar);

                delinter.parse(sourceFile);
                expect(delinter.umlCodeModel.nodes.getValue("IBar")).to.equal(interfaceIBar);
            });

            it("should add interface generalizations to uml code model", () => {
                delinter.parse(sourceFile);
                expect(delinter.umlCodeModel.generalizations.contains(
                    new uml.Generalization("Foo", "IBar"))).to.be.true;
                expect(delinter.umlCodeModel.generalizations.contains(
                    new uml.Generalization("Foo", "IFoo"))).to.be.true;
            });

            it("should add parent class to uml code model", () => {
                delinter.parse(sourceFile);
                expect(delinter.umlCodeModel.nodes.containsKey("Bar")).to.be.true;
                expect(delinter.umlCodeModel.nodes.getValue("Bar")).to.be.instanceof(uml.Class);
            });

            it("should replace existing definition of same class", () => {
                const classBar = new uml.Class("Foo");
                delinter.umlCodeModel.nodes.setValue("Foo", classBar);

                delinter.parse(sourceFile);
                expect(delinter.umlCodeModel.nodes.getValue("Foo")).not.to.equal(classBar);
            });

            it("should not replace existing classes", () => {
                const classBar = new uml.Class("Bar");
                delinter.umlCodeModel.nodes.setValue("Bar", classBar);

                delinter.parse(sourceFile);
                expect(delinter.umlCodeModel.nodes.getValue("Bar")).to.equal(classBar);
            });

            it("should add extension generalizations to uml code model", () => {
                delinter.parse(sourceFile);
                expect(delinter.umlCodeModel.generalizations.contains(
                    new uml.Generalization("Foo", "Bar"))).to.be.true;
            });
        });

        describe("given interface.test.ts", () => {
            before(() => {
                sourceFile = getSourceFile(TEST_FILE_INTERFACE);
            });

            beforeEach(() => {
                delinter = new Delinter();
            });

            it("should add interface to uml code model", () => {
                delinter.parse(sourceFile);
                expect(delinter.umlCodeModel.nodes.containsKey("IBar")).to.be.true;
            });
        });

        describe("given classMemberVariables.test.ts", () => {
            before(() => {
                sourceFile = getSourceFile(TEST_FILE_CLASS_MEMBER_VARIABLES);
            });

            beforeEach(() => {
                delinter = new Delinter();
            });

            it("should add variables with correct accessibility to code model", () => {
                delinter.parse(sourceFile);

                const node = delinter.umlCodeModel.nodes.getValue("Foo") as uml.Class;
                expect(node.variables.getValue("_predefinedType"))
                    .to.have.property("accessibility", uml.Accessibility.Private);
                expect(node.variables.getValue("protectedVariable"))
                    .to.have.property("accessibility", uml.Accessibility.Protected);
                expect(node.variables.getValue("publicVariable"))
                    .to.have.property("accessibility", uml.Accessibility.Public);
                expect(node.variables.getValue("implicitPublicVariable"))
                    .to.have.property("accessibility", uml.Accessibility.Public);
            });

            it("should add implicit any type to uml code model", () => {
                delinter.parse(sourceFile);

                const node = delinter.umlCodeModel.nodes.getValue("Foo") as uml.Class;
                expect(node.variables.containsKey("_implicitAny")).to.be.true;

                const variable = node.variables.getValue("_implicitAny");
                expect(variable).to.be.instanceOf(uml.VariableProperty);
                expect(variable).to.have.property("identifier", "_implicitAny");
                expect(variable).to.have.property("type").which.is.instanceOf(uml.PrimaryType);
                expect(variable.type).to.have.property("text", "any");
                expect(variable.type).to.have.property("kind", uml.PrimaryTypeKind.ImplicitAny);
            });

            it("should add predefined type to uml code model", () => {
                delinter.parse(sourceFile);

                const node = delinter.umlCodeModel.nodes.getValue("Foo") as uml.Class;
                expect(node.variables.containsKey("_predefinedType")).to.be.true;

                const variable = node.variables.getValue("_predefinedType");
                expect(variable).to.be.instanceOf(uml.VariableProperty);
                expect(variable).to.have.property("identifier", "_predefinedType");
                expect(variable).to.have.property("type").which.is.instanceOf(uml.PrimaryType);
                expect(variable.type).to.have.property("text", "number");
                expect(variable.type).to.have.property("kind", uml.PrimaryTypeKind.PredefinedType);
            });

            it("should add type reference type to uml code model", () => {
                delinter.parse(sourceFile);

                const node = delinter.umlCodeModel.nodes.getValue("Foo") as uml.Class;
                expect(node.variables.containsKey("_typeReference")).to.be.true;

                const variable = node.variables.getValue("_typeReference");
                expect(variable).to.be.instanceOf(uml.VariableProperty);
                expect(variable).to.have.property("identifier", "_typeReference");
                expect(variable).to.have.property("type").which.is.instanceOf(uml.PrimaryType);
                expect(variable.type).to.have.property("text", "Bar");
                expect(variable.type).to.have.property("kind", uml.PrimaryTypeKind.TypeReference);
                expect(variable.type)
                    .to.have.property("typeArguments")
                    .with.length(0, "Non-generic type reference shouldn't have type arguments");
            });

            it("should add generic type reference type to uml code model", () => {
                delinter.parse(sourceFile);

                const node = delinter.umlCodeModel.nodes.getValue("Foo") as uml.Class;
                expect(node.variables.containsKey("_genericTypeReference")).to.be.true;

                const variable = node.variables.getValue("_genericTypeReference");
                expect(variable).to.be.instanceOf(uml.VariableProperty);
                expect(variable).to.have.property("identifier", "_genericTypeReference");
                expect(variable).to.have.property("type").which.is.instanceOf(uml.PrimaryType);
                expect(variable.type).to.have.property("text", "TBar<string, number>");
                expect(variable.type).to.have.property("kind", uml.PrimaryTypeKind.TypeReference);
                expect(variable.type)
                    .to.have.property("typeArguments")
                    .with.length(2, "Generic type reference should have two type arguments");
                const typeArgs = (variable.type as uml.PrimaryType).typeArguments;
                expect(typeArgs[0])
                    .to.be.instanceOf(uml.PrimaryType)
                    .and.to.have.property("text", "string");
                expect(typeArgs[1])
                    .to.be.instanceOf(uml.PrimaryType)
                    .and.to.have.property("text", "number");
            });

            it("should add object type to uml code model", () => {
                delinter.parse(sourceFile);

                const node = delinter.umlCodeModel.nodes.getValue("Foo") as uml.Class;
                expect(node.variables.containsKey("_objectType")).to.be.true;

                const variable = node.variables.getValue("_objectType");
                expect(variable).to.be.instanceOf(uml.VariableProperty);
                expect(variable).to.have.property("identifier", "_objectType");
                expect(variable).to.have.property("type").which.is.instanceOf(uml.PrimaryType);
                expect(variable.type).to.have.property("text", "TypeLiteral");
                expect(variable.type).to.have.property("kind", uml.PrimaryTypeKind.ObjectType);
            });

            it("should add array type to uml code model", () => {
                delinter.parse(sourceFile);

                const node = delinter.umlCodeModel.nodes.getValue("Foo") as uml.Class;
                expect(node.variables.containsKey("_arrayType")).to.be.true;

                const variable = node.variables.getValue("_arrayType");
                expect(variable).to.be.instanceOf(uml.VariableProperty);
                expect(variable).to.have.property("identifier", "_arrayType");
                expect(variable).to.have.property("type").which.is.instanceOf(uml.PrimaryType);
                expect(variable.type).to.have.property("text", "number[]");
                expect(variable.type).to.have.property("kind", uml.PrimaryTypeKind.ArrayType);
            });

            it("should add tuple type to uml code model", () => {
                delinter.parse(sourceFile);

                const node = delinter.umlCodeModel.nodes.getValue("Foo") as uml.Class;
                expect(node.variables.containsKey("_tupleType")).to.be.true;

                const variable = node.variables.getValue("_tupleType");
                expect(variable).to.be.instanceOf(uml.VariableProperty);
                expect(variable).to.have.property("identifier", "_tupleType");
                expect(variable).to.have.property("type").which.is.instanceOf(uml.PrimaryType);
                expect(variable.type).to.have.property("text", "[number, string, Bar]");
                expect(variable.type).to.have.property("kind", uml.PrimaryTypeKind.TupleType);
                expect(variable.type)
                    .to.have.property("typeArguments")
                    .with.length(3, "Tuple type should have three type arguments");
                const typeArgs = (variable.type as uml.PrimaryType).typeArguments;
                expect(typeArgs[0])
                    .to.be.instanceOf(uml.PrimaryType)
                    .and.to.have.property("text", "number");
                expect(typeArgs[1])
                    .to.be.instanceOf(uml.PrimaryType)
                    .and.to.have.property("text", "string");
                expect(typeArgs[2])
                    .to.be.instanceOf(uml.PrimaryType)
                    .and.to.have.property("text", "Bar");
            });

            it("should add type query type to uml code model", () => {
                delinter.parse(sourceFile);

                const node = delinter.umlCodeModel.nodes.getValue("Foo") as uml.Class;
                expect(node.variables.containsKey("_typeQuery")).to.be.true;

                const variable = node.variables.getValue("_typeQuery");
                expect(variable).to.be.instanceOf(uml.VariableProperty);
                expect(variable).to.have.property("identifier", "_typeQuery");
                expect(variable).to.have.property("type").which.is.instanceOf(uml.PrimaryType);
                expect(variable.type).to.have.property("text", "typeof value");
                expect(variable.type).to.have.property("kind", uml.PrimaryTypeKind.TypeQuery);
            });

            it("should add this type to uml code model", () => {
                delinter.parse(sourceFile);

                const node = delinter.umlCodeModel.nodes.getValue("Foo") as uml.Class;
                expect(node.variables.containsKey("_thisType")).to.be.true;

                const variable = node.variables.getValue("_thisType");
                expect(variable).to.be.instanceOf(uml.VariableProperty);
                expect(variable).to.have.property("identifier", "_thisType");
                expect(variable).to.have.property("type").which.is.instanceOf(uml.PrimaryType);
                expect(variable.type).to.have.property("text", "this");
                expect(variable.type).to.have.property("kind", uml.PrimaryTypeKind.ThisType);
            });

            it("should add union type to uml code model", () => {
                delinter.parse(sourceFile);

                const node = delinter.umlCodeModel.nodes.getValue("Foo") as uml.Class;
                expect(node.variables.containsKey("_unionType")).to.be.true;

                const variable = node.variables.getValue("_unionType");
                expect(variable).to.be.instanceOf(uml.VariableProperty);
                expect(variable).to.have.property("identifier", "_unionType");
                expect(variable).to.have.property("type").which.is.instanceOf(uml.UnionOrIntersectionType);
                expect(variable.type).to.have.property("text", "string | number | Bar");
                expect(variable.type).to.have.property("kind", uml.UnionOrIntersectionTypeKind.Union);
                expect(variable.type)
                    .to.have.property("types")
                    .with.length(3, "Union type should have three type arguments");
                const types = (variable.type as uml.UnionOrIntersectionType).types;
                expect(types[0])
                    .to.be.instanceOf(uml.PrimaryType)
                    .and.to.have.property("text", "string");
                expect(types[1])
                    .to.be.instanceOf(uml.PrimaryType)
                    .and.to.have.property("text", "number");
                expect(types[2])
                    .to.be.instanceOf(uml.PrimaryType)
                    .and.to.have.property("text", "Bar");
            });

            it("should add intersection type to uml code model", () => {
                delinter.parse(sourceFile);

                const node = delinter.umlCodeModel.nodes.getValue("Foo") as uml.Class;
                expect(node.variables.containsKey("_intersectionType")).to.be.true;

                const variable = node.variables.getValue("_intersectionType");
                expect(variable).to.be.instanceOf(uml.VariableProperty);
                expect(variable).to.have.property("identifier", "_intersectionType");
                expect(variable).to.have.property("type").which.is.instanceOf(uml.UnionOrIntersectionType);
                expect(variable.type).to.have.property("text", "Bar & Baz");
                expect(variable.type).to.have.property("kind", uml.UnionOrIntersectionTypeKind.Intersection);
                expect(variable.type)
                    .to.have.property("types")
                    .with.length(2, "Intersection type should have two type arguments");
                const types = (variable.type as uml.UnionOrIntersectionType).types;
                expect(types[0])
                    .to.be.instanceOf(uml.PrimaryType)
                    .and.to.have.property("text", "Bar");
                expect(types[1])
                    .to.be.instanceOf(uml.PrimaryType)
                    .and.to.have.property("text", "Baz");
            });

            it("should add read only property correctly to the code model", () => {
                delinter.parse(sourceFile);

                const node = delinter.umlCodeModel.nodes.getValue("Foo") as uml.Class;
                expect(node.variables.containsKey("readOnlyProperty")).to.be.true;

                const variable = node.variables.getValue("readOnlyProperty");

                expect(variable)
                    .to.be.instanceOf(uml.VariableProperty)
                    .and.to.have.property("stereotype", uml.Stereotype.Get);
                expect(variable)
                    .to.have.property("type")
                    .instanceOf(uml.PrimaryType)
                    .which.has.property("text", "string");
            });

            it("should add write only property correctly to the code model", () => {
                delinter.parse(sourceFile);

                const node = delinter.umlCodeModel.nodes.getValue("Foo") as uml.Class;
                expect(node.variables.containsKey("writeOnlyProperty")).to.be.true;

                const variable = node.variables.getValue("writeOnlyProperty");

                expect(variable)
                    .to.be.instanceOf(uml.VariableProperty)
                    .and.to.have.property("stereotype", uml.Stereotype.Set);
                expect(variable)
                    .to.have.property("type")
                    .instanceOf(uml.PrimaryType)
                    .which.has.property("text", "string");
            });
        });

        describe("given classMemberFunctions.test.ts", () => {
            before(() => {
                sourceFile = getSourceFile(TEST_FILE_CLASS_MEMBER_FUNCTIONS);
            });

            beforeEach(() => {
                delinter = new Delinter();
            });

            it("should add functions with correct accessibility to code model", () => {
                delinter.parse(sourceFile);

                const node = delinter.umlCodeModel.nodes.getValue("Foo") as uml.Class;
                expect(node.methods.getValue("_privateFunction"))
                    .to.have.property("accessibility", uml.Accessibility.Private);
                expect(node.methods.getValue("protectedFunction"))
                    .to.have.property("accessibility", uml.Accessibility.Protected);
                expect(node.methods.getValue("publicFunction"))
                    .to.have.property("accessibility", uml.Accessibility.Public);
                expect(node.methods.getValue("implicitPublicFunction"))
                    .to.have.property("accessibility", uml.Accessibility.Public);
            });

            it("should add functions with null return type if implicit to code model", () => {
                delinter.parse(sourceFile);

                const node = delinter.umlCodeModel.nodes.getValue("Foo") as uml.Class;

                expect(node.methods.getValue("implicitReturnType"))
                    .to.have.property("returnType", null);
            });

            it("should add functions with correct return types to code model", () => {
                delinter.parse(sourceFile);

                const node = delinter.umlCodeModel.nodes.getValue("Foo") as uml.Class;

                expect(node.methods.getValue("publicFunction"))
                    .to.have.property("returnType");
                expect(node.methods.getValue("publicFunction").returnType)
                    .to.be.instanceOf(uml.PrimaryType)
                    .and.to.have.property("text", "void");

                expect(node.methods.getValue("stringReturnType"))
                    .to.have.property("returnType");
                expect(node.methods.getValue("stringReturnType").returnType)
                    .to.be.instanceOf(uml.PrimaryType)
                    .and.to.have.property("text", "string");

                expect(node.methods.getValue("unionReturnType"))
                    .to.have.property("returnType");
                expect(node.methods.getValue("unionReturnType").returnType)
                    .to.be.instanceOf(uml.UnionOrIntersectionType)
                    .to.have.property("types")
                    .with.length(3, "Union return type should have three type arguments");
                const types = (node.methods.getValue("unionReturnType").returnType as uml.UnionOrIntersectionType)
                    .types;
                expect(types[0])
                    .to.be.instanceOf(uml.PrimaryType)
                    .and.to.have.property("text", "Foo");
                expect(types[1])
                    .to.be.instanceOf(uml.PrimaryType)
                    .and.to.have.property("text", "number");
                expect(types[2])
                    .to.be.instanceOf(uml.PrimaryType)
                    .and.to.have.property("text", "string");
            });

            it("should add function parameters correctly to code model", () => {
                delinter.parse(sourceFile);

                const node = delinter.umlCodeModel.nodes.getValue("Foo") as uml.Class;

                expect(node.methods.getValue("parameterizedFunction").parameters)
                    .to.have.lengthOf(3);
                const parameters = node.methods.getValue("parameterizedFunction").parameters;
                expect(parameters[0])
                    .to.be.instanceOf(uml.Parameter)
                    .and.to.have.property("identifier", "foo");
                expect(parameters[0])
                    .to.have.property("type")
                    .instanceOf(uml.PrimaryType)
                    .with.property("text", "string");

                expect(parameters[1])
                    .to.be.instanceOf(uml.Parameter)
                    .and.to.have.property("identifier", "bar");
                expect(parameters[1])
                    .to.have.property("type")
                    .instanceOf(uml.PrimaryType)
                    .with.property("text", "number");

                expect(parameters[2])
                    .to.be.instanceOf(uml.Parameter)
                    .and.to.have.property("identifier", "baz");
                expect(parameters[2])
                    .to.have.property("type")
                    .instanceOf(uml.PrimaryType)
                    .with.property("text", "any");
            });

            it("should add function parameters with initializer correctly to code model", () => {
                delinter.parse(sourceFile);

                const node = delinter.umlCodeModel.nodes.getValue("Foo") as uml.Class;

                expect(node.methods.getValue("initializerFunction").parameters)
                    .to.have.lengthOf(2);
                const parameters = node.methods.getValue("initializerFunction").parameters;
                expect(parameters[0])
                    .to.be.instanceOf(uml.Parameter)
                    .and.to.have.property("identifier", "foo");
                expect(parameters[0])
                    .to.have.property("defaultInitializer", null);
                expect(parameters[0])
                    .to.have.property("optional", false);

                expect(parameters[1])
                    .to.be.instanceOf(uml.Parameter)
                    .and.to.have.property("identifier", "bar");
                expect(parameters[1])
                    .to.have.property("defaultInitializer", `"default"`);
                expect(parameters[1])
                    .to.have.property("optional", true);
            });

            it("should add optional function parameters correctly to code model", () => {
                delinter.parse(sourceFile);

                const node = delinter.umlCodeModel.nodes.getValue("Foo") as uml.Class;

                expect(node.methods.getValue("optionalParameterFunction").parameters)
                    .to.have.lengthOf(2);
                const parameters = node.methods.getValue("optionalParameterFunction").parameters;
                expect(parameters[0])
                    .to.be.instanceOf(uml.Parameter)
                    .and.to.have.property("identifier", "foo");
                expect(parameters[0])
                    .to.have.property("optional", false);
                expect(parameters[0])
                    .to.have.property("defaultInitializer", null);

                expect(parameters[1])
                    .to.be.instanceOf(uml.Parameter)
                    .and.to.have.property("identifier", "bar");
                expect(parameters[1])
                    .to.have.property("optional", true);
                expect(parameters[1])
                    .to.have.property("defaultInitializer", null);
            });
        });

        describe("given classAssociation.test.ts", () => {
            before(() => {
                sourceFile = getSourceFile(TEST_FILE_CLASS_ASSOCIATION);
            });

            beforeEach(() => {
                delinter = new Delinter();
            });

            it("should add direct association to uml code model", () => {
                delinter.parse(sourceFile);
                expect(delinter.umlCodeModel.associations.contains(
                    new uml.Association("Foo", "Bar"))).to.be.true;
            });

            it("should add bidirectional association to uml code model", () => {
                delinter.parse(sourceFile);
                expect(delinter.umlCodeModel.associations.contains(
                    new uml.Association("Foo", "Qux"))).to.be.true;
                expect(delinter.umlCodeModel.associations.contains(
                    new uml.Association("Qux", "Foo"))).to.be.true;
            });

            it("should add associations through union to uml code model", () => {
                delinter.parse(sourceFile);
                expect(delinter.umlCodeModel.associations.contains(
                    new uml.Association("Foo", "Baz"))).to.be.true;
            });

            it("should add associations through intersection to uml code model", () => {
                delinter.parse(sourceFile);
                expect(delinter.umlCodeModel.associations.contains(
                    new uml.Association("Foo", "IBar"))).to.be.true;
                expect(delinter.umlCodeModel.associations.contains(
                    new uml.Association("Foo", "IBaz"))).to.be.true;
            });

            it("should add associations through array type to uml code model", () => {
                delinter.parse(sourceFile);
                expect(delinter.umlCodeModel.associations.contains(
                    new uml.Association("Foo", "IQux"))).to.be.true;
            });

            it("should add associations through generic type to uml code model", () => {
                delinter.parse(sourceFile);
                expect(delinter.umlCodeModel.associations.contains(
                    new uml.Association("Foo", "Waldo"))).to.be.true;
                expect(delinter.umlCodeModel.associations.contains(
                    new uml.Association("Foo", "Quuz"))).to.be.true;
            });

            it("should add associations through tuple type to uml code model", () => {
                delinter.parse(sourceFile);
                expect(delinter.umlCodeModel.associations.contains(
                    new uml.Association("Foo", "Corge"))).to.be.true;
                expect(delinter.umlCodeModel.associations.contains(
                    new uml.Association("Foo", "Grault"))).to.be.true;
            });
        });
    });
});
