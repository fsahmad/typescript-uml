import * as chai from "chai";
import { readFileSync } from "fs";
import "mocha";
import * as ts from "typescript";
import { Delinter } from "../delint";
import * as uml from "../uml";
const expect = chai.expect;

describe("Delinter", () => {
    let sourceFile: ts.SourceFile;
    let delinter: Delinter;

    describe("#parse", () => {
        const TEST_FILE_CLASS = "testInput/delint/class.test.ts";
        const TEST_FILE_CLASS_HERITAGE = "testInput/delint/classHeritage.test.ts";
        const TEST_FILE_INTERFACE = "testInput/delint/interface.test.ts";

        describe("given class.test.ts", () => {
            before(() => {
                sourceFile = ts.createSourceFile(TEST_FILE_CLASS, readFileSync(TEST_FILE_CLASS).toString(),
                    ts.ScriptTarget.ES5, /*setParentNodes */ true);
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
                sourceFile = ts.createSourceFile(TEST_FILE_CLASS_HERITAGE,
                    readFileSync(TEST_FILE_CLASS_HERITAGE).toString(),
                    ts.ScriptTarget.ES5, /*setParentNodes */ true);
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
                expect(delinter.umlCodeModel.nodes.getValue("IBar")).to.be.instanceof(uml.Interface);
                expect(delinter.umlCodeModel.nodes.getValue("IFoo")).to.be.instanceof(uml.Interface);
            });

            it("should not replace existing interfaces", () => {
                const interfaceIBar = new uml.Interface("IBar");
                delinter.umlCodeModel.nodes.setValue("IBar", interfaceIBar);

                delinter.parse(sourceFile);
                expect(delinter.umlCodeModel.nodes.getValue("IBar")).to.equal(interfaceIBar);
            });

            it("should add interface generalizations to uml code model", () => {
                delinter.parse(sourceFile);
                expect(delinter.umlCodeModel.generalizations.filter((value) => {
                    return value.fromName === "Foo" && value.toName === "IBar";
                })).to.have.length(1, "Missing generalization from Foo to IBar");
                expect(delinter.umlCodeModel.generalizations.filter((value) => {
                    return value.fromName === "Foo" && value.toName === "IFoo";
                })).to.have.length(1, "Missing generalization from Foo to IFoo");
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
                expect(delinter.umlCodeModel.generalizations.filter((value) => {
                    return value.fromName === "Foo" && value.toName === "Bar";
                })).to.have.length(1, "Missing generalization from Foo to Bar");
            });
        });

        describe("given interface.test.ts", () => {
            before(() => {
                sourceFile = ts.createSourceFile(TEST_FILE_INTERFACE, readFileSync(TEST_FILE_INTERFACE).toString(),
                    ts.ScriptTarget.ES5, /*setParentNodes */ true);
            });

            beforeEach(() => {
                delinter = new Delinter();
            });

            it("should add interface to uml code model", () => {
                delinter.parse(sourceFile);
                expect(delinter.umlCodeModel.nodes.containsKey("IBar")).to.be.true;
            });
        });

    });
});
