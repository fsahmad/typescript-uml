import * as chai from "chai";
import * as mocha from "mocha";
import * as sinon from "sinon";
import * as sinonChai from "sinon-chai";
import * as ts from "typescript";
import { Delinter } from "../src/delint";
import * as Formatter from "../src/formatter/index";
import * as Uml from "../src/index";

const expect = chai.expect;
chai.use(sinonChai);

describe("TypeScriptUml", () => {
    let sandbox: sinon.SinonSandbox;

    beforeEach(() => {
        sandbox = sinon.sandbox.create();
    });
    afterEach(() => {
        sandbox.restore();
    });

    describe(".parseUmlProgram", () => {
        let filenames: string[];
        let scriptTarget: ts.ScriptTarget;
        let returnValue: Uml.Program;
        let parseStub: sinon.SinonStub;
        let createSourceFileSpy: sinon.SinonSpy;

        beforeEach(() => {
            parseStub = sandbox.stub(Delinter.prototype, "parse");
            createSourceFileSpy = sandbox.spy(ts, "createSourceFile");
            filenames = [];
            scriptTarget = ts.ScriptTarget.ES5;
        });

        let executeCut = () => {
            returnValue = Uml.TypeScriptUml.parseUmlProgram(filenames, scriptTarget);
        };

        it("should handle no files", () => {
            expect(executeCut()).to.not.throw;
            expect(returnValue.associations).to.eql([]);
            expect(returnValue.classes.isEmpty()).to.be.true;
        });

        it("should parse source files using delinter", () => {
            filenames = ["test/delint/class.test.ts", "test/delint/interface.test.ts"];
            executeCut();
            expect(parseStub).to.have.been.calledWith(
                sinon.match({
                    fileName: "test/delint/class.test.ts",
                    languageVersion: scriptTarget,
                    text: "class Foo {\n    // Test class\n}\n",
                }));
            expect(parseStub).to.have.been.calledWith(
                sinon.match({
                    fileName: "test/delint/interface.test.ts",
                    languageVersion: scriptTarget,
                    text: "interface IBar {\n    fooBar: string;\n}\n",
                }));
        });

        it("should return instance of uml.Program", () => {
            executeCut();
            expect(returnValue).to.be.instanceOf(Uml.Program);
        });
    });

    describe(".generateClassDiagram", () => {
        let program: Uml.Program;
        let formatter: Formatter.AbstractFormatter;

        let executeCut = () => {
            return Uml.TypeScriptUml.generateClassDiagram(program, formatter);
        };

        beforeEach(() => {
            program = new Uml.Program();
            formatter = new Formatter.AbstractFormatter();
        })

        it("should call formatter with program", () => {
            sandbox.spy(formatter, "generateClassDiagram");
            let returnValue = executeCut();
            expect(formatter.generateClassDiagram)
                .to.have.been.calledOnce
                .and.calledWith(program)
                .and.returned(returnValue);
        });
    });
});
