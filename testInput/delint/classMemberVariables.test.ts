declare var value;

class Foo {
    // Test class
    private _implicitAny;
    private _predefinedType: number;
    private _typeReference: Bar;
    private _genericTypeReference: TBar<string, number>;
    private _objectType: {
        id: number,
        name: string,
    };
    private _arrayType: number[];
    private _tupleType: [number, string, Bar];
    private _typeQuery: typeof value;
    private _thisType: this;

    private _unionType: string | number | Bar;
    private _intersectionType: Bar & Baz;

    protected protectedVariable: Baz;

    public publicVariable: string;

    implicitPublicVariable: string;
}
