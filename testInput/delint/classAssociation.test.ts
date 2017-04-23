
class Foo {
    private _association: Bar;
    private _arrayAssociation: Array<IQux>;
    private _genericAssociation: Waldo<Quuz>;
    private _tupleAssociation: [Corge, Grault];
    private _bidirectionalAssociation: Qux;
    private _unionAssociation: number | Baz;
    private _intersectionAssociation: IBar & IBaz;
}

class Bar {

}

class Baz {

}

class Qux {
    private _bidirectionalAssociation: Foo;
}

class Quuz {

}

class Waldo<T> {

}

class Corge {

}

class Grault {

}

interface IBar {

}

interface IBaz {

}

interface IQux {

}
