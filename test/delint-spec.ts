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
        const TEST_FILE = "test/delint/class.test.ts";

        describe("given class.test.ts", () => {
            before(() => {
                sourceFile = ts.createSourceFile(TEST_FILE, readFileSync(TEST_FILE).toString(),
                    ts.ScriptTarget.ES5, /*setParentNodes */ true);
            });

            beforeEach(() => {
                delinter = new Delinter();
            });

            it("should add class to uml program", () => {
                delinter.parse(sourceFile);
                expect(delinter.umlProgram.classes.containsKey("Foo")).to.be.true;
            });
        });

        describe.skip("given interface.test.ts", () => {
            before(() => {
                sourceFile = ts.createSourceFile(TEST_FILE, readFileSync(TEST_FILE).toString(),
                    ts.ScriptTarget.ES5, /*setParentNodes */ true);
            });

            beforeEach(() => {
                delinter = new Delinter();
            });

            it("should add interface to uml program", () => {
                delinter.parse(sourceFile);
                expect(delinter.umlProgram.classes.containsKey("IBar")).to.be.true;
            });
        });

    });
});
