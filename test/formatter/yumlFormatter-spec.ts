import * as chai from "chai";
import * as mocha from "mocha";
import * as sinon from "sinon";
import * as sinonChai from "sinon-chai";
import * as Formatter from "../../src/formatter/index";
import * as Uml from "../../src/index";

const expect = chai.expect;
chai.use(sinonChai);

describe("YumlFormatter", () => {
    let sandbox: sinon.SinonSandbox;
    let cut: Formatter.YumlFormatter;

    beforeEach(() => {
        sandbox = sinon.sandbox.create();
        cut = new Formatter.YumlFormatter();
    });
    afterEach(() => {
        sandbox.restore();
    });

    describe("#generateClassDiagram", () => {
        let returnValue: string;
        let umlProgram: Uml.Program;
        beforeEach(() => {
            umlProgram = new Uml.Program();
        });

        const executeCut = () => {
            returnValue = cut.generateClassDiagram(umlProgram);
        };

        it("should handle empty uml program", () => {
            expect(executeCut()).to.not.throw;
            expect(returnValue).to.be.string("");
        });

        it("should handle uml program with unassociated classes", () => {
            const foo = new Uml.Class("Foo");
            const bar = new Uml.Class("Bar");
            umlProgram.nodes.setValue(foo.name, foo);
            umlProgram.nodes.setValue(bar.name, bar);

            expect(executeCut()).to.not.throw;

            expect(returnValue).to.match(/^\/\/\s*{type:class}\s*$/m);
            expect(returnValue).to.match(/^\[Foo\]\s*$/m);
            expect(returnValue).to.match(/^\[Bar\]\s*$/m);
        });

        it("should handle uml program with unassociated interfaces", () => {
            const foo = new Uml.Interface("Foo");
            const bar = new Uml.Interface("Bar");
            umlProgram.nodes.setValue(foo.name, foo);
            umlProgram.nodes.setValue(bar.name, bar);

            expect(executeCut()).to.not.throw;

            expect(returnValue).to.match(/^\/\/\s*{type:class}\s*$/m);
            expect(returnValue).to.match(/^\[<<Foo>>\]\s*$/m);
            expect(returnValue).to.match(/^\[<<Bar>>\]\s*$/m);
        });

        it("should handle uml program with class inheritance", () => {
            const foo = new Uml.Class("Foo");
            const bar = new Uml.Class("Bar");
            umlProgram.nodes.setValue(foo.name, foo);
            umlProgram.nodes.setValue(bar.name, bar);

            const generalization = new Uml.Generalization();
            generalization.fromName = foo.name;
            generalization.toName = bar.name;
            umlProgram.generalizations.push(generalization);

            expect(executeCut()).to.not.throw;

            expect(returnValue).to.match(/^\/\/\s*{type:class}\s*$/m);
            expect(returnValue).to.match(/^\[Bar\]\^\[Foo\]\s*$/m);
        });

        it("should handle uml program with interface inheritance", () => {
            const foo = new Uml.Class("Foo");
            const bar = new Uml.Interface("IBar");
            umlProgram.nodes.setValue(foo.name, foo);
            umlProgram.nodes.setValue(bar.name, bar);

            const generalization = new Uml.Generalization();
            generalization.fromName = foo.name;
            generalization.toName = bar.name;
            umlProgram.generalizations.push(generalization);

            expect(executeCut()).to.not.throw;

            expect(returnValue).to.match(/^\/\/\s*{type:class}\s*$/m);
            expect(returnValue).to.match(/^\[<<IBar>>\]\^\[Foo\]\s*$/m);
        });

        it("should not output classes separately when outputted as link", () => {
            const foo = new Uml.Class("Foo");
            const bar = new Uml.Interface("IBar");
            umlProgram.nodes.setValue(foo.name, foo);
            umlProgram.nodes.setValue(bar.name, bar);

            const generalization = new Uml.Generalization();
            generalization.fromName = foo.name;
            generalization.toName = bar.name;
            umlProgram.generalizations.push(generalization);

            expect(executeCut()).to.not.throw;

            expect(returnValue).to.match(/^\/\/\s*{type:class}\s*$/m);
            expect(returnValue).not.to.match(/^\[Foo\]\s*$/m);
            expect(returnValue).not.to.match(/^\[<<IBar>>\]\s*$/m);
        });
    });
});
