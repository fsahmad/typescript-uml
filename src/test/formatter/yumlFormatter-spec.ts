import * as chai from "chai";
import * as mocha from "mocha";
import * as sinon from "sinon";
import * as sinonChai from "sinon-chai";
import * as Formatter from "../../formatter/index";
import * as Uml from "../../uml";

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
        let umlCodeModel: Uml.CodeModel;
        beforeEach(() => {
            umlCodeModel = new Uml.CodeModel();
        });

        const executeCut = () => {
            returnValue = cut.generateClassDiagram(umlCodeModel);
        };

        it("should handle empty uml code model", () => {
            expect(executeCut()).to.not.throw;
            expect(returnValue).to.be.string("");
        });

        it("should handle uml code model with unassociated classes", () => {
            const foo = new Uml.Class("Foo");
            const bar = new Uml.Class("Bar");
            umlCodeModel.nodes.setValue(foo.identifier, foo);
            umlCodeModel.nodes.setValue(bar.identifier, bar);

            expect(executeCut()).to.not.throw;

            expect(returnValue).to.match(/^\/\/\s*{type:class}\s*$/m);
            expect(returnValue).to.match(/^\[Foo\]\s*$/m);
            expect(returnValue).to.match(/^\[Bar\]\s*$/m);
        });

        it("should handle uml code model with unassociated interfaces", () => {
            const foo = new Uml.Class("Foo", Uml.Stereotype.Interface);
            const bar = new Uml.Class("Bar", Uml.Stereotype.Interface);
            umlCodeModel.nodes.setValue(foo.identifier, foo);
            umlCodeModel.nodes.setValue(bar.identifier, bar);

            expect(executeCut()).to.not.throw;

            expect(returnValue).to.match(/^\/\/\s*{type:class}\s*$/m);
            expect(returnValue).to.match(/^\[<<Foo>>\]\s*$/m);
            expect(returnValue).to.match(/^\[<<Bar>>\]\s*$/m);
        });

        it("should handle uml code model with class inheritance", () => {
            const foo = new Uml.Class("Foo");
            const bar = new Uml.Class("Bar");
            umlCodeModel.nodes.setValue(foo.identifier, foo);
            umlCodeModel.nodes.setValue(bar.identifier, bar);

            const generalization = new Uml.Generalization(foo.identifier, bar.identifier);
            umlCodeModel.generalizations.push(generalization);

            expect(executeCut()).to.not.throw;

            expect(returnValue).to.match(/^\/\/\s*{type:class}\s*$/m);
            expect(returnValue).to.match(/^\[Bar\]\^\[Foo\]\s*$/m);
        });

        it("should handle uml code model with interface inheritance", () => {
            const foo = new Uml.Class("Foo");
            const bar = new Uml.Class("IBar", Uml.Stereotype.Interface);
            umlCodeModel.nodes.setValue(foo.identifier, foo);
            umlCodeModel.nodes.setValue(bar.identifier, bar);

            const generalization = new Uml.Generalization(foo.identifier, bar.identifier);
            umlCodeModel.generalizations.push(generalization);

            expect(executeCut()).to.not.throw;

            expect(returnValue).to.match(/^\/\/\s*{type:class}\s*$/m);
            expect(returnValue).to.match(/^\[<<IBar>>\]\^\[Foo\]\s*$/m);
        });

        it("should not output classes separately when outputted as link", () => {
            const foo = new Uml.Class("Foo");
            const bar = new Uml.Class("IBar", Uml.Stereotype.Interface);
            umlCodeModel.nodes.setValue(foo.identifier, foo);
            umlCodeModel.nodes.setValue(bar.identifier, bar);

            const generalization = new Uml.Generalization(foo.identifier, bar.identifier);
            umlCodeModel.generalizations.push(generalization);

            expect(executeCut()).to.not.throw;

            expect(returnValue).to.match(/^\/\/\s*{type:class}\s*$/m);
            expect(returnValue).not.to.match(/^\[Foo\]\s*$/m);
            expect(returnValue).not.to.match(/^\[<<IBar>>\]\s*$/m);
        });

        it("should handle uml code model with public member variables", () => {
            const foo = new Uml.Class("Foo");
            const foo1 = new Uml.VariableProperty("foo1",
                Uml.Accessibility.Public,
                new Uml.PrimaryType("string", Uml.PrimaryTypeKind.PredefinedType));
            const foo2 = new Uml.VariableProperty("foo2",
                Uml.Accessibility.Public,
                new Uml.PrimaryType("number", Uml.PrimaryTypeKind.ArrayType));

            foo.variables.setValue("foo1", foo1);
            foo.variables.setValue("foo2", foo2);

            const bar = new Uml.Class("Bar");
            const bar1 = new Uml.VariableProperty("bar1",
                Uml.Accessibility.Public,
                new Uml.PrimaryType("string", Uml.PrimaryTypeKind.PredefinedType));
            const bar2 = new Uml.VariableProperty("bar2",
                Uml.Accessibility.Public,
                new Uml.PrimaryType("number", Uml.PrimaryTypeKind.PredefinedType));

            bar.variables.setValue("bar1", bar1);
            bar.variables.setValue("bar2", bar2);

            umlCodeModel.nodes.setValue(foo.identifier, foo);
            umlCodeModel.nodes.setValue(bar.identifier, bar);

            expect(executeCut()).to.not.throw;

            expect(returnValue).to.match(/^\/\/\s*{type:class}\s*$/m);
            expect(returnValue).to.match(/^\[Foo\|\+foo1:string;\+foo2:number\]\s*$/m);
            expect(returnValue).to.match(/^\[Bar\|\+bar1:string;\+bar2:number\]\s*$/m);
        });

        it("should handle uml code model with protected member variables", () => {
            const foo = new Uml.Class("Foo");
            const foo1 = new Uml.VariableProperty("foo1",
                Uml.Accessibility.Protected,
                new Uml.PrimaryType("string", Uml.PrimaryTypeKind.PredefinedType));
            foo.variables.setValue("foo1", foo1);

            umlCodeModel.nodes.setValue(foo.identifier, foo);

            expect(executeCut()).to.not.throw;

            expect(returnValue).to.match(/^\/\/\s*{type:class}\s*$/m);
            expect(returnValue).to.match(/^\[Foo\|#foo1:string\]\s*$/m);
        });

        it("should handle uml code model with private member variables", () => {
            const foo = new Uml.Class("Foo");
            const foo1 = new Uml.VariableProperty("foo1",
                Uml.Accessibility.Private,
                new Uml.PrimaryType("string", Uml.PrimaryTypeKind.PredefinedType));
            foo.variables.setValue("foo1", foo1);

            umlCodeModel.nodes.setValue(foo.identifier, foo);

            expect(executeCut()).to.not.throw;

            expect(returnValue).to.match(/^\/\/\s*{type:class}\s*$/m);
            expect(returnValue).to.match(/^\[Foo\|-foo1:string\]\s*$/m);
        });

        it("should handle uml code model with special characters", () => {
            const foo = new Uml.Class("Foo");
            const foo1 = new Uml.VariableProperty("foo1",
                Uml.Accessibility.Public,
                new Uml.PrimaryType("string[]", Uml.PrimaryTypeKind.PredefinedType));
            foo.variables.setValue(foo1.identifier, foo1);
            umlCodeModel.nodes.setValue(foo.identifier, foo);

            expect(executeCut()).to.not.throw;

            expect(returnValue).to.match(/^\/\/\s*{type:class}\s*$/m);
            expect(returnValue).to.match(/^\[Foo\|[^\w]*foo1:string［］\]\s*$/m);
        });
    });
});
