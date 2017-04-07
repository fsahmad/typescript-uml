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
            umlCodeModel.nodes.setValue(foo.name, foo);
            umlCodeModel.nodes.setValue(bar.name, bar);

            expect(executeCut()).to.not.throw;

            expect(returnValue).to.match(/^@startuml$/m);
            expect(returnValue).to.match(/^\s*class Foo\s*{\s*}\s*$/m);
            expect(returnValue).to.match(/^\s*class Bar\s*{\s*}\s*$/m);
            expect(returnValue).to.match(/^@enduml$/m);
        });

        it("should handle uml code model with unassociated interfaces", () => {
            const foo = new Uml.Class("Foo", Uml.Stereotype.Interface);
            const bar = new Uml.Class("Bar", Uml.Stereotype.Interface);
            umlCodeModel.nodes.setValue(foo.name, foo);
            umlCodeModel.nodes.setValue(bar.name, bar);

            expect(executeCut()).to.not.throw;

            expect(returnValue).to.match(/^@startuml$/m);
            expect(returnValue).to.match(/^\s*interface Foo\s*{\s*}\s*$/m);
            expect(returnValue).to.match(/^\s*interface Bar\s*{\s*}\s*$/m);
            expect(returnValue).to.match(/^@enduml$/m);
        });

        it("should handle uml code model with class inheritance", () => {
            const foo = new Uml.Class("Foo");
            const bar = new Uml.Class("Bar");
            umlCodeModel.nodes.setValue(foo.name, foo);
            umlCodeModel.nodes.setValue(bar.name, bar);

            const generalization = new Uml.Generalization(foo.name, bar.name);
            umlCodeModel.generalizations.push(generalization);

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
            umlCodeModel.nodes.setValue(foo.name, foo);
            umlCodeModel.nodes.setValue(bar.name, bar);

            const generalization = new Uml.Generalization(foo.name, bar.name);
            umlCodeModel.generalizations.push(generalization);

            expect(executeCut()).to.not.throw;

            expect(returnValue).to.match(/^@startuml$/m);
            expect(returnValue).to.match(/^\s*class Foo\s*{\s*}\s*$/m);
            expect(returnValue).to.match(/^\s*interface IBar\s*{\s*}\s*$/m);
            expect(returnValue).to.match(/^\s*IBar\s*<|--\s*Foo\s*$/m);
            expect(returnValue).to.match(/^@enduml$/m);
        });

        it("should handle uml code model with class variables", () => {
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

            umlCodeModel.nodes.setValue(foo.name, foo);
            umlCodeModel.nodes.setValue(bar.name, bar);

            expect(executeCut()).to.not.throw;

            const foovariables = returnValue.match(/^\s*class Foo\s*{([^}]*)}\s*$/m)[1];
            const barvariables = returnValue.match(/^\s*class Bar\s*{([^}]*)}\s*$/m)[1];

            expect(returnValue).to.match(/^@startuml$/m);
            expect(foovariables).to.match(/^\s*foo1 : string$/m);
            expect(foovariables).to.match(/^\s*foo2 : number\[\]$/m);
            expect(barvariables).to.match(/^\s*bar1 : string$/m);
            expect(barvariables).to.match(/^\s*bar2 : number$/m);
            expect(returnValue).to.match(/^@enduml$/m);
        });

    });
});
