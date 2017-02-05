import * as chai from "chai";
import { readFileSync } from "fs";
import "mocha";
import * as ts from "typescript";
import { Delinter } from "../src/delint";
import * as uml from "../src/uml";
const expect = chai.expect;

describe("Delinter", () => {
    let sourceFile: ts.SourceFile;
    let delinter: Delinter;

    describe("#parse", () => {
        const TEST_FILE_CLASS = "testInput/delint/class.test.ts";
        const TEST_FILE_INTERFACE = "testInput/delint/interface.test.ts";

        describe("given class.test.ts", () => {
            before(() => {
                sourceFile = ts.createSourceFile(TEST_FILE_CLASS, readFileSync(TEST_FILE_CLASS).toString(),
                    ts.ScriptTarget.ES5, /*setParentNodes */ true);
            });

            beforeEach(() => {
                delinter = new Delinter();
            });

            it("should add class to uml program", () => {
                delinter.parse(sourceFile);
                expect(delinter.umlProgram.nodes.containsKey("Foo")).to.be.true;
                expect(delinter.umlProgram.nodes.getValue("Foo")).to.be.instanceof(uml.Class);
            });

            it("should add interfaces to uml program", () => {
                delinter.parse(sourceFile);
                expect(delinter.umlProgram.nodes.containsKey("IBar")).to.be.true;
                expect(delinter.umlProgram.nodes.containsKey("IFoo")).to.be.true;
                expect(delinter.umlProgram.nodes.getValue("IBar")).to.be.instanceof(uml.Interface);
                expect(delinter.umlProgram.nodes.getValue("IFoo")).to.be.instanceof(uml.Interface);
            });

            it("should add inheritance associations to uml program", () => {
                delinter.parse(sourceFile);
                expect(delinter.umlProgram.associations).to.have.length(2);
                expect(delinter.umlProgram.associations[0]).to.have.property("fromName", "Foo");
                expect(delinter.umlProgram.associations[0]).to.have.property("toName", "IBar");
                expect(delinter.umlProgram.associations[1]).to.have.property("fromName", "Foo");
                expect(delinter.umlProgram.associations[1]).to.have.property("toName", "IFoo");
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

            it("should add interface to uml program", () => {
                delinter.parse(sourceFile);
                expect(delinter.umlProgram.nodes.containsKey("IBar")).to.be.true;
            });
        });

    });
});
