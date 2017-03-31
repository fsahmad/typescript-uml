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
            expect(returnValue).to.match(/^\s*class Foo\s*$/m);
            expect(returnValue).to.match(/^\s*class Bar\s*$/m);
            expect(returnValue).to.match(/^@enduml$/m);
        });

        it("should handle uml code model with unassociated interfaces", () => {
            const foo = new Uml.Class("Foo", Uml.Stereotype.Interface);
            const bar = new Uml.Class("Bar", Uml.Stereotype.Interface);
            umlCodeModel.nodes.setValue(foo.name, foo);
            umlCodeModel.nodes.setValue(bar.name, bar);

            expect(executeCut()).to.not.throw;

            expect(returnValue).to.match(/^@startuml$/m);
            expect(returnValue).to.match(/^\s*interface Foo\s*$/m);
            expect(returnValue).to.match(/^\s*interface Bar\s*$/m);
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
            expect(returnValue).to.match(/^\s*class Foo\s*$/m);
            expect(returnValue).to.match(/^\s*class Bar\s*$/m);
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
            expect(returnValue).to.match(/^\s*class Foo\s*$/m);
            expect(returnValue).to.match(/^\s*interface IBar\s*$/m);
            expect(returnValue).to.match(/^\s*IBar\s*<|--\s*Foo\s*$/m);
            expect(returnValue).to.match(/^@enduml$/m);
        });

    });
});
