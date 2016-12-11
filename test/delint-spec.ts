import * as chai from "chai";
import { readFileSync } from "fs";
import "mocha";
import * as ts from "typescript";
import { Delinter } from "../src/delint";

const expect = chai.expect;

describe("Delinter", () => {
    const TEST_FILE = "test/delint/class.test.ts"; // reuse existing sample file
    let sourceFile: ts.SourceFile;
    let delinter: Delinter;

    before(() => {
        sourceFile = ts.createSourceFile(TEST_FILE, readFileSync(TEST_FILE).toString(),
            ts.ScriptTarget.ES6, /*setParentNodes */ true);
    });

    beforeEach(() => {
        delinter = new Delinter();
    });

    it("should add class to uml program", () => {
        delinter.parse(sourceFile);
        expect(delinter.umlProgram.classes.containsKey("Foo")).to.be.true;
    });
});
