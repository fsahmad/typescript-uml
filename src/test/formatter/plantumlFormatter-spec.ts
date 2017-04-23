import * as chai from "chai";
import * as mocha from "mocha";
import * as sinon from "sinon";
import * as sinonChai from "sinon-chai";
import * as Formatter from "../../formatter/index";
import * as Uml from "../../uml";

const expect = chai.expect;
chai.use(sinonChai);

describe("PlantUMLFormatter", () => {
    let sandbox: sinon.SinonSandbox;
    let cut: Formatter.PlantUMLFormatter;

    beforeEach(() => {
        sandbox = sinon.sandbox.create();
        cut = new Formatter.PlantUMLFormatter();
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
            expect(returnValue).to.match(/^\s*@startuml\s*@enduml\s*$/gm);
            expect(returnValue.match(/^@startuml\s*@enduml\s*$/gm)[0]).to.eq(returnValue);
        });

        it("should handle uml code model with unassociated classes", () => {
            const foo = new Uml.Class("Foo");
            const bar = new Uml.Class("Bar");
            umlCodeModel.nodes.setValue(foo.identifier, foo);
            umlCodeModel.nodes.setValue(bar.identifier, bar);

            expect(executeCut()).to.not.throw;

            expect(returnValue).to.match(/^@startuml$/m);
            expect(returnValue).to.match(/^\s*class Foo\s*{\s*}\s*$/m);
            expect(returnValue).to.match(/^\s*class Bar\s*{\s*}\s*$/m);
            expect(returnValue).to.match(/^@enduml$/m);
        });

        it("should handle uml code model with unassociated interfaces", () => {
            const foo = new Uml.Class("Foo", Uml.Stereotype.Interface);
            const bar = new Uml.Class("Bar", Uml.Stereotype.Interface);
            umlCodeModel.nodes.setValue(foo.identifier, foo);
            umlCodeModel.nodes.setValue(bar.identifier, bar);

            expect(executeCut()).to.not.throw;

            expect(returnValue).to.match(/^@startuml$/m);
            expect(returnValue).to.match(/^\s*interface Foo\s*{\s*}\s*$/m);
            expect(returnValue).to.match(/^\s*interface Bar\s*{\s*}\s*$/m);
            expect(returnValue).to.match(/^@enduml$/m);
        });

        it("should handle uml code model with class inheritance", () => {
            const foo = new Uml.Class("Foo");
            const bar = new Uml.Class("Bar");
            umlCodeModel.nodes.setValue(foo.identifier, foo);
            umlCodeModel.nodes.setValue(bar.identifier, bar);

            const generalization = new Uml.Generalization(foo.identifier, bar.identifier);
            umlCodeModel.generalizations.add(generalization);

            expect(executeCut()).to.not.throw;

            expect(returnValue).to.match(/^@startuml$/m);
            expect(returnValue).to.match(/^\s*class Foo\s*{\s*}\s*$/m);
            expect(returnValue).to.match(/^\s*class Bar\s*{\s*}\s*$/m);
            expect(returnValue).to.match(/^\s*Bar\s*<|--\s*Foo\s*$/m);
            expect(returnValue).to.match(/^@enduml$/m);
        });

        it("should handle uml code model with interface inheritance", () => {
            const foo = new Uml.Class("Foo");
            const bar = new Uml.Class("IBar", Uml.Stereotype.Interface);
            umlCodeModel.nodes.setValue(foo.identifier, foo);
            umlCodeModel.nodes.setValue(bar.identifier, bar);

            const generalization = new Uml.Generalization(foo.identifier, bar.identifier);
            umlCodeModel.generalizations.add(generalization);

            expect(executeCut()).to.not.throw;

            expect(returnValue).to.match(/^@startuml$/m);
            expect(returnValue).to.match(/^\s*class Foo\s*{\s*}\s*$/m);
            expect(returnValue).to.match(/^\s*interface IBar\s*{\s*}\s*$/m);
            expect(returnValue).to.match(/^\s*IBar\s*<|--\s*Foo\s*$/m);
            expect(returnValue).to.match(/^@enduml$/m);
        });

        it("should handle uml code model with public member variables", () => {
            const foo = new Uml.Class("Foo");
            const foo1 = new Uml.VariableProperty("foo1",
                Uml.Accessibility.Public,
                new Uml.PrimaryType("string", Uml.PrimaryTypeKind.PredefinedType));
            const foo2 = new Uml.VariableProperty("foo2",
                Uml.Accessibility.Public,
                new Uml.PrimaryType("number[]", Uml.PrimaryTypeKind.ArrayType));

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

            const foovariables = returnValue.match(/^\s*class Foo\s*{([^}]*)}\s*$/m)[1];
            const barvariables = returnValue.match(/^\s*class Bar\s*{([^}]*)}\s*$/m)[1];

            expect(returnValue).to.match(/^@startuml$/m);
            expect(foovariables).to.match(/^\s*\+foo1 : string$/m);
            expect(foovariables).to.match(/^\s*\+foo2 : number\[\]$/m);
            expect(barvariables).to.match(/^\s*\+bar1 : string$/m);
            expect(barvariables).to.match(/^\s*\+bar2 : number$/m);
            expect(returnValue).to.match(/^@enduml$/m);
        });

        it("should handle uml code model with protected member variables", () => {
            const foo = new Uml.Class("Foo");
            const foo1 = new Uml.VariableProperty("foo1",
                Uml.Accessibility.Protected,
                new Uml.PrimaryType("string", Uml.PrimaryTypeKind.PredefinedType));

            foo.variables.setValue("foo1", foo1);

            umlCodeModel.nodes.setValue(foo.identifier, foo);

            expect(executeCut()).to.not.throw;

            const foovariables = returnValue.match(/^\s*class Foo\s*{([^}]*)}\s*$/m)[1];

            expect(returnValue).to.match(/^@startuml$/m);
            expect(foovariables).to.match(/^\s*#foo1 : string$/m);
            expect(returnValue).to.match(/^@enduml$/m);
        });

        it("should handle uml code model with private member variables", () => {
            const foo = new Uml.Class("Foo");
            const foo1 = new Uml.VariableProperty("foo1",
                Uml.Accessibility.Private,
                new Uml.PrimaryType("string", Uml.PrimaryTypeKind.PredefinedType));

            foo.variables.setValue("foo1", foo1);

            umlCodeModel.nodes.setValue(foo.identifier, foo);

            expect(executeCut()).to.not.throw;

            const foovariables = returnValue.match(/^\s*class Foo\s*{([^}]*)}\s*$/m)[1];

            expect(returnValue).to.match(/^@startuml$/m);
            expect(foovariables).to.match(/^\s*\-foo1 : string$/m);
            expect(returnValue).to.match(/^@enduml$/m);
        });

        it("should handle uml code model with public member methods", () => {
            const foo = new Uml.Class("Foo");
            const foo1 = new Uml.FunctionProperty("foo1", Uml.Accessibility.Public);

            foo.methods.setValue("foo1", foo1);

            umlCodeModel.nodes.setValue(foo.identifier, foo);

            expect(executeCut()).to.not.throw;

            const foovariables = returnValue.match(/^\s*class Foo\s*{([^}]*)}\s*$/m)[1];

            expect(returnValue).to.match(/^@startuml$/m);
            expect(foovariables).to.match(/^\s*\+foo1\(\)$/m);
            expect(returnValue).to.match(/^@enduml$/m);
        });

        it("should handle uml code model with protected member methods", () => {
            const foo = new Uml.Class("Foo");
            const foo1 = new Uml.FunctionProperty("foo1", Uml.Accessibility.Protected);

            foo.methods.setValue("foo1", foo1);

            umlCodeModel.nodes.setValue(foo.identifier, foo);

            expect(executeCut()).to.not.throw;

            const foovariables = returnValue.match(/^\s*class Foo\s*{([^}]*)}\s*$/m)[1];

            expect(returnValue).to.match(/^@startuml$/m);
            expect(foovariables).to.match(/^\s*\#foo1\(\)$/m);
            expect(returnValue).to.match(/^@enduml$/m);
        });

        it("should handle uml code model with private member methods", () => {
            const foo = new Uml.Class("Foo");
            const foo1 = new Uml.FunctionProperty("foo1", Uml.Accessibility.Private);

            foo.methods.setValue("foo1", foo1);

            umlCodeModel.nodes.setValue(foo.identifier, foo);

            expect(executeCut()).to.not.throw;

            const foovariables = returnValue.match(/^\s*class Foo\s*{([^}]*)}\s*$/m)[1];

            expect(returnValue).to.match(/^@startuml$/m);
            expect(foovariables).to.match(/^\s*\-foo1\(\)$/m);
            expect(returnValue).to.match(/^@enduml$/m);
        });

        it("should handle uml code model with member method return type", () => {
            const foo = new Uml.Class("Foo");
            const foo1 = new Uml.FunctionProperty("foo1", Uml.Accessibility.Private);
            foo1.returnType = new Uml.PrimaryType("boolean", Uml.PrimaryTypeKind.PredefinedType);

            foo.methods.setValue("foo1", foo1);

            umlCodeModel.nodes.setValue(foo.identifier, foo);

            expect(executeCut()).to.not.throw;

            const foovariables = returnValue.match(/^\s*class Foo\s*{([^}]*)}\s*$/m)[1];

            expect(returnValue).to.match(/^@startuml$/m);
            expect(foovariables).to.match(/^\s*[-\+#]?foo1\(\): boolean$/m);
            expect(returnValue).to.match(/^@enduml$/m);
        });

        it("should handle uml code model with member method parameters", () => {
            const foo = new Uml.Class("Foo");
            const foo1 = new Uml.FunctionProperty("foo1", Uml.Accessibility.Private);
            const p1 = new Uml.Parameter("p1");
            p1.type = new Uml.PrimaryType("number", Uml.PrimaryTypeKind.PredefinedType);
            const p2 = new Uml.Parameter("p2");
            p2.type = new Uml.PrimaryType("string", Uml.PrimaryTypeKind.PredefinedType);
            const p3 = new Uml.Parameter("p3");
            p3.type = new Uml.PrimaryType("Foo", Uml.PrimaryTypeKind.TypeReference);

            foo1.parameters.push(p1);
            foo1.parameters.push(p2);
            foo1.parameters.push(p3);

            foo.methods.setValue("foo1", foo1);

            umlCodeModel.nodes.setValue(foo.identifier, foo);

            expect(executeCut()).to.not.throw;

            const foovariables = returnValue.match(/^\s*class Foo\s*{([^}]*)}\s*$/m)[1];

            expect(returnValue).to.match(/^@startuml$/m);
            expect(foovariables).to.match(/^\s*\-foo1\(p1: number, p2: string, p3: Foo\)/m);
            expect(returnValue).to.match(/^@enduml$/m);
        });

        it("should handle uml code model with member method parameter initializer", () => {
            const foo = new Uml.Class("Foo");
            const foo1 = new Uml.FunctionProperty("foo1", Uml.Accessibility.Private);
            const p1 = new Uml.Parameter("p1");
            p1.type = new Uml.PrimaryType("number", Uml.PrimaryTypeKind.PredefinedType);
            p1.defaultInitializer = "99.9";
            p1.optional = true;

            foo1.parameters.push(p1);

            foo.methods.setValue("foo1", foo1);

            umlCodeModel.nodes.setValue(foo.identifier, foo);

            expect(executeCut()).to.not.throw;

            const foovariables = returnValue.match(/^\s*class Foo\s*{([^}]*)}\s*$/m)[1];

            expect(returnValue).to.match(/^@startuml$/m);
            expect(foovariables).to.match(/^\s*\-foo1\(p1: number = 99.9\)/m);
            expect(returnValue).to.match(/^@enduml$/m);
        });

        it("should handle uml code model with member method optional parameter", () => {
            const foo = new Uml.Class("Foo");
            const foo1 = new Uml.FunctionProperty("foo1", Uml.Accessibility.Private);
            const p1 = new Uml.Parameter("p1");
            p1.type = new Uml.PrimaryType("number", Uml.PrimaryTypeKind.PredefinedType);
            p1.optional = true;

            foo1.parameters.push(p1);

            foo.methods.setValue("foo1", foo1);

            umlCodeModel.nodes.setValue(foo.identifier, foo);

            expect(executeCut()).to.not.throw;

            const foovariables = returnValue.match(/^\s*class Foo\s*{([^}]*)}\s*$/m)[1];

            expect(returnValue).to.match(/^@startuml$/m);
            expect(foovariables).to.match(/^\s*\-foo1\(p1\?: number\)/m);
            expect(returnValue).to.match(/^@enduml$/m);
        });

        it("should handle uml code model with unidirectional association", () => {
            const foo = new Uml.Class("Foo");
            const bar = new Uml.Class("Bar");

            umlCodeModel.nodes.setValue(foo.identifier, foo);
            umlCodeModel.nodes.setValue(bar.identifier, bar);

            umlCodeModel.associations.add(new Uml.Association("Foo", "Bar"));

            expect(executeCut()).to.not.throw;

            expect(returnValue).to.match(/^@startuml$/m);
            expect(returnValue).to.match(/^\s*Foo\s*-->\s*Bar\s*$/m);
            expect(returnValue).to.match(/^@enduml$/m);
        });

        it("should handle uml code model with bidirectional association", () => {
            const foo = new Uml.Class("Foo");
            const bar = new Uml.Class("Bar");

            umlCodeModel.nodes.setValue(foo.identifier, foo);
            umlCodeModel.nodes.setValue(bar.identifier, bar);

            umlCodeModel.associations.add(new Uml.Association("Foo", "Bar"));
            umlCodeModel.associations.add(new Uml.Association("Bar", "Foo"));

            expect(executeCut()).to.not.throw;

            expect(returnValue).to.match(/^@startuml$/m);
            expect(returnValue).to.match(/^\s*(?:Foo\s*--\s*Bar)|(?:Bar\s*--\s*Foo)\s*$/m);
            expect(returnValue).to.match(/^@enduml$/m);
        });
    });
});
