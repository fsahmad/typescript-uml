import * as chai from "chai";
import * as mocha from "mocha";
import * as sinon from "sinon";
import * as sinonChai from "sinon-chai";
import * as ts from "typescript";
import { Delinter } from "../delint";
import * as Formatter from "../formatter/index";
import * as tsUml from "../typescript-uml";
import * as Uml from "../uml";

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

        const executeCut = () => {
            returnValue = tsUml.TypeScriptUml.parseUmlProgram(filenames, scriptTarget);
        };

        it("should handle no files", () => {
            expect(executeCut()).to.not.throw;
            expect(returnValue.associations).to.eql([]);
            expect(returnValue.nodes.isEmpty()).to.be.true;
        });

        it("should parse source files using delinter", () => {
            filenames = ["testInput/delint/class.test.ts", "testInput/delint/interface.test.ts"];
            executeCut();
            expect(parseStub).to.have.been.calledWith(
                sinon.match({
                    fileName: "testInput/delint/class.test.ts",
                    languageVersion: scriptTarget,
                    text: "class Foo extends Bar implements IBar, IFoo {\n    // Test class\n}\n",
                }));
            expect(parseStub).to.have.been.calledWith(
                sinon.match({
                    fileName: "testInput/delint/interface.test.ts",
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
        let options: tsUml.ITypeScriptUmlOptions;

        const executeCut = () => {
            return tsUml.TypeScriptUml.generateClassDiagram(program, options);
        };

        beforeEach(() => {
            program = new Uml.Program();
            options = {
                formatter: "yuml",
            };
        });

        it("should call formatter with program", () => {
            const spy = sandbox.spy(Formatter.YumlFormatter.prototype, "generateClassDiagram");
            const returnValue = executeCut();
            expect(spy)
                .to.have.been.calledOnce
                .and.calledWith(program)
                .and.returned(returnValue);
        });
    });
});
