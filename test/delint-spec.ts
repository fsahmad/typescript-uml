import * as chai from "chai";
import { readFileSync } from "fs";
import "mocha";
import * as ts from "typescript";
import { Delinter } from "../src/delint";

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
